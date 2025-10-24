using FITON.Server.DTOs;
using FITON.Server.Models;
using FITON.Server.Utils.Database;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;
    private readonly IWebHostEnvironment _env;

    public AuthController(AppDbContext db, IConfiguration config, IWebHostEnvironment env)
    {
        _db = db;
        _config = config;
        _env = env;
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (await _db.Users.AnyAsync(u => u.Username == dto.Username || u.Email == dto.Email))
            return BadRequest("Username or Email already exists");

        var user = new User
        {
            Username = dto.Username,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Registration successful", username = user.Username });
    }
    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        Console.WriteLine($"Login attempt for email: {dto.Email}");
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return Unauthorized(new { Error = "Invalid credentials" });

        var jwt = await SetTokens(user);
        return Ok(new { username = user.Username, token = jwt });
    }
    [AllowAnonymous]
    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh()
    {
        if (!Request.Cookies.TryGetValue("refreshToken", out var token))
        {
            Console.WriteLine("No refresh token cookie found");
            return Unauthorized(new { error = "No refresh token" });
        }
        Console.WriteLine($"Refresh token received: {token}");
        var refreshToken = await _db.RefreshTokens
            .Include(rt => rt.User)
            .FirstOrDefaultAsync(rt => rt.Token == token && !rt.IsRevoked);

        if (refreshToken == null || refreshToken.Expires < DateTime.UtcNow)
            return Unauthorized(new { error = "Refresh token invalid or expired" });

        var jwt = await SetTokens(refreshToken.User);

        return Ok(new
        {
            refreshToken.User.Id,
            refreshToken.User.Username,
            refreshToken.User.Email,
            token = jwt // ✅ always include this
        });
    }


    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        if (Request.Cookies.TryGetValue("refreshToken", out var token))
        {
            var refreshToken = await _db.RefreshTokens.FirstOrDefaultAsync(rt => rt.Token == token);
            if (refreshToken != null)
            {
                refreshToken.IsRevoked = true;
                await _db.SaveChangesAsync();
            }
        }

        Response.Cookies.Delete("refreshToken", new CookieOptions { Path = "/" });

        return Ok(new { Message = "Logged out" });
    }

    // ================== Helpers ==================
    private async Task<string> SetTokens(User user)
    {
        // Remove expired tokens
        var expiredTokens = _db.RefreshTokens.Where(rt => rt.UserId == user.Id && rt.Expires < DateTime.UtcNow);
        _db.RefreshTokens.RemoveRange(expiredTokens);

        // Generate refresh token
        var refreshToken = new RefreshToken
        {
            Token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64)),
            UserId = user.Id,
            Expires = DateTime.UtcNow.AddDays(7)
        };

        _db.RefreshTokens.Add(refreshToken);
        await _db.SaveChangesAsync();

        // Set HttpOnly cookie
        bool isProd = !_env.IsDevelopment();
        Response.Cookies.Append("refreshToken", refreshToken.Token, new CookieOptions
        {
            HttpOnly = true,
            Secure = isProd,
            SameSite = isProd ? SameSiteMode.None : SameSiteMode.Lax,
            Expires = refreshToken.Expires,
            Path = "/"
        });

        // Generate JWT
        return GenerateJwtToken(user);
    }

    private string GenerateJwtToken(User user, int minutes = 15)
    {
        var claims = new[]
        {
        new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
        new Claim(JwtRegisteredClaimNames.UniqueName, user.Username),
        new Claim(JwtRegisteredClaimNames.Email, user.Email),
        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()) // Keep this as backup
    };

        var secret = _config.GetValue<string>("Secret") ?? _config["Jwt:Key"];
        if (string.IsNullOrEmpty(secret))
            throw new InvalidOperationException("JWT secret key is not configured");
        var key = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            notBefore: DateTime.UtcNow,
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(minutes),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

// DTOs
public class RegisterDto { public string Username { get; set; } = null!; public string Email { get; set; } = null!; public string Password { get; set; } = null!; }
public class LoginDto { public string Email { get; set; } = null!; public string Password { get; set; } = null!; }
