using System.Threading.Tasks;
using FITON.Server.Controllers;
using FITON.Server.Models;
using FITON.Server.Utils.Database;
using Microsoft.EntityFrameworkCore;
using Xunit;
using System.Reflection;

namespace FITON.Tests
{
 public class VirtualTryOnPromptMoreTests
 {
 private AppDbContext GetDb()
 {
 var options = new DbContextOptionsBuilder<AppDbContext>()
 .UseInMemoryDatabase(System.Guid.NewGuid().ToString())
 .Options;
 return new AppDbContext(options);
 }

 private string CallConstructPrompt(Measurement m, Wardrobe w)
 {
 var controller = new VirtualTryOnController(GetDb(), null!);
 var method = typeof(VirtualTryOnController).GetMethod("ConstructPrompt", BindingFlags.NonPublic | BindingFlags.Instance);
 return (string)method.Invoke(controller, new object[] { m, w });
 }

 [Fact]
 public void Prompt_Includes_BMI_Description_Slim()
 {
 var m = new Measurement { Height = "180", Weight = "55" };
 var w = new Wardrobe { TopClothes = new Outfit { Name = "T", Color = "Blue" } };
 var p = CallConstructPrompt(m, w);
 Assert.Contains("slim build", p);
 }

 [Fact]
 public void Prompt_Includes_BMI_Description_Curvy()
 {
 var m = new Measurement { Height = "160", Weight = "90" };
 var w = new Wardrobe { TopClothes = new Outfit { Name = "T", Color = "Blue" } };
 var p = CallConstructPrompt(m, w);
 Assert.Contains("curvy build", p);
 }

 [Fact]
 public void Prompt_Includes_Accessories_WhenProvided()
 {
 var m = new Measurement { Height = "170", Weight = "70" };
 var w = new Wardrobe { Accessories = "Necklace", TopClothes = new Outfit { Name = "T", Color = "Blue" } };
 var p = CallConstructPrompt(m, w);
 Assert.Contains("Accessories: Necklace", p);
 }
 }
}
