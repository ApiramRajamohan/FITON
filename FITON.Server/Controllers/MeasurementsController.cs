using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using FITON.Server.DTOs;
using FITON.Server.Models;
using FITON.Server.Utils.Database;

namespace FITON.Server.Controllers
{
    [Authorize] // Ensures only logged-in users can access this
    [Route("api/avatar/[controller]")]
    [ApiController]
    public class MeasurementsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MeasurementsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/avatar/measurements
        // Gets the measurements for the currently logged-in user
        [HttpGet]
        public async Task<IActionResult> GetMeasurements()
        {
            var userIdString = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
            if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out var userId))
            {
                var claims = User?.Claims?.Select(c => new { c.Type, c.Value })?.ToList();
                return Unauthorized(new { error = "User ID not found in token", claims });
            }

            var measurement = await _context.Measurements
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.UserId == userId);

            if (measurement == null)
            {
                return NotFound("No measurements found for this user.");
            }

            return Ok(measurement);
        }


        // POST: api/avatar/measurements
        // Creates or updates measurements for the currently logged-in user
        [HttpPost]
        public async Task<IActionResult> SaveMeasurements([FromBody] MeasurementDto measurementDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userIdString = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
            if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out var userId))
            {
                var claims = User?.Claims?.Select(c => new { c.Type, c.Value })?.ToList();
                return Unauthorized(new { error = "User ID not found in token", claims });
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            var existingMeasurement = await _context.Measurements
                .FirstOrDefaultAsync(m => m.UserId == userId);
            
            if (existingMeasurement != null)
            {
                // Update existing measurements
                existingMeasurement.Height = measurementDto.Height;
                existingMeasurement.Weight = measurementDto.Weight;
                existingMeasurement.Chest = measurementDto.Chest;
                existingMeasurement.Waist = measurementDto.Waist;
                existingMeasurement.Hips = measurementDto.Hips;
                existingMeasurement.Inseam = measurementDto.Inseam;
                _context.Measurements.Update(existingMeasurement);
            }
            else
            {
                // Create new measurements
                var newMeasurement = new Measurement
                {
                    UserId = userId,
                    Height = measurementDto.Height,
                    Weight = measurementDto.Weight,
                    Chest = measurementDto.Chest,
                    Waist = measurementDto.Waist,
                    Hips = measurementDto.Hips,
                    Inseam = measurementDto.Inseam,
                };
                await _context.Measurements.AddAsync(newMeasurement);
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Measurements saved successfully." });
        }

        // DELETE: api/avatar/measurements
        // Deletes the current user's measurements
        [HttpDelete]
        public async Task<IActionResult> DeleteMeasurements()
        {
            var userIdString = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
            if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out var userId))
            {
                var claims = User?.Claims?.Select(c => new { c.Type, c.Value })?.ToList();
                return Unauthorized(new { error = "User ID not found in token", claims });
            }

            var measurement = await _context.Measurements.FirstOrDefaultAsync(m => m.UserId == userId);
            if (measurement == null)
            {
                return NotFound("No measurements to delete.");
            }

            _context.Measurements.Remove(measurement);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Measurements deleted successfully." });
        }
    }
}
