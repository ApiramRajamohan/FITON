using System.Threading.Tasks;
using FITON.Server.Controllers;
using FITON.Server.Models;
using FITON.Server.Utils.Database;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace FITON.Tests
{
 public class VirtualTryOnPromptTests
 {
 private AppDbContext GetDb()
 {
 var options = new DbContextOptionsBuilder<AppDbContext>()
 .UseInMemoryDatabase(System.Guid.NewGuid().ToString())
 .Options;
 return new AppDbContext(options);
 }

 [Fact]
 public void ConstructPrompt_IncludesSkinToneAndClothing()
 {
 var db = GetDb();
 var controller = new VirtualTryOnController(db, null!); // we only call ConstructPrompt via reflection
 var m = new Measurement { Height = "170", Weight = "70", SkinColor = "olive", Waist = "80", Hips = "95" };
 var w = new Wardrobe { FullOutfitClothes = new Outfit { Name = "Dress", Color = "Red" } };
 var method = typeof(VirtualTryOnController).GetMethod("ConstructPrompt", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
 var prompt = (string)method.Invoke(controller, new object[] { m, w });
 Assert.Contains("olive complexion", prompt);
 Assert.Contains("a stylish Red Dress", prompt);
 }
 }
}
