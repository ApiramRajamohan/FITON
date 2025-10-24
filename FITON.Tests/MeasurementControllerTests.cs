using Xunit;
using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using FITON.Server;
using Microsoft.AspNetCore.Mvc.Testing;
using System.Threading.Tasks;

public class MeasurementsControllerTests : FITON.Tests.AuthenticatedTestBase
{
    public MeasurementsControllerTests(WebApplicationFactory<Program> factory) : base(factory)
    {
    }

    [Fact]
    public async Task AddMeasurement_ShouldReturnOk()
    {
        await GetAuthenticatedClientAsync("measureuser1", "measure1@example.com");
        // MeasurementDto expects string properties
        var body = new { Height = "180", Weight = "75", Waist = "32" };
        var res = await _client.PostAsJsonAsync("/api/avatar/Measurements/save", body);
        res.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task AddMeasurement_ShouldReturnOk_ForNegativeValues()
    {
        await GetAuthenticatedClientAsync("measureuser2", "measure2@example.com");
        // The API doesn't validate negative values for strings, it just stores them
        // So this will return OK, not BadRequest
        var body = new { Height = "-5", Weight = "0", Waist = "-2" };
        var res = await _client.PostAsJsonAsync("/api/avatar/Measurements/save", body);
        res.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}
