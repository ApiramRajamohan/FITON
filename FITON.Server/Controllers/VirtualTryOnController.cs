using FITON.Server.DTOs;
using FITON.Server.Models;
using FITON.Server.Utils.Database;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text;
using Google.Cloud.AIPlatform.V1;
using Google.Protobuf;

namespace FITON.Server.Controllers
{
    [ApiController]
    [Route("api/virtual-try-on")]
    [Authorize]
    public class VirtualTryOnController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public VirtualTryOnController(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
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
                if (float.TryParse(measurements.Height, out float height) && height < 150)
                {
                    return BadRequest(new { 
                        error = "Virtual Try-On requires height to be at least 150cm (4'11\") to comply with AI safety guidelines. Please update your measurements to adult proportions." 
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

            // 4. Call the Vertex AI Imagen API to generate the image
            try
            {
                // Get your Google Cloud Project details from appsettings.json
                var projectId = _config["GoogleCloud:ProjectId"];
                var location = _config["GoogleCloud:Location"];
                var modelId = "imagegeneration@006"; // Latest Imagen model

                if (string.IsNullOrEmpty(projectId) || string.IsNullOrEmpty(location))
                {
                    Console.WriteLine("Google Cloud configuration is missing");
                    return StatusCode(500, new { error = "Google Cloud is not properly configured. Please check appsettings.json" });
                }

                // Create the API client. It automatically handles authentication
                // using the GOOGLE_APPLICATION_CREDENTIALS environment variable.
                var predictionServiceClient = new PredictionServiceClientBuilder
                {
                    Endpoint = $"{location}-aiplatform.googleapis.com"
                }.Build();

                // Construct the API request payload using proper namespace qualifications
                var parameters = Google.Protobuf.WellKnownTypes.Value.ForStruct(new Google.Protobuf.WellKnownTypes.Struct
                {
                    Fields =
                    {
                        { "sampleCount", Google.Protobuf.WellKnownTypes.Value.ForNumber(1) },
                        { "aspectRatio", Google.Protobuf.WellKnownTypes.Value.ForString("9:16") },
                        { "safetySetting", Google.Protobuf.WellKnownTypes.Value.ForString("block_some") },
                        { "personGeneration", Google.Protobuf.WellKnownTypes.Value.ForString("allow_adult") }
                    }
                });

                var instance = Google.Protobuf.WellKnownTypes.Value.ForStruct(new Google.Protobuf.WellKnownTypes.Struct
                {
                    Fields = { { "prompt", Google.Protobuf.WellKnownTypes.Value.ForString(prompt) } }
                });

                // Define the full model endpoint path
                var endpointName = EndpointName.FromProjectLocationPublisherModel(projectId, location, "google", modelId);

                Console.WriteLine($"Calling Vertex AI Imagen at: {endpointName}");
                Console.WriteLine($"Prompt: {prompt}");

                // Make the actual API call - This will wait for the real image generation
                PredictResponse response = await predictionServiceClient.PredictAsync(endpointName, new[] { instance }, parameters);

                // Log the full response for debugging
                Console.WriteLine($"Response received. Predictions count: {response.Predictions.Count}");
                Console.WriteLine($"Response metadata: {response.Metadata}");
                
                // 5. Process the response: The image data comes back as a base64 encoded string
                if (response.Predictions.Count == 0)
                {
                    Console.WriteLine("No predictions returned from the API");
                    Console.WriteLine($"Full response: {response}");
                    return StatusCode(500, new { 
                        error = "No image was generated. This may be due to content filtering or API limitations. Please try with different measurements or outfit combinations." 
                    });
                }

                var prediction = response.Predictions[0];
                var base64ImageData = prediction.StructValue.Fields["bytesBase64Encoded"].StringValue;

                // Format the result as a Data URL, which is easy for the frontend to use directly in an <img> tag
                var imageUrl = $"data:image/png;base64,{base64ImageData}";

                Console.WriteLine("Image generated successfully");
                return Ok(new { imageUrl, prompt = prompt });
            }
            catch (Exception ex)
            {
                // Log the detailed error for debugging
                Console.WriteLine($"Vertex AI API Error: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
                
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner Exception: {ex.InnerException.Message}");
                }

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