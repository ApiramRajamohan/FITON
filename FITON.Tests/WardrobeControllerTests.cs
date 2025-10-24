using Xunit;
using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using FITON.Server;
using Microsoft.AspNetCore.Mvc.Testing;
using System.Threading.Tasks;

public class WardrobeControllerTests : FITON.Tests.AuthenticatedTestBase
{
    public WardrobeControllerTests(WebApplicationFactory<Program> factory) : base(factory)
    {
    }

    [Fact]
    public async Task GetWardrobes_ShouldReturnOk()
    {
        await GetAuthenticatedClientAsync("wardrobeuser1", "wardrobe1@example.com");
        var res = await _client.GetAsync("/api/Wardrobe");
        res.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task AddItem_ShouldReturnBadRequest_ForInvalidData()
    {
        await GetAuthenticatedClientAsync("wardrobeuser2", "wardrobe2@example.com");
        // Wardrobe requires at least one clothing ID, so sending Name/Size should fail
        var item = new { Name = "Shirt", Size = "L" };
        var res = await _client.PostAsJsonAsync("/api/Wardrobe", item);
        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}
