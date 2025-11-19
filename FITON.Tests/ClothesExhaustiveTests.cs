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
using System.Linq;

namespace FITON.Tests
{
 public class ClothesExhaustiveTests
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
 public async Task SaveOutfit_Succeeds()
 {
 var db = GetDb();
 db.Users.Add(new User { Id =70, Username = "cuser", Email = "c@test", PasswordHash = "x" });
 await db.SaveChangesAsync();
 var controller = GetController(db,70);
 var dto = new SaveOutfitDto { Name = "NewShirt", Category = "Casual", Type = "shirt", Color = "Red" };
 var res = await controller.SaveOutfit(dto);
 var ok = Assert.IsType<OkObjectResult>(res);
 var saved = Assert.IsType<OutfitResponseDto>(ok.Value);
 Assert.Equal("NewShirt", saved.Name);
 }

 [Fact]
 public async Task UpdateOutfit_NotFound_WhenNotOwned()
 {
 var db = GetDb();
 db.Outfits.Add(new Outfit { Id =77, Name = "O", UserId =999 });
 await db.SaveChangesAsync();
 var controller = GetController(db,88);
 var dto = new SaveOutfitDto { Name = "X", Category = "C", Type = "shirt", Color = "Blue" };
 var res = await controller.UpdateOutfit(77, dto);
 Assert.IsType<NotFoundObjectResult>(res);
 }

 [Fact]
 public async Task DeleteOutfit_NotFound_WhenMissing()
 {
 var db = GetDb();
 var controller = GetController(db,200);
 var res = await controller.DeleteOutfit(9999);
 Assert.IsType<NotFoundObjectResult>(res);
 }
 }
}
