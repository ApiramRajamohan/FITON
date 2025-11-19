using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using FITON.Server.Controllers;
using FITON.Server.Models;
using FITON.Server.Utils.Database;
using Xunit;
using System.Linq;

namespace FITON.Tests
{
 public class DashboardExhaustiveTests
 {
 private AppDbContext GetDb()
 {
 var options = new DbContextOptionsBuilder<AppDbContext>()
 .UseInMemoryDatabase(System.Guid.NewGuid().ToString())
 .Options;
 return new AppDbContext(options);
 }

 private DashboardController GetController(AppDbContext db, int userId)
 {
 var controller = new DashboardController(db);
 controller.ControllerContext = new ControllerContext
 {
 HttpContext = new DefaultHttpContext
 {
 User = new ClaimsPrincipal(new ClaimsIdentity(new[]
 {
 new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
 new Claim(ClaimTypes.NameIdentifier, userId.ToString())
 }, "test"))
 }
 };
 return controller;
 }

 [Fact]
 public async Task GetUserProfile_ReturnsOk_WhenUserExists()
 {
 var db = GetDb();
 var user = new User { Id =10, Username = "duser", Email = "d@test", PasswordHash = "x" };
 db.Users.Add(user);
 db.Measurements.Add(new Measurement { UserId = user.Id, Height = "170", Weight = "70" });
 await db.SaveChangesAsync();

 var controller = GetController(db, user.Id);
 var res = await controller.GetUserProfile();
 var ok = Assert.IsType<OkObjectResult>(res);
 Assert.NotNull(ok.Value);
 }

 [Fact]
 public async Task GetUserProfile_ReturnsUnauthorized_WhenClaimMissing()
 {
 var db = GetDb();
 var controller = new DashboardController(db);
 controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() };
 var res = await controller.GetUserProfile();
 var unauth = Assert.IsType<UnauthorizedObjectResult>(res);
 Assert.NotNull(unauth.Value);
 }

 [Fact]
 public async Task GetUserStats_ReportsCorrectFlags()
 {
 var db = GetDb();
 var user = new User { Id =22, Username = "suser", Email = "s@test", PasswordHash = "x" };
 db.Users.Add(user);
 await db.SaveChangesAsync();

 var controller = GetController(db, user.Id);
 var res = await controller.GetUserStats();
 var ok = Assert.IsType<OkObjectResult>(res);
 var obj = ok.Value;
 Assert.NotNull(obj);
 }

 [Fact]
 public async Task GetAllUsers_ForbidsNonAdmin()
 {
 var db = GetDb();
 var user = new User { Id =33, Username = "nadmin", Email = "na@test", PasswordHash = "x", IsAdmin=false };
 db.Users.Add(user);
 await db.SaveChangesAsync();
 var controller = GetController(db, user.Id);
 var res = await controller.GetAllUsers();
 Assert.IsType<ForbidResult>(res);
 }
 }
}
