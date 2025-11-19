using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using FITON.Server.Services;
using Xunit;
using System;

namespace FITON.Tests
{
 public class VertexImageGeneratorTests
 {
 [Fact]
 public async Task GenerateImageAsync_Throws_WhenNotConfigured()
 {
 var config = new ConfigurationBuilder().AddInMemoryCollection().Build();
 var gen = new VertexImageGenerator(config);
 await Assert.ThrowsAsync<InvalidOperationException>(async () => await gen.GenerateImageAsync("prompt"));
 }
 }
}
