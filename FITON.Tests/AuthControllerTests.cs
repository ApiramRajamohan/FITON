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
        var request = new { Email = "newuser@example.com", Password = "StrongPass123!", Name = "Apiram" };

        var response = await _client.PostAsJsonAsync("/api/Auth/register", request);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task Register_ShouldFail_ForDuplicateEmail()
    {
        var user = new { Email = "newuser@example.com", Password = "Abc123!", Name = "User" };
        await _client.PostAsJsonAsync("/api/Auth/register", user);
        var response = await _client.PostAsJsonAsync("/api/Auth/register", user);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Login_ShouldReturnJwt_ForValidUser()
    {
        var user = new { Email = "loginuser@example.com", Password = "Pass123!" };
        await _client.PostAsJsonAsync("/api/Auth/register", user);
        var response = await _client.PostAsJsonAsync("/api/Auth/login", user);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var json = await response.Content.ReadFromJsonAsync<dynamic>();
        string token = json?.token;
        token.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task Login_ShouldFail_ForInvalidPassword()
    {
        var user = new { Email = "fail@example.com", Password = "RightPass1!" };
        await _client.PostAsJsonAsync("/api/Auth/register", user);
        var wrong = new { Email = "fail@example.com", Password = "WrongPass" };
        var response = await _client.PostAsJsonAsync("/api/Auth/login", wrong);

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
