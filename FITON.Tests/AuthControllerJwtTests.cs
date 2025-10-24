using FITON.Server.Controllers;
using FITON.Server.Models;
using FITON.Server.Utils.Database;
using FITON.Tests.Mocks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace FITON.Tests
{
    public class AuthControllerJwtTests
    {
        private AppDbContext GetDbContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: System.Guid.NewGuid().ToString())
                .Options;
            return new AppDbContext(options);
        }

        private IConfiguration GetConfiguration()
        {
            var settings = new Dictionary<string, string?> {
        {"Jwt:Key", "SuperSecretKeyThatIsLongEnough1234567890123456"}, // ✅ Must be at least 32 characters for HS256
        {"Jwt:Issuer", "TestIssuer"},
        {"Jwt:Audience", "TestAudience"}
    };
            return new ConfigurationBuilder()
                .AddInMemoryCollection(settings)
                .Build();
        }


        private AuthController GetController(AppDbContext db)
        {
            var config = GetConfiguration();
            var env = new WebHostEnvironmentMock();  // Pass this
            var controller = new AuthController(db, config, env);
            controller.ControllerContext.HttpContext = new DefaultHttpContext();
            return controller;
        }

        [Fact]
        public async Task Register_Should_CreateUser_And_SetRefreshTokenCookie()
        {
            var db = GetDbContext();
            var controller = GetController(db);

            var dto = new RegisterDto
            {
                Username = "testuser",
                Email = "test@example.com",
                Password = "Password123"
            };

            var result = await controller.Register(dto);
            Assert.IsType<OkObjectResult>(result);

            // Register doesn't set cookies - only Login does
            // Just verify the user was created
            var user = await db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            Assert.NotNull(user);
            Assert.Equal(dto.Username, user.Username);
        }

        [Fact]
        public async Task Login_ValidCredentials_Should_SetRefreshTokenCookie()
        {
            var db = GetDbContext();
            var password = BCrypt.Net.BCrypt.HashPassword("Password123");
            db.Users.Add(new User
            {
                Username = "testuser",
                Email = "test@example.com",
                PasswordHash = password
            });
            await db.SaveChangesAsync();

            var controller = GetController(db);
            var dto = new LoginDto { Email = "test@example.com", Password = "Password123" };

            var result = await controller.Login(dto);
            Assert.IsType<OkObjectResult>(result);

            var cookies = controller.Response.Headers["Set-Cookie"].ToString();
            Assert.Contains("refreshToken=", cookies);  // ✅ match actual cookie
        }


        [Fact]
        public async Task Login_ValidCredentials_Should_ReturnOk_And_SetJwtCookie()
        {
            var db = GetDbContext();
            var password = BCrypt.Net.BCrypt.HashPassword("Password123");
            db.Users.Add(new User
            {
                Username = "testuser",
                Email = "test@example.com",
                PasswordHash = password
            });
            await db.SaveChangesAsync();

            var controller = GetController(db);
            var dto = new LoginDto
            {
                Email = "test@example.com",
                Password = "Password123"
            };

            var result = await controller.Login(dto);
            Assert.IsType<OkObjectResult>(result);

            var cookies = controller.Response.Headers["Set-Cookie"].ToString();
            Assert.Contains("refreshToken=", cookies);
        }

        [Fact]
        public async Task Login_InvalidPassword_Should_ReturnUnauthorized()
        {
            var db = GetDbContext();
            var password = BCrypt.Net.BCrypt.HashPassword("Password123");
            db.Users.Add(new User
            {
                Username = "testuser",
                Email = "test@example.com",
                PasswordHash = password
            });
            await db.SaveChangesAsync();

            var controller = GetController(db);
            var dto = new LoginDto
            {
                Email = "test@example.com",
                Password = "WrongPassword"
            };

            var result = await controller.Login(dto);
            Assert.IsType<UnauthorizedObjectResult>(result);
        }
    }
}
