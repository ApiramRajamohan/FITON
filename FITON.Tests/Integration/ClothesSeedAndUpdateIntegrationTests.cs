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
using System.Linq;

namespace FITON.Tests.Integration
{
 public class ClothesSeedAndUpdateIntegrationTests : IClassFixture<TestWebApplicationFactory>
 {
 private readonly TestWebApplicationFactory _factory;
 public ClothesSeedAndUpdateIntegrationTests(TestWebApplicationFactory factory) => _factory = factory;

 [Fact]
 public async Task SeedSampleData_EndToEnd_ThenUpdateOutfit()
 {
 var client = _factory.CreateClient();

 // Ensure seeded test user and clean DB
 using (var scope = _factory.Services.CreateScope())
 {
 var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
 db.Database.EnsureCreated();
 if (!db.Users.Any(u => u.Id ==1)) db.Users.Add(new User { Id=1, Username="seeduser", Email="seed@test", PasswordHash="x" });
 await db.SaveChangesAsync();
 }

 // Call seed endpoint
 var seedRes = await client.PostAsync("/api/Clothes/seed-sample-data", null);
 var seedBody = await seedRes.Content.ReadAsStringAsync();
 if (!seedRes.IsSuccessStatusCode)
 {
 throw new Xunit.Sdk.XunitException($"Seed endpoint failed: {seedRes.StatusCode} - {seedBody}");
 }

 // Get outfits, pick one to update
 var outfitsRes = await client.GetAsync("/api/Clothes");
 var outfitsBody = await outfitsRes.Content.ReadAsStringAsync();
 if (!outfitsRes.IsSuccessStatusCode)
 {
 throw new Xunit.Sdk.XunitException($"Get outfits failed: {outfitsRes.StatusCode} - {outfitsBody}");
 }
 var list = await outfitsRes.Content.ReadFromJsonAsync<System.Collections.Generic.List<System.Text.Json.JsonElement>>();
 Assert.NotNull(list);
 System.Text.Json.JsonElement first = default;
 if (list.Count >0) first = list[0];
 else throw new Xunit.Sdk.XunitException("No outfits returned after seeding");

 int id =0;
 if (first.ValueKind == System.Text.Json.JsonValueKind.Object)
 {
 if (first.TryGetProperty("Id", out var idProp) && idProp.ValueKind == System.Text.Json.JsonValueKind.Number)
 {
 id = idProp.GetInt32();
 }
 else if (first.TryGetProperty("id", out var idProp2) && idProp2.ValueKind == System.Text.Json.JsonValueKind.Number)
 {
 id = idProp2.GetInt32();
 }
 }

 // Fallback to DB if JSON shape different
 if (id ==0)
 {
 using var scope = _factory.Services.CreateScope();
 var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
 var outfit = await db.Outfits.OrderBy(o => o.Id).FirstOrDefaultAsync(o => o.UserId ==1);
 if (outfit == null) throw new Xunit.Sdk.XunitException("No outfit found in DB after seeding");
 id = outfit.Id;
 }

 // Update outfit payload
 var updatePayload = new { Name = "UpdatedSeed", Category = "Casual", Type = "shirt", Color = "Green" };
 var updateRes = await client.PutAsJsonAsync($"/api/Clothes/{id}", updatePayload);
 var updateBody = await updateRes.Content.ReadAsStringAsync();
 if (!updateRes.IsSuccessStatusCode)
 {
 throw new Xunit.Sdk.XunitException($"Update failed: {updateRes.StatusCode} - {updateBody}");
 }
 var updatedJson = await updateRes.Content.ReadFromJsonAsync<System.Text.Json.JsonDocument>();
 Assert.NotNull(updatedJson);
 }
 }
}
