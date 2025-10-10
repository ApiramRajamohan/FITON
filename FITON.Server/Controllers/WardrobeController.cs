using FITON.Server.DTOs;
using FITON.Server.Models;
using FITON.Server.Utils.Database;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WardrobeController : ControllerBase
{
    private readonly AppDbContext _db;

    public WardrobeController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetOutfits()
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized("Invalid user authentication");
            }

            // Get user's outfits from database
            var outfits = await _db.Outfits
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => new OutfitResponseDto
                {
                    Id = o.Id,
                    Name = o.Name,
                    Description = o.Description,
                    Category = o.Category,
                    Brand = o.Brand,
                    Size = o.Size,
                    Color = o.Color,
                    Type = o.Type,
                    ImageUrl = o.ImageUrl,
                    CreatedAt = o.CreatedAt,
                    UpdatedAt = o.UpdatedAt
                })
                .ToListAsync();

            return Ok(outfits);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Failed to retrieve outfits", details = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> SaveOutfit([FromBody] SaveOutfitDto dto)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized("Invalid user authentication");
            }

            // Create new outfit and save to database
            var outfit = new Outfit
            {
                Name = dto.Name,
                Description = dto.Description,
                Category = dto.Category,
                Brand = dto.Brand,
                Size = dto.Size,
                Color = dto.Color,
                Type = dto.Type,
                ImageUrl = dto.ImageUrl,
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _db.Outfits.Add(outfit);
            await _db.SaveChangesAsync();

            var savedOutfit = new OutfitResponseDto
            {
                Id = outfit.Id,
                Name = outfit.Name,
                Description = outfit.Description,
                Category = outfit.Category,
                Brand = outfit.Brand,
                Size = outfit.Size,
                Color = outfit.Color,
                Type = outfit.Type,
                ImageUrl = outfit.ImageUrl,
                CreatedAt = outfit.CreatedAt,
                UpdatedAt = outfit.UpdatedAt
            };

            return Ok(savedOutfit);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Failed to save outfit", details = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateOutfit(int id, [FromBody] SaveOutfitDto dto)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized("Invalid user authentication");
            }

            // Find the outfit and verify ownership
            var outfit = await _db.Outfits
                .FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);

            if (outfit == null)
            {
                return NotFound("Outfit not found or you don't have permission to update it");
            }

            // Update outfit properties
            outfit.Name = dto.Name;
            outfit.Description = dto.Description;
            outfit.Category = dto.Category;
            outfit.Brand = dto.Brand;
            outfit.Size = dto.Size;
            outfit.Color = dto.Color;
            outfit.Type = dto.Type;
            outfit.ImageUrl = dto.ImageUrl;
            outfit.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            var updatedOutfit = new OutfitResponseDto
            {
                Id = outfit.Id,
                Name = outfit.Name,
                Description = outfit.Description,
                Category = outfit.Category,
                Brand = outfit.Brand,
                Size = outfit.Size,
                Color = outfit.Color,
                Type = outfit.Type,
                ImageUrl = outfit.ImageUrl,
                CreatedAt = outfit.CreatedAt,
                UpdatedAt = outfit.UpdatedAt
            };

            return Ok(updatedOutfit);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Failed to update outfit", details = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteOutfit(int id)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized("Invalid user authentication");
            }

            // Find the outfit and verify ownership
            var outfit = await _db.Outfits
                .FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);

            if (outfit == null)
            {
                return NotFound("Outfit not found or you don't have permission to delete it");
            }

            _db.Outfits.Remove(outfit);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Outfit deleted successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Failed to delete outfit", details = ex.Message });
        }
    }
}