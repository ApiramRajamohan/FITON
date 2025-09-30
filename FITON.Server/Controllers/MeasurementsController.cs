using FITON.Server.DTOs;
using FITON.Server.Models;
using FITON.Server.Utils.Database;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace FITON.Server.Controllers
{
    [Authorize]
    [Route("api/avatar/[controller]")]
    [ApiController]
    public class MeasurementsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MeasurementsController(AppDbContext context) => _context = context;

        private int GetUserIdFromToken()
        {
            var userIdStr = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
            if (!int.TryParse(userIdStr, out var userId))
                throw new UnauthorizedAccessException("User ID not found in token");
            return userId;
        }

        [HttpGet("retrive")]
        public async Task<IActionResult> GetMeasurements()
        {
            var userId = GetUserIdFromToken();
            var measurement = await _context.Measurements.AsNoTracking().FirstOrDefaultAsync(m => m.UserId == userId);
            if (measurement == null) return NotFound("No measurements found for this user.");
            return Ok(measurement);
        }

        [HttpPost("save")]
        public async Task<IActionResult> SaveMeasurements([FromBody] MeasurementDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var userId = GetUserIdFromToken();
            var existing = await _context.Measurements.FirstOrDefaultAsync(m => m.UserId == userId);

            if (existing != null)
            {
                // Update all optional fields dynamically
                existing.Height = dto.Height;
                existing.Weight = dto.Weight;
                existing.Chest = dto.Chest;
                existing.Waist = dto.Waist;
                existing.Hips = dto.Hips;
                existing.Shoulders = dto.Shoulders;
                existing.NeckCircumference = dto.NeckCircumference;
                existing.SleeveLength = dto.SleeveLength;
                existing.Inseam = dto.Inseam;
                existing.Thigh = dto.Thigh;
                existing.SkinColor = dto.SkinColor;
                existing.Description = dto.Description;

                _context.Measurements.Update(existing);
                await _context.SaveChangesAsync();
                return Ok(existing);
            }

            var newMeasurement = new Measurement
            {
                UserId = userId,
                Height = dto.Height,
                Weight = dto.Weight,
                Chest = dto.Chest,
                Waist = dto.Waist,
                Hips = dto.Hips,
                Shoulders = dto.Shoulders,
                NeckCircumference = dto.NeckCircumference,
                SleeveLength = dto.SleeveLength,
                Inseam = dto.Inseam,
                Thigh = dto.Thigh,
                SkinColor = dto.SkinColor,
                Description = dto.Description
            };

            await _context.Measurements.AddAsync(newMeasurement);
            await _context.SaveChangesAsync();

            return Ok(newMeasurement);
        }

        [HttpDelete("remove")]
        public async Task<IActionResult> DeleteMeasurements()
        {
            var userId = GetUserIdFromToken();
            var measurement = await _context.Measurements.FirstOrDefaultAsync(m => m.UserId == userId);
            if (measurement == null) return NotFound("No measurements to delete.");

            _context.Measurements.Remove(measurement);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Measurements deleted successfully." });
        }
    }
}
