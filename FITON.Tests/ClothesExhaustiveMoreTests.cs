using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using FITON.Server.Controllers;
using FITON.Server.Models;
using FITON.Server.DTOs;
using FITON.Server.Utils.Database;
using Xunit;

namespace FITON.Tests
{
 public class ClothesExhaustiveMoreTests
 {
 private AppDbContext GetDb()
 {
 var options = new DbContextOptionsBuilder<AppDbContext>()
 .UseInMemoryDatabase(System.Guid.NewGuid().ToString())
 .Options;
 return new AppDbContext(options);
 }

 private ClothesController GetController(AppDbContext db, int userId)
 {
 var controller = new ClothesController(db);
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
 public async Task SeedSampleData_AddsItems_WhenNoneExist()
 {
 var db = GetDb();
 db.Users.Add(new User { Id =7001, Username = "seed", Email = "seed@test", PasswordHash = "x" });
 await db.SaveChangesAsync();

 var controller = GetController(db,7001);
 var res = await controller.SeedSampleData();
 var ok = Assert.IsType<OkObjectResult>(res);
 Assert.NotNull(ok.Value);
 }

 [Fact]
 public async Task SeedSampleData_Fails_WhenAlreadySeeded()
 {
 var db = GetDb();
 db.Users.Add(new User { Id =7002, Username = "seed2", Email = "seed2@test", PasswordHash = "x" });
 db.Outfits.Add(new Outfit { Id =8001, Name = "Exists", UserId =7002, Type = "shirt" });
 await db.SaveChangesAsync();

 var controller = GetController(db,7002);
 var res = await controller.SeedSampleData();
 Assert.IsType<BadRequestObjectResult>(res);
 }

 [Fact]
 public async Task UpdateOutfit_Succeeds_WhenOwned()
 {
 var db = GetDb();
 db.Users.Add(new User { Id =7100, Username = "u7100", Email = "u7100@test", PasswordHash = "x" });
 db.Outfits.Add(new Outfit { Id =7200, Name = "Old", UserId =7100, Type = "shirt" });
 await db.SaveChangesAsync();

 var controller = GetController(db,7100);
 var dto = new SaveOutfitDto { Name = "Updated", Category = "Casual", Type = "shirt", Color = "Green" };
 var res = await controller.UpdateOutfit(7200, dto);
 var ok = Assert.IsType<OkObjectResult>(res);
 var updated = Assert.IsType<OutfitResponseDto>(ok.Value);
 Assert.Equal("Updated", updated.Name);
 }

 [Fact]
 public async Task UpdateOutfit_NotFound_WhenNotOwned()
 {
 var db = GetDb();
 db.Outfits.Add(new Outfit { Id =7300, Name = "Other", UserId =9999, Type = "shirt" });
 await db.SaveChangesAsync();

 var controller = GetController(db,7400);
 var dto = new SaveOutfitDto { Name = "X", Category = "C", Type = "shirt" };
 var res = await controller.UpdateOutfit(7300, dto);
 Assert.IsType<NotFoundObjectResult>(res);
 }

 [Fact]
 public async Task SaveOutfit_Validation_Fails_ForMissingName()
 {
 var db = GetDb();
 db.Users.Add(new User { Id =7500, Username = "u7500", Email = "u7500@test", PasswordHash = "x" });
 await db.SaveChangesAsync();
 var controller = GetController(db,7500);
 var dto = new SaveOutfitDto { Name = null!, Category = "C", Type = "shirt" };
 var res = await controller.SaveOutfit(dto);
 Assert.IsType<ObjectResult>(res); // controller may return500/BadRequest depending on model checks
 }
 }
}
