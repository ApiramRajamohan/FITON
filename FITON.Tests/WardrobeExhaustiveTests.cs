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
 public class WardrobeExhaustiveTests
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
 public async Task CreateWardrobe_Succeeds_WhenClothesExistAndBelongToUser()
 {
 var db = GetDb();
 var user = new User { Id =101, Username = "u101", Email = "u101@test", PasswordHash = "x" };
 db.Users.Add(user);
 db.Outfits.Add(new Outfit { Id =201, Name = "Top1", UserId = user.Id, Type = "shirt" });
 await db.SaveChangesAsync();

 var controller = GetController(db, user.Id);
 var dto = new SaveWardrobeDto { Name = "Set", TopClothesId =201 };
 var action = await controller.CreateWardrobe(dto);
 var actionResult = Assert.IsType<ActionResult<WardrobeResponseDto>>(action);
 var ok = Assert.IsType<OkObjectResult>(actionResult.Result);
 var response = Assert.IsType<WardrobeResponseDto>(ok.Value);
 Assert.True(response.Success);
 Assert.Equal("Set", response.Data?.Name);
 }

 [Fact]
 public async Task CreateWardrobe_Fails_WhenSelectedOutfitNotOwned()
 {
 var db = GetDb();
 // outfit belongs to another user
 db.Users.Add(new User { Id =1, Username = "owner", Email = "o@test", PasswordHash = "x" });
 db.Outfits.Add(new Outfit { Id =300, Name = "OtherTop", UserId =1, Type = "shirt" });
 db.Users.Add(new User { Id =2, Username = "requester", Email = "r@test", PasswordHash = "x" });
 await db.SaveChangesAsync();

 var controller = GetController(db,2);
 var dto = new SaveWardrobeDto { Name = "BadSet", TopClothesId =300 };
 var action = await controller.CreateWardrobe(dto);
 var result = Assert.IsType<ActionResult<WardrobeResponseDto>>(action);
 // Expect BadRequest wrapped in ActionResult
 Assert.False(result.Result is OkObjectResult && result.Value?.Success == true);
 }

 [Fact]
 public async Task UpdateWardrobe_Succeeds_WhenOwned()
 {
 var db = GetDb();
 var user = new User { Id =50, Username = "u50", Email = "u50@test", PasswordHash = "x" };
 db.Users.Add(user);
 var outfit = new Outfit { Id =500, Name = "TopX", UserId = user.Id, Type = "shirt" };
 db.Outfits.Add(outfit);
 var wardrobe = new Wardrobe { Id =600, Name = "Old", UserId = user.Id, TopClothesId = outfit.Id };
 db.Wardrobes.Add(wardrobe);
 await db.SaveChangesAsync();

 var controller = GetController(db, user.Id);
 var dto = new UpdateWardrobeDto { Name = "New", TopClothesId = outfit.Id };
 var action = await controller.UpdateWardrobe(wardrobe.Id, dto);
 var res = Assert.IsType<ActionResult<WardrobeResponseDto>>(action);
 var ok = Assert.IsType<OkObjectResult>(res.Result);
 var resp = Assert.IsType<WardrobeResponseDto>(ok.Value);
 Assert.True(resp.Success);
 Assert.Equal("New", resp.Data?.Name);
 }

 [Fact]
 public async Task UpdateWardrobe_NotFound_WhenNotOwned()
 {
 var db = GetDb();
 db.Users.Add(new User { Id =7, Username = "u7", Email = "u7@test", PasswordHash = "x" });
 db.Users.Add(new User { Id =8, Username = "u8", Email = "u8@test", PasswordHash = "x" });
 db.Wardrobes.Add(new Wardrobe { Id =800, Name = "Other", UserId =7 });
 await db.SaveChangesAsync();

 var controller = GetController(db,8);
 var dto = new UpdateWardrobeDto { Name = "X", TopClothesId = null };
 var action = await controller.UpdateWardrobe(800, dto);
 var res = Assert.IsType<ActionResult<WardrobeResponseDto>>(action);
 Assert.True(res.Result is NotFoundObjectResult);
 }

 [Fact]
 public async Task GetWardrobe_NotFound_WhenMissing()
 {
 var db = GetDb();
 var controller = GetController(db,900);
 var action = await controller.GetWardrobe(9999);
 var res = Assert.IsType<ActionResult<WardrobeResponseDto>>(action);
 Assert.True(res.Result is NotFoundObjectResult);
 }

 [Fact]
 public async Task GetWardrobes_ReturnsList()
 {
 var db = GetDb();
 var user = new User { Id =42, Username = "u42", Email = "u42@test", PasswordHash = "x" };
 db.Users.Add(user);
 db.Wardrobes.Add(new Wardrobe { Id =1001, Name = "A", UserId = user.Id });
 db.Wardrobes.Add(new Wardrobe { Id =1002, Name = "B", UserId = user.Id });
 await db.SaveChangesAsync();

 var controller = GetController(db, user.Id);
 var action = await controller.GetWardrobes();
 // controller returns ActionResult<WardrobeListResponseDto> - handle both Result and Value
 if (action is ActionResult<WardrobeListResponseDto> ar)
 {
 if (ar.Result is OkObjectResult okObj)
 {
 var listResp = Assert.IsType<WardrobeListResponseDto>(okObj.Value);
 Assert.True(listResp.Success);
 Assert.True(listResp.Data.Count >=2);
 }
 else if (ar.Value != null)
 {
 var listResp = ar.Value;
 Assert.True(listResp.Success);
 Assert.True(listResp.Data.Count >=2);
 }
 else
 {
 throw new Xunit.Sdk.XunitException("Unexpected ActionResult shape returned from GetWardrobes");
 }
 }
 else
 {
 throw new Xunit.Sdk.XunitException("GetWardrobes did not return ActionResult<WardrobeListResponseDto>");
 }
 }
 }
}
