using System.Threading.Tasks;
using FITON.Server.Services;
using Microsoft.Extensions.Configuration;
using Xunit;
using System;

namespace FITON.Tests
{
 public class VertexImageGeneratorMoreTests
 {
 [Fact]
 public async Task GenerateImageAsync_Throws_WhenProjectMissing()
 {
 var settings = new System.Collections.Generic.Dictionary<string, string?>
 {
 { "GoogleCloud:ProjectId", null },
 { "GoogleCloud:Location", null }
 };
 var config = new ConfigurationBuilder().AddInMemoryCollection(settings).Build();
 var gen = new VertexImageGenerator(config);
 await Assert.ThrowsAsync<InvalidOperationException>(async () => await gen.GenerateImageAsync("x"));
 }
 }
}
