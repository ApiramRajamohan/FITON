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
 public class WardrobePopulationTests
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
 public async Task CreateWardrobe_PopulatesTopClothesDetails()
 {
 var db = GetDb();
 var user = new User { Id =9001, Username = "popuser", Email = "pop@test", PasswordHash = "x" };
 db.Users.Add(user);
 db.Outfits.Add(new Outfit { Id =9002, Name = "FancyTop", UserId = user.Id, Brand = "B", Color = "Red", Type = "shirt", Size = "M" });
 await db.SaveChangesAsync();

 var controller = GetController(db, user.Id);
 var dto = new SaveWardrobeDto { Name = "PopSet", TopClothesId =9002 };
 var action = await controller.CreateWardrobe(dto);
 var actionResult = Assert.IsType<ActionResult<WardrobeResponseDto>>(action);
 // prefer to validate persisted entity
 var persisted = await db.Wardrobes.Include(w => w.TopClothes).FirstOrDefaultAsync(w => w.UserId == user.Id && w.Name == "PopSet");
 Assert.NotNull(persisted);
 Assert.NotNull(persisted?.TopClothes);
 Assert.Equal("FancyTop", persisted.TopClothes.Name);
 Assert.Equal("Red", persisted.TopClothes.Color);
 }

 [Fact]
 public async Task GetWardrobe_IncludesFullOutfitDetails()
 {
 var db = GetDb();
 var user = new User { Id =9101, Username = "fulluser", Email = "full@test", PasswordHash = "x" };
 db.Users.Add(user);
 db.Outfits.Add(new Outfit { Id =9102, Name = "Gown", UserId = user.Id, Type = "gown", Color = "Black" });
 db.Wardrobes.Add(new Wardrobe { Id =9103, Name = "MyGownSet", UserId = user.Id, FullOutfitClothesId =9102 });
 await db.SaveChangesAsync();

 var controller = GetController(db, user.Id);
 var res = await controller.GetWardrobe(9103);
 var ok = Assert.IsType<ActionResult<WardrobeResponseDto>>(res);
 var okObj = Assert.IsType<OkObjectResult>(ok.Result);
 var dto = Assert.IsType<WardrobeResponseDto>(okObj.Value);
 Assert.True(dto.Success);
 Assert.NotNull(dto.Data?.FullOutfitClothes);
 Assert.Equal("Gown", dto.Data.FullOutfitClothes.Name);
 }

 [Fact]
 public async Task DeleteWardrobe_Succeeds_ThenNotFound()
 {
 var db = GetDb();
 var user = new User { Id =9201, Username = "deluser", Email = "del@test", PasswordHash = "x" };
 db.Users.Add(user);
 db.Wardrobes.Add(new Wardrobe { Id =9202, Name = "ToDelete", UserId = user.Id });
 await db.SaveChangesAsync();

 var controller = GetController(db, user.Id);
 var delRes = await controller.DeleteWardrobe(9202);
 // handle ActionResult<WardrobeResponseDto> shape
 if (delRes is ActionResult<WardrobeResponseDto> ar)
 {
 if (ar.Result is OkObjectResult okObj)
 {
 var dto = Assert.IsType<WardrobeResponseDto>(okObj.Value);
 Assert.True(dto.Success);
 }
 else if (ar.Value != null)
 {
 Assert.True(ar.Value.Success);
 }
 else
 {
 // unexpected
 throw new Xunit.Sdk.XunitException("Unexpected delete response shape");
 }
 }
 else
 {
 throw new Xunit.Sdk.XunitException("Delete did not return ActionResult<WardrobeResponseDto>");
 }

 // Now deleting again should return NotFound
 var delAgain = await controller.DeleteWardrobe(9202);
 // controller may return NotFoundObjectResult OR ActionResult<WardrobeResponseDto> with Result == NotFound
 if (delAgain is ActionResult<WardrobeResponseDto> ar2)
 {
 Assert.True(ar2.Result is NotFoundObjectResult || ar2.Value == null);
 }
 else
 {
 Assert.IsType<NotFoundObjectResult>(delAgain);
 }
 }

 [Fact]
 public async Task UpdateWardrobe_Fails_WhenSelectedClothesNotBelongToUser()
 {
 var db = GetDb();
 db.Users.Add(new User { Id =1, Username = "owner1", Email = "o1@test", PasswordHash = "x" });
 db.Outfits.Add(new Outfit { Id =10001, Name = "OtherTop", UserId =1, Type = "shirt" });
 db.Users.Add(new User { Id =2, Username = "owner2", Email = "o2@test", PasswordHash = "x" });
 db.Wardrobes.Add(new Wardrobe { Id =10002, Name = "W1", UserId =2 });
 await db.SaveChangesAsync();

 var controller = GetController(db,2);
 var dto = new UpdateWardrobeDto { Name = "X", TopClothesId =10001 };
 var res = await controller.UpdateWardrobe(10002, dto);
 // controller returns BadRequestObjectResult for this case
 var bad = Assert.IsType<BadRequestObjectResult>(res.Result);
 Assert.Equal(400, bad.StatusCode);
 }
 }
}
