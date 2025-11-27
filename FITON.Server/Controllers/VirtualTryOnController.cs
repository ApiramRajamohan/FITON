using FITON.Server.DTOs;
using FITON.Server.Models;
using FITON.Server.Utils.Database;
using FITON.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text;

namespace FITON.Server.Controllers
{
    [ApiController]
    [Route("api/virtual-try-on")]
    [Authorize]
    public class VirtualTryOnController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IImageGenerator _imageGenerator;

        public VirtualTryOnController(AppDbContext context, IImageGenerator imageGenerator)
        {
            _context = context;
            _imageGenerator = imageGenerator;
        }

        [HttpPost("generate")]
        public async Task<IActionResult> GenerateTryOn([FromBody] GenerateTryOnDto dto)
        {
            // 1. Get User ID from token
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdString, out var userId))
            {
                return Unauthorized("Invalid user ID.");
            }

            // 2. Fetch required data from your database
            var measurements = await _context.Measurements.AsNoTracking().FirstOrDefaultAsync(m => m.UserId == userId);
            if (measurements == null)
            {
                return BadRequest(new { error = "User measurements not found. Please add them first." });
            }

            // Validate measurements for AI safety compliance
            if (!string.IsNullOrEmpty(measurements.Height))
            {
                if (float.TryParse(measurements.Height, out float height) && height <150)
                {
                    return BadRequest(new {
                        error = "Virtual Try-On requires height to be at least150cm (4'11\") to comply with AI safety guidelines. Please update your measurements to adult proportions."
                    });
                }
            }

            var wardrobeOutfit = await _context.Wardrobes
                .AsNoTracking()
                .Include(w => w.TopClothes)
                .Include(w => w.BottomClothes)
                .Include(w => w.FullOutfitClothes)
                .FirstOrDefaultAsync(w => w.Id == dto.WardrobeId && w.UserId == userId);

            if (wardrobeOutfit == null)
            {
                return NotFound("Selected wardrobe outfit not found.");
            }

            // 3. Construct the detailed text prompt for the AI model
            string prompt = ConstructPrompt(measurements, wardrobeOutfit);

            // 4. Call the image generator service to create the image
            try
            {
                var imageUrl = await _imageGenerator.GenerateImageAsync(prompt);
                return Ok(new { imageUrl, prompt });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = $"Failed to generate image: {ex.Message}" });
            }
        }

        private string ConstructPrompt(Models.Measurement m, Wardrobe w)
        {
            var sb = new StringBuilder();
            sb.Append("A professional full-body fashion photograph of an adult ");
            
            // Gender specification
            if (!string.IsNullOrEmpty(m.Gender))
            {
                sb.Append($"{m.Gender.ToLower()} ");
            }
            
            sb.Append("model standing upright. ");
            sb.Append("Studio lighting, neutral gray background, fashion photography style. ");

            // Skin tone
            if (!string.IsNullOrEmpty(m.SkinColor)) 
                sb.Append($"{m.SkinColor} complexion. ");

            // Body proportions - simplified for better AI interpretation
            sb.Append("Body proportions: ");
            
            // Determine body type from measurements
            if (!string.IsNullOrEmpty(m.Height) && !string.IsNullOrEmpty(m.Weight))
            {
                if (float.TryParse(m.Height, out float height) && float.TryParse(m.Weight, out float weight))
                {
                    // Calculate BMI for body type
                    float heightM = height / 100f;
                    float bmi = weight / (heightM * heightM);
                    
                    if (bmi < 18.5)
                        sb.Append("slim build, ");
                    else if (bmi < 25)
                        sb.Append("average build, ");
                    else if (bmi < 30)
                        sb.Append("athletic build, ");
                    else
                        sb.Append("curvy build, ");
                }
                
                sb.Append($"approximately {m.Height}cm tall. ");
            }
            
            // Add gender-specific body shape descriptors if gender is specified
            if (!string.IsNullOrEmpty(m.Gender))
            {
                if (m.Gender.Equals("Male", StringComparison.OrdinalIgnoreCase))
                {
                    sb.Append("Masculine physique. ");
                }
                else if (m.Gender.Equals("Female", StringComparison.OrdinalIgnoreCase))
                {
                    sb.Append("Feminine physique. ");
                }
            }
            
            // Simplified measurements for key proportions
            if (!string.IsNullOrEmpty(m.Waist) && !string.IsNullOrEmpty(m.Hips))
            {
                sb.Append($"Proportions suited for {m.Waist}cm waist clothing. ");
            }
            
            // Additional measurement details for more accurate representation
            if (!string.IsNullOrEmpty(m.Chest))
            {
                sb.Append($"Chest measurement: {m.Chest}cm. ");
            }
            
            if (!string.IsNullOrEmpty(m.Shoulders))
            {
                sb.Append($"Shoulder width: {m.Shoulders}cm. ");
            }
            
            if (!string.IsNullOrEmpty(m.NeckCircumference))
            {
                sb.Append($"Neck circumference: {m.NeckCircumference}cm. ");
            }
            
            if (!string.IsNullOrEmpty(m.SleeveLength))
            {
                sb.Append($"Sleeve length: {m.SleeveLength}cm. ");
            }
            
            if (!string.IsNullOrEmpty(m.Inseam))
            {
                sb.Append($"Inseam length: {m.Inseam}cm. ");
            }
            
            if (!string.IsNullOrEmpty(m.Thigh))
            {
                sb.Append($"Thigh circumference: {m.Thigh}cm. ");
            }

            // Additional description if provided
            if (!string.IsNullOrEmpty(m.Description))
                sb.Append($"{m.Description} ");

            // Clothing description - more natural language
            sb.Append("Wearing: ");
            if (w.FullOutfitClothes != null)
            {
                sb.Append($"a stylish {w.FullOutfitClothes.Color} {w.FullOutfitClothes.Name}. ");
            }
            else
            {
                if (w.TopClothes != null) 
                    sb.Append($"a {w.TopClothes.Color} {w.TopClothes.Name}, ");
                if (w.BottomClothes != null) 
                    sb.Append($"paired with {w.BottomClothes.Color} {w.BottomClothes.Name}. ");
            }
            if (!string.IsNullOrEmpty(w.Accessories)) 
                sb.Append($"Accessories: {w.Accessories}. ");

            sb.Append("High-quality fashion photography, professional lighting, sharp details.");
            return sb.ToString();
        }
    }

    // DTO for the incoming request from the frontend
    public class GenerateTryOnDto
    {
        public int WardrobeId { get; set; }
    }
}