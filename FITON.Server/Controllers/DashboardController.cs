using FITON.Server.Utils.Database;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FITON.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController :ControllerBase
    {
        private readonly AppDbContext _db;

        public DashboardController(AppDbContext db)
        {
            _db = db;
        }

<<<<<<< Updated upstream
=======
        [HttpGet("user-profile")]
        public async Task<IActionResult> GetUserProfile()
        {
            var userIdString = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
            if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out var userId))
            {
                // Debug: capture claims to help diagnose missing sub claim
                var claims = User?.Claims?.Select(c => new { c.Type, c.Value })?.ToList();
                return Unauthorized(new { error = "User ID not found in token", claims });
            }

            var user = await _context.Users
                .Include(u => u.Measurement)
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return NotFound("User not found.");
            }

            return Ok(new
            {
                user.Id,
                user.Username,
                user.Email,
                user.IsAdmin,
                Measurements = user.Measurement
            });
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetUserStats()
        {
            var userIdString = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
            if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out var userId))
            {
                var claims = User?.Claims?.Select(c => new { c.Type, c.Value })?.ToList();
                return Unauthorized(new { error = "User ID not found in token", claims });
            }

            var hasMeasurements = await _context.Measurements.AnyAsync(m => m.UserId == userId);
            var user = await _context.Users.FindAsync(userId);

            return Ok(new
            {
                HasMeasurements = hasMeasurements,
                IsAdmin = user?.IsAdmin ?? false,
                ProfileComplete = hasMeasurements
            });
        }

        [Authorize]
        [HttpGet("admin/users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var userIdString = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
            if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out var userId))
            {
                return Unauthorized();
            }

            var currentUser = await _context.Users.FindAsync(userId);
            if (currentUser == null || !currentUser.IsAdmin)
            {
                return Forbid("Admin access required.");
            }

            var users = await _context.Users
                .Include(u => u.Measurement)
                .Select(u => new
                {
                    u.Id,
                    u.Username,
                    u.Email,
                    u.IsAdmin,
                    HasMeasurements = u.Measurement != null
                })
                .ToListAsync();

            return Ok(users);
        }
>>>>>>> Stashed changes
    }
}
