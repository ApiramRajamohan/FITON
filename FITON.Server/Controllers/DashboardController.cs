using FITON.Server.Utils.Database;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace FITON.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _db;

        public DashboardController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet("user-profile")]
        public async Task<IActionResult> GetUserProfile()
        {
            // Try multiple possible claim locations for user ID
            var userIdString = User.FindFirstValue(JwtRegisteredClaimNames.Sub) ??
                              User.FindFirstValue(ClaimTypes.NameIdentifier) ??
                              User.FindFirstValue("sub") ??
                              User.FindFirstValue("userid");

            if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out var userId))
            {
                var claims = User?.Claims?.Select(c => new { c.Type, c.Value })?.ToList();
                return Unauthorized(new { error = "User ID not found in token", claims });
            }

            var user = await _db.Users
                .Include(u => u.Measurement)
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return NotFound("User not found.");
            }

            return Ok(new
            {
                user.Id,
                user.Username,
                user.Email,
                user.IsAdmin,
                Measurements = user.Measurement
            });
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetUserStats()
        {
            var userIdString = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
            if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out var userId))
            {
                var claims = User?.Claims?.Select(c => new { c.Type, c.Value })?.ToList();
                return Unauthorized(new { error = "User ID not found in token", claims });
            }

            var hasMeasurements = await _db.Measurements.AnyAsync(m => m.UserId == userId);
            var user = await _db.Users.FindAsync(userId);

            return Ok(new
            {
                HasMeasurements = hasMeasurements,
                IsAdmin = user?.IsAdmin ?? false,
                ProfileComplete = hasMeasurements
            });
        }

        [Authorize]
        [HttpGet("admin/users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var userIdString = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
            if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out var userId))
            {
                return Unauthorized();
            }

            var currentUser = await _db.Users.FindAsync(userId);
            if (currentUser == null || !currentUser.IsAdmin)
            {
                return Forbid("Admin access required.");
            }

            var users = await _db.Users
                .Include(u => u.Measurement)
                .Select(u => new
                {
                    u.Id,
                    u.Username,
                    u.Email,
                    u.IsAdmin,
                    HasMeasurements = u.Measurement != null
                })
                .ToListAsync();

            return Ok(users);
        }
    }
}
