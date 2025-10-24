using Xunit;
using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using FITON.Server;
using Microsoft.AspNetCore.Mvc.Testing;
using System.Threading.Tasks;

public class ClothesControllerTests : FITON.Tests.AuthenticatedTestBase
{
    public ClothesControllerTests(WebApplicationFactory<Program> factory) : base(factory)
    {
    }

    [Fact]
    public async Task GetClothes_ShouldReturnOk()
    {
        await GetAuthenticatedClientAsync("clothesuser1", "clothes1@example.com");
        var res = await _client.GetAsync("/api/Clothes");
        res.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task AddClothing_ShouldReturnCreated()
    {
        await GetAuthenticatedClientAsync("clothesuser2", "clothes2@example.com");
        var item = new { Name = "T-shirt", Size = "M", Color = "Red", Category = "Topwear" };
        var res = await _client.PostAsJsonAsync("/api/Clothes", item);
        res.StatusCode.Should().BeOneOf(HttpStatusCode.Created, HttpStatusCode.OK);
    }

    [Fact]
    public async Task AddClothing_ShouldFail_ForMissingName()
    {
        await GetAuthenticatedClientAsync("clothesuser3", "clothes3@example.com");
        var item = new { Size = "M", Color = "Blue", Category = "Topwear" };
        var res = await _client.PostAsJsonAsync("/api/Clothes", item);
        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}
