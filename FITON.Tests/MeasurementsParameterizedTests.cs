using FITON.Server.Controllers;
using FITON.Server.DTOs;
using FITON.Server.Models;
using FITON.Server.Utils.Database;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using System.Threading.Tasks;
using Xunit;

namespace FITON.Tests
{
    public class MeasurementsParameterizedTests
    {
        private AppDbContext GetDbContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(System.Guid.NewGuid().ToString())
                .Options;
            return new AppDbContext(options);
        }

        private MeasurementsController GetController(AppDbContext db, int userId)
        {
            var controller = new MeasurementsController(db);
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
                    {
                        new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
                        new Claim(ClaimTypes.NameIdentifier, userId.ToString())
                    }, "test"))
                }
            };
            return controller;
        }

        // parameterized cases � controller currently accepts most string values, so expect Ok
        [Theory]
        [InlineData("175","70","80","95","olive","desc")]
        [InlineData("150","45","60","85","fair","")]
        public async Task SaveMeasurements_VariousInputs_ValidatePersistence(
            string? height, string? weight, string? waist, string? hips, string? skinColor, string? description)
        {
            var db = GetDbContext();
            var controller = GetController(db,1000);

            var dto = new MeasurementDto
            {
                Height = height,
                Weight = weight,
                Waist = waist,
                Hips = hips,
                SkinColor = skinColor,
                Description = description
            };

            IActionResult result = await controller.SaveMeasurements(dto);

            var ok = Assert.IsType<OkObjectResult>(result);
            var saved = Assert.IsType<Measurement>(ok.Value);
            Assert.Equal(1000, saved.UserId);
        }

        [Fact]
        public async Task SaveMeasurements_UpdateExisting_UpdatesValues()
        {
            var db = GetDbContext();
            var controller = GetController(db,2000);

            // Save initial
            var dto = new MeasurementDto { Height = "160", Weight = "60" };
            var res1 = await controller.SaveMeasurements(dto);
            var ok1 = Assert.IsType<OkObjectResult>(res1);
            var saved1 = Assert.IsType<Measurement>(ok1.Value);
            Assert.Equal("160", saved1.Height);

            // Update
            var updateDto = new MeasurementDto { Height = "165", Weight = "62" };
            var res2 = await controller.SaveMeasurements(updateDto);
            var ok2 = Assert.IsType<OkObjectResult>(res2);
            var saved2 = Assert.IsType<Measurement>(ok2.Value);
            Assert.Equal("165", saved2.Height);
            Assert.Equal(saved1.Id, saved2.Id);
        }
    }
}