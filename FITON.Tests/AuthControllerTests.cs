using Xunit;
using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using FITON.Server;
using Microsoft.AspNetCore.Mvc.Testing;
using System.Threading.Tasks;

public class AuthControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public AuthControllerTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Register_ShouldReturnOk_ForValidUser()
    {
        // Use a unique email to avoid conflicts with other tests
        var uniqueEmail = $"newuser{Guid.NewGuid().ToString().Substring(0, 8)}@example.com";
        var request = new { Username = $"testuser{Guid.NewGuid().ToString().Substring(0, 8)}", Email = uniqueEmail, Password = "StrongPass123!" };

        var response = await _client.PostAsJsonAsync("/api/Auth/register", request);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task Register_ShouldFail_ForDuplicateEmail()
    {
        var user = new { Username = "dupuser", Email = "dup@example.com", Password = "Abc123!" };
        await _client.PostAsJsonAsync("/api/Auth/register", user);
        var response = await _client.PostAsJsonAsync("/api/Auth/register", user);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Login_ShouldReturnJwt_ForValidUser()
    {
        var user = new { Username = "loginuser", Email = "loginuser@example.com", Password = "Pass123!" };
        await _client.PostAsJsonAsync("/api/Auth/register", user);
        var loginDto = new { Email = "loginuser@example.com", Password = "Pass123!" };
        var response = await _client.PostAsJsonAsync("/api/Auth/login", loginDto);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var responseContent = await response.Content.ReadAsStringAsync();
        responseContent.Should().Contain("token");
        responseContent.Should().Contain("username");
    }

    [Fact]
    public async Task Login_ShouldFail_ForInvalidPassword()
    {
        var user = new { Username = "failuser", Email = "fail@example.com", Password = "RightPass1!" };
        await _client.PostAsJsonAsync("/api/Auth/register", user);
        var wrong = new { Email = "fail@example.com", Password = "WrongPass" };
        var response = await _client.PostAsJsonAsync("/api/Auth/login", wrong);

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
