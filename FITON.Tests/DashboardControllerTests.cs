using Xunit;
using System.Net;
using FluentAssertions;
using FITON.Server;
using Microsoft.AspNetCore.Mvc.Testing;
using System.Threading.Tasks;

public class DashboardControllerTests : FITON.Tests.AuthenticatedTestBase
{
    public DashboardControllerTests(WebApplicationFactory<Program> factory) : base(factory)
    {
    }

    [Fact]
    public async Task Dashboard_ShouldReturnOk()
    {
        await GetAuthenticatedClientAsync("dashuser1", "dash1@example.com");
        var res = await _client.GetAsync("/api/Dashboard/user-profile");
        res.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}
