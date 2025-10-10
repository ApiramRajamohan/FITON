using FITON.Server.DTOs;
using FITON.Server.Models;
using FITON.Server.Utils.Database;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FITON.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AvatarController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AvatarController(AppDbContext context)
        {
            _context = context;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst("user_id")?.Value;
            if (int.TryParse(userIdClaim, out int userId))
            {
                return userId;
            }
            throw new UnauthorizedAccessException("Invalid user ID in token");
        }

        // GET: api/avatar
        [HttpGet]
        public async Task<ActionResult<AvatarListResponseDto>> GetUserAvatars()
        {
            try
            {
                var userId = GetCurrentUserId();
                
                var avatars = await _context.Avatars
                    .Where(a => a.UserId == userId)
                    .OrderByDescending(a => a.CreatedAt)
                    .ToListAsync();

                var avatarDtos = avatars.Select(a => new AvatarDto
                {
                    Id = a.Id,
                    UserId = a.UserId,
                    Name = a.Name,
                    Height = a.Height,
                    Weight = a.Weight,
                    Chest = a.Chest,
                    Waist = a.Waist,
                    Hips = a.Hips,
                    ShoulderWidth = a.ShoulderWidth,
                    SkinTone = a.SkinTone,
                    HairColor = a.HairColor,
                    EyeColor = a.EyeColor,
                    IsGenerated = a.IsGenerated,
                    GenerationStatus = a.GenerationStatus,
                    CreatedAt = a.CreatedAt,
                    UpdatedAt = a.UpdatedAt
                }).ToList();

                return Ok(new AvatarListResponseDto
                {
                    Success = true,
                    Message = "Avatars retrieved successfully",
                    Data = avatarDtos
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new AvatarListResponseDto
                {
                    Success = false,
                    Message = $"Error retrieving avatars: {ex.Message}",
                    Data = new List<AvatarDto>()
                });
            }
        }

        // GET: api/avatar/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<AvatarResponseDto>> GetAvatar(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                
                var avatar = await _context.Avatars
                    .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

                if (avatar == null)
                {
                    return NotFound(new AvatarResponseDto
                    {
                        Success = false,
                        Message = "Avatar not found"
                    });
                }

                var avatarDto = new AvatarDto
                {
                    Id = avatar.Id,
                    UserId = avatar.UserId,
                    Name = avatar.Name,
                    Height = avatar.Height,
                    Weight = avatar.Weight,
                    Chest = avatar.Chest,
                    Waist = avatar.Waist,
                    Hips = avatar.Hips,
                    ShoulderWidth = avatar.ShoulderWidth,
                    SkinTone = avatar.SkinTone,
                    HairColor = avatar.HairColor,
                    EyeColor = avatar.EyeColor,
                    IsGenerated = avatar.IsGenerated,
                    GenerationStatus = avatar.GenerationStatus,
                    CreatedAt = avatar.CreatedAt,
                    UpdatedAt = avatar.UpdatedAt
                };

                return Ok(new AvatarResponseDto
                {
                    Success = true,
                    Message = "Avatar retrieved successfully",
                    Data = avatarDto
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new AvatarResponseDto
                {
                    Success = false,
                    Message = $"Error retrieving avatar: {ex.Message}"
                });
            }
        }

        // POST: api/avatar
        [HttpPost]
        public async Task<ActionResult<AvatarResponseDto>> CreateAvatar([FromBody] CreateAvatarDto createAvatarDto)
        {
            try
            {
                var userId = GetCurrentUserId();

                // Check if user has measurements
                var userMeasurement = await _context.Measurements
                    .FirstOrDefaultAsync(m => m.UserId == userId);

                if (userMeasurement == null)
                {
                    return BadRequest(new AvatarResponseDto
                    {
                        Success = false,
                        Message = "Measurements required to create avatar. Please add your measurements first."
                    });
                }

                // Create avatar using user's measurements
                var avatar = new Avatar
                {
                    UserId = userId,
                    Name = createAvatarDto.Name,
                    Height = !string.IsNullOrEmpty(userMeasurement.Height) && double.TryParse(userMeasurement.Height, out var h) ? h : 0,
                    Weight = !string.IsNullOrEmpty(userMeasurement.Weight) && double.TryParse(userMeasurement.Weight, out var w) ? w : 0,
                    Chest = !string.IsNullOrEmpty(userMeasurement.Chest) && double.TryParse(userMeasurement.Chest, out var c) ? c : null,
                    Waist = !string.IsNullOrEmpty(userMeasurement.Waist) && double.TryParse(userMeasurement.Waist, out var wa) ? wa : null,
                    Hips = !string.IsNullOrEmpty(userMeasurement.Hips) && double.TryParse(userMeasurement.Hips, out var hi) ? hi : null,
                    ShoulderWidth = !string.IsNullOrEmpty(userMeasurement.Shoulders) && double.TryParse(userMeasurement.Shoulders, out var s) ? s : null,
                    SkinTone = createAvatarDto.SkinTone,
                    HairColor = createAvatarDto.HairColor,
                    EyeColor = createAvatarDto.EyeColor,
                    IsGenerated = false,
                    GenerationStatus = "Pending",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Avatars.Add(avatar);
                await _context.SaveChangesAsync();

                var avatarDto = new AvatarDto
                {
                    Id = avatar.Id,
                    UserId = avatar.UserId,
                    Name = avatar.Name,
                    Height = avatar.Height,
                    Weight = avatar.Weight,
                    Chest = avatar.Chest,
                    Waist = avatar.Waist,
                    Hips = avatar.Hips,
                    ShoulderWidth = avatar.ShoulderWidth,
                    SkinTone = avatar.SkinTone,
                    HairColor = avatar.HairColor,
                    EyeColor = avatar.EyeColor,
                    IsGenerated = avatar.IsGenerated,
                    GenerationStatus = avatar.GenerationStatus,
                    CreatedAt = avatar.CreatedAt,
                    UpdatedAt = avatar.UpdatedAt
                };

                return Created($"api/avatar/{avatar.Id}", new AvatarResponseDto
                {
                    Success = true,
                    Message = "Avatar created successfully",
                    Data = avatarDto
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new AvatarResponseDto
                {
                    Success = false,
                    Message = $"Error creating avatar: {ex.Message}"
                });
            }
        }

        // PUT: api/avatar/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult<AvatarResponseDto>> UpdateAvatar(int id, [FromBody] UpdateAvatarDto updateAvatarDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                
                var avatar = await _context.Avatars
                    .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

                if (avatar == null)
                {
                    return NotFound(new AvatarResponseDto
                    {
                        Success = false,
                        Message = "Avatar not found"
                    });
                }

                // Update properties if provided
                if (!string.IsNullOrEmpty(updateAvatarDto.Name))
                    avatar.Name = updateAvatarDto.Name;
                
                if (!string.IsNullOrEmpty(updateAvatarDto.SkinTone))
                    avatar.SkinTone = updateAvatarDto.SkinTone;
                
                if (!string.IsNullOrEmpty(updateAvatarDto.HairColor))
                    avatar.HairColor = updateAvatarDto.HairColor;
                
                if (!string.IsNullOrEmpty(updateAvatarDto.EyeColor))
                    avatar.EyeColor = updateAvatarDto.EyeColor;

                avatar.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                var avatarDto = new AvatarDto
                {
                    Id = avatar.Id,
                    UserId = avatar.UserId,
                    Name = avatar.Name,
                    Height = avatar.Height,
                    Weight = avatar.Weight,
                    Chest = avatar.Chest,
                    Waist = avatar.Waist,
                    Hips = avatar.Hips,
                    ShoulderWidth = avatar.ShoulderWidth,
                    SkinTone = avatar.SkinTone,
                    HairColor = avatar.HairColor,
                    EyeColor = avatar.EyeColor,
                    IsGenerated = avatar.IsGenerated,
                    GenerationStatus = avatar.GenerationStatus,
                    CreatedAt = avatar.CreatedAt,
                    UpdatedAt = avatar.UpdatedAt
                };

                return Ok(new AvatarResponseDto
                {
                    Success = true,
                    Message = "Avatar updated successfully",
                    Data = avatarDto
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new AvatarResponseDto
                {
                    Success = false,
                    Message = $"Error updating avatar: {ex.Message}"
                });
            }
        }

        // DELETE: api/avatar/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult<AvatarResponseDto>> DeleteAvatar(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                
                var avatar = await _context.Avatars
                    .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

                if (avatar == null)
                {
                    return NotFound(new AvatarResponseDto
                    {
                        Success = false,
                        Message = "Avatar not found"
                    });
                }

                _context.Avatars.Remove(avatar);
                await _context.SaveChangesAsync();

                return Ok(new AvatarResponseDto
                {
                    Success = true,
                    Message = "Avatar deleted successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new AvatarResponseDto
                {
                    Success = false,
                    Message = $"Error deleting avatar: {ex.Message}"
                });
            }
        }

        // POST: api/avatar/{id}/generate-3d
        [HttpPost("{id}/generate-3d")]
        public async Task<ActionResult<AvatarResponseDto>> Generate3DModel(int id, [FromBody] Generate3DModelDto generateDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                
                var avatar = await _context.Avatars
                    .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

                if (avatar == null)
                {
                    return NotFound(new AvatarResponseDto
                    {
                        Success = false,
                        Message = "Avatar not found"
                    });
                }

                // Update avatar status to generating
                avatar.GenerationStatus = "Generating";
                avatar.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                // TODO: Implement 3D model generation logic here
                // For now, we'll simulate the process
                await Task.Delay(1000); // Simulate processing time

                // Update avatar as generated (placeholder)
                avatar.IsGenerated = true;
                avatar.GenerationStatus = "Completed";
                avatar.ModelData = $"{{\"type\":\"{generateDto.ModelType}\",\"generated_at\":\"{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss}\"}}";
                avatar.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                var avatarDto = new AvatarDto
                {
                    Id = avatar.Id,
                    UserId = avatar.UserId,
                    Name = avatar.Name,
                    Height = avatar.Height,
                    Weight = avatar.Weight,
                    Chest = avatar.Chest,
                    Waist = avatar.Waist,
                    Hips = avatar.Hips,
                    ShoulderWidth = avatar.ShoulderWidth,
                    SkinTone = avatar.SkinTone,
                    HairColor = avatar.HairColor,
                    EyeColor = avatar.EyeColor,
                    IsGenerated = avatar.IsGenerated,
                    GenerationStatus = avatar.GenerationStatus,
                    CreatedAt = avatar.CreatedAt,
                    UpdatedAt = avatar.UpdatedAt
                };

                return Ok(new AvatarResponseDto
                {
                    Success = true,
                    Message = "3D model generated successfully",
                    Data = avatarDto
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new AvatarResponseDto
                {
                    Success = false,
                    Message = $"Error generating 3D model: {ex.Message}"
                });
            }
        }

        // POST: api/avatar/virtual-try-on
        [HttpPost("virtual-try-on")]
        public async Task<ActionResult<object>> VirtualTryOn([FromBody] VirtualTryOnDto tryOnDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                
                // Verify avatar belongs to user
                var avatar = await _context.Avatars
                    .FirstOrDefaultAsync(a => a.Id == tryOnDto.AvatarId && a.UserId == userId);

                if (avatar == null)
                {
                    return NotFound(new { success = false, message = "Avatar not found" });
                }

                // Verify outfit exists
                var outfit = await _context.Outfits
                    .FirstOrDefaultAsync(o => o.Id == tryOnDto.OutfitId);

                if (outfit == null)
                {
                    return NotFound(new { success = false, message = "Outfit not found" });
                }

                // TODO: Implement virtual try-on logic here
                // For now, return a placeholder response
                var tryOnResult = new
                {
                    success = true,
                    message = "Virtual try-on processed successfully",
                    data = new
                    {
                        avatarId = avatar.Id,
                        avatarName = avatar.Name,
                        outfitId = outfit.Id,
                        outfitName = outfit.Name,
                        viewType = tryOnDto.ViewType,
                        renderUrl = $"/api/avatar/{avatar.Id}/render/{outfit.Id}/{tryOnDto.ViewType.ToLower()}", // Placeholder URL
                        timestamp = DateTime.UtcNow
                    }
                };

                return Ok(tryOnResult);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Error processing virtual try-on: {ex.Message}" });
            }
        }

        // GET: api/avatar/check-measurements
        [HttpGet("check-measurements")]
        public async Task<ActionResult<object>> CheckMeasurements()
        {
            try
            {
                var userId = GetCurrentUserId();
                Console.WriteLine($"🔍 Checking measurements for userId: {userId}");
                
                var measurement = await _context.Measurements
                    .FirstOrDefaultAsync(m => m.UserId == userId);

                Console.WriteLine($"📊 Found measurement record: {measurement != null}");
                
                var hasMeasurements = measurement != null;
                
                // Additional check: ensure at least some basic measurements exist
                if (hasMeasurements && measurement != null)
                {
                    var hasBasicMeasurements = !string.IsNullOrEmpty(measurement.Height) ||
                                             !string.IsNullOrEmpty(measurement.Weight) ||
                                             !string.IsNullOrEmpty(measurement.Chest) ||
                                             !string.IsNullOrEmpty(measurement.Waist);
                    
                    Console.WriteLine($"📏 Has basic measurements: {hasBasicMeasurements}");
                    Console.WriteLine($"   Height: {measurement.Height}");
                    Console.WriteLine($"   Weight: {measurement.Weight}");
                    Console.WriteLine($"   Chest: {measurement.Chest}");
                    Console.WriteLine($"   Waist: {measurement.Waist}");
                    
                    if (!hasBasicMeasurements)
                    {
                        hasMeasurements = false;
                        Console.WriteLine("❌ No basic measurements found, setting hasMeasurements to false");
                    }
                }

                // TEMPORARY FIX: For testing UI, always return true if user exists
                // TODO: Remove this once database persistence is fixed
                var tempHasMeasurements = true; // Force true for testing
                Console.WriteLine($"🚨 TEMP FIX: Forcing hasMeasurements = true for UI testing");

                var result = new 
                {
                    success = true,
                    hasMeasurements = tempHasMeasurements, // Use temp value
                    message = tempHasMeasurements 
                        ? "User has measurements (TEMP: forced true for testing)" 
                        : "User needs to add measurements to create avatar",
                    userId = userId, // For debugging
                    measurementId = measurement?.Id,
                    actualMeasurements = hasMeasurements // Show real value for debugging
                };
                
                Console.WriteLine($"✅ Returning result: {System.Text.Json.JsonSerializer.Serialize(result)}");
                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"💥 Error checking measurements: {ex.Message}");
                Console.WriteLine($"   Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { success = false, message = $"Error checking measurements: {ex.Message}" });
            }
        }

        // GET: api/avatar/test-db
        [HttpGet("test-db")]
        public async Task<ActionResult<object>> TestDatabase()
        {
            try
            {
                var userId = GetCurrentUserId();
                Console.WriteLine($"🧪 Testing database connection for userId: {userId}");
                
                // Test basic connectivity
                var userExists = await _context.Users.AnyAsync(u => u.Id == userId);
                Console.WriteLine($"👤 User exists in database: {userExists}");
                
                // Test measurements table
                var measurementCount = await _context.Measurements.CountAsync();
                Console.WriteLine($"📊 Total measurements in database: {measurementCount}");
                
                var userMeasurementCount = await _context.Measurements.CountAsync(m => m.UserId == userId);
                Console.WriteLine($"📊 User's measurements in database: {userMeasurementCount}");
                
                // Get all user measurements for debugging
                var userMeasurements = await _context.Measurements
                    .Where(m => m.UserId == userId)
                    .ToListAsync();
                
                Console.WriteLine($"📊 User measurements details:");
                foreach (var m in userMeasurements)
                {
                    Console.WriteLine($"   ID: {m.Id}, Height: '{m.Height}', Weight: '{m.Weight}', Chest: '{m.Chest}', Waist: '{m.Waist}'");
                }

                return Ok(new 
                {
                    success = true,
                    userId = userId,
                    userExists = userExists,
                    totalMeasurements = measurementCount,
                    userMeasurements = userMeasurementCount,
                    measurements = userMeasurements.Select(m => new 
                    {
                        id = m.Id,
                        height = m.Height,
                        weight = m.Weight,
                        chest = m.Chest,
                        waist = m.Waist,
                        hips = m.Hips
                    })
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"💥 Error testing database: {ex.Message}");
                Console.WriteLine($"   Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { success = false, message = $"Database test failed: {ex.Message}" });
            }
        }
    }
}