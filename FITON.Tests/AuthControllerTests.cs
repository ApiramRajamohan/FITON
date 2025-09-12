using FITON.Server.Controllers;
using FITON.Server.Models;
using FITON.Server.Utils.Database;
using FITON.Tests.Mocks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace FITON.Tests
{
    public class AuthControllerTests
    {
        private AppDbContext GetDbContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(System.Guid.NewGuid().ToString())
                .Options;
            return new AppDbContext(options);
        }

        private IConfiguration GetConfiguration()
        {
            var inMemorySettings = new Dictionary<string, string?> {
                {"Jwt:Key", "SuperSecretKey1234567890"},
                {"Jwt:Issuer", "TestIssuer"},
                {"Jwt:Audience", "TestAudience"}
            };
            return new ConfigurationBuilder()
                .AddInMemoryCollection(inMemorySettings)
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
        public async Task Register_Should_CreateUser()
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
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Single(db.Users); // Only one user should exist
        }

        [Fact]
        public async Task Login_ValidCredentials_Should_ReturnOk()
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
            var dto = new LoginDto { Email = "test@example.com", Password = "WrongPassword" };
            var result = await controller.Login(dto);

            Assert.IsType<UnauthorizedObjectResult>(result);
        }


    }
}
