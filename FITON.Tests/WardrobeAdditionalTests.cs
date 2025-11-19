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
 public class WardrobeAdditionalTests
 {
 private AppDbContext GetDb()
 {
 var options = new DbContextOptionsBuilder<AppDbContext>()
 .UseInMemoryDatabase(System.Guid.NewGuid().ToString())
 .Options;
 return new AppDbContext(options);
 }

 private WardrobeController GetController(AppDbContext db, int userId)
 {
 var controller = new WardrobeController(db);
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
 public async Task CreateWardrobe_WithBottomOrFull_Succeeds()
 {
 var db = GetDb();
 var user = new User { Id =201, Username = "wuser", Email = "w@test", PasswordHash = "x" };
 db.Users.Add(user);
 db.Outfits.Add(new Outfit { Id =301, Name = "Bottom", UserId = user.Id, Type = "pants" });
 db.Outfits.Add(new Outfit { Id =302, Name = "Dress", UserId = user.Id, Type = "dress" });
 await db.SaveChangesAsync();

 var controller = GetController(db, user.Id);

 var dtoBottom = new SaveWardrobeDto { Name = "BottomSet", BottomClothesId =301 };
 var res1 = await controller.CreateWardrobe(dtoBottom);
 var ok1 = Assert.IsType<ActionResult<WardrobeResponseDto>>(res1);
 Assert.True(ok1.Result is OkObjectResult || ok1.Value?.Success == true);

 var dtoFull = new SaveWardrobeDto { Name = "FullSet", FullOutfitClothesId =302 };
 var res2 = await controller.CreateWardrobe(dtoFull);
 var ok2 = Assert.IsType<ActionResult<WardrobeResponseDto>>(res2);
 Assert.True(ok2.Result is OkObjectResult || ok2.Value?.Success == true);
 }

 [Fact]
 public async Task GetWardrobe_ReturnsDto_WhenExists()
 {
 var db = GetDb();
 var user = new User { Id =401, Username = "ug", Email = "ug@test", PasswordHash = "x" };
 db.Users.Add(user);
 db.Wardrobes.Add(new Wardrobe { Id =501, Name = "MyW", UserId = user.Id });
 await db.SaveChangesAsync();

 var controller = GetController(db, user.Id);
 var action = await controller.GetWardrobe(501);
 var okResult = action.Result as OkObjectResult ?? throw new Xunit.Sdk.XunitException("Expected OkObjectResult");
 var resp = Assert.IsType<WardrobeResponseDto>(okResult.Value);
 Assert.True(resp.Success);
 Assert.Equal("MyW", resp.Data?.Name);
 }

 [Fact]
 public async Task UpdateWardrobe_Fails_WhenNoClothesSelected()
 {
 var db = GetDb();
 var user = new User { Id =601, Username = "u601", Email = "u601@test", PasswordHash = "x" };
 db.Users.Add(user);
 db.Wardrobes.Add(new Wardrobe { Id =701, Name = "Old", UserId = user.Id });
 await db.SaveChangesAsync();

 var controller = GetController(db, user.Id);
 var dto = new UpdateWardrobeDto { Name = "X", TopClothesId = null, BottomClothesId = null, FullOutfitClothesId = null };
 var result = await controller.UpdateWardrobe(701, dto);
 // controller returns BadRequestObjectResult for validation failures
 var bad = Assert.IsType<BadRequestObjectResult>(result.Result);
 Assert.Equal(400, bad.StatusCode);
 }

 [Fact]
 public async Task GetFilteredClothes_ReturnsTopBottomFullLists()
 {
 var db = GetDb();
 var user = new User { Id =800, Username = "uf", Email = "uf@test", PasswordHash = "x" };
 db.Users.Add(user);
 db.Outfits.Add(new Outfit { Id =1001, Name = "ShirtA", UserId = user.Id, Type = "shirt" });
 db.Outfits.Add(new Outfit { Id =1002, Name = "JeansA", UserId = user.Id, Type = "jeans" });
 db.Outfits.Add(new Outfit { Id =1003, Name = "DressA", UserId = user.Id, Type = "dress" });
 await db.SaveChangesAsync();

 var controller = GetController(db, user.Id);
 var top = await controller.GetFilteredClothes("top");
 var topAction = Assert.IsType<ActionResult<OutfitListResponseDto>>(top);
 Assert.False(topAction.Result is BadRequestObjectResult);

 var bottom = await controller.GetFilteredClothes("bottom");
 var bottomAction = Assert.IsType<ActionResult<OutfitListResponseDto>>(bottom);
 Assert.False(bottomAction.Result is BadRequestObjectResult);

 var full = await controller.GetFilteredClothes("full");
 var fullAction = Assert.IsType<ActionResult<OutfitListResponseDto>>(full);
 Assert.False(fullAction.Result is BadRequestObjectResult);
 }
 }
}
