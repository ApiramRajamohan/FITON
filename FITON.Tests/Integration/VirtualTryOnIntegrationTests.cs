using System.Threading.Tasks;
using Xunit;
using FITON.Tests.TestUtilities;
using Microsoft.AspNetCore.Mvc.Testing;
using FITON.Server.Services;
using Moq;
using Microsoft.Extensions.DependencyInjection;
using FITON.Server.Utils.Database;
using FITON.Server.Models;
using Microsoft.EntityFrameworkCore;
using System.Net.Http.Json;
using System.Net;

namespace FITON.Tests.Integration
{
 public class VirtualTryOnIntegrationTests : IClassFixture<TestWebApplicationFactory>
 {
 private readonly TestWebApplicationFactory _factory;
 public VirtualTryOnIntegrationTests(TestWebApplicationFactory factory) => _factory = factory;

 [Fact]
 public async Task GenerateTryOn_EndToEnd_ReturnsImage()
 {
 // Prepare mock IImageGenerator
 var mockGen = new Mock<IImageGenerator>();
 mockGen.Setup(g => g.GenerateImageAsync(It.IsAny<string>())).ReturnsAsync("data:image/png;base64,AAA");

 // Create client replacing IImageGenerator in DI and seed DB in same host
 var client = _factory.WithWebHostBuilder(builder =>
 {
 builder.ConfigureServices(services =>
 {
 // remove existing registration for IImageGenerator if present
 var existing = services.SingleOrDefault(d => d.ServiceType == typeof(IImageGenerator));
 if (existing != null) services.Remove(existing);
 services.AddSingleton<IImageGenerator>(mockGen.Object);

 // Build a temporary provider to get AppDbContext and seed data for this test host
 var sp = services.BuildServiceProvider();
 using (var scope = sp.CreateScope())
 {
 var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
 db.Database.EnsureCreated();
 // seed measurement and outfit and wardrobe for seeded test user (Id =1)
 if (!db.Users.Any(u => u.Id ==1))
 {
 db.Users.Add(new User { Id =1, Username = "rapiram", Email = "rapiram83@gmail.com", PasswordHash = "x" });
 }
 // remove any existing measurements for user to avoid duplicates
 var existingMeasure = db.Measurements.FirstOrDefault(m => m.UserId ==1);
 if (existingMeasure != null) db.Measurements.Remove(existingMeasure);
 db.Measurements.Add(new Measurement { UserId =1, Height = "170", Weight = "70" });
 var outfit = new Outfit { Id =6001, Name = "IntTop", UserId =1, Type = "shirt" };
 if (!db.Outfits.Any(o => o.Id ==6001)) db.Outfits.Add(outfit);
 if (!db.Wardrobes.Any(w => w.Id ==7001)) db.Wardrobes.Add(new Wardrobe { Id =7001, UserId =1, Name = "IntSet", TopClothesId = outfit.Id });
 db.SaveChanges();
 }
 });
 }).CreateClient();

 // Call endpoint
 var res = await client.PostAsJsonAsync("/api/virtual-try-on/generate", new { wardrobeId =7001 });
 if (res.StatusCode != HttpStatusCode.OK)
 {
 var body = await res.Content.ReadAsStringAsync();
 throw new Xunit.Sdk.XunitException($"Virtual try-on endpoint returned {res.StatusCode}: {body}");
 }
 var json = await res.Content.ReadFromJsonAsync<System.Text.Json.JsonDocument>();
 Assert.NotNull(json);
 var root = json.RootElement;
 Assert.True(root.TryGetProperty("imageUrl", out var img));
 Assert.Contains("data:image/png;base64", img.GetString());
 }
 }
}
