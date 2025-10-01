using Microsoft.AspNetCore.Mvc;
using FITON.Server.Services;
using System.Threading.Tasks;
using FITON.Server.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace FITON.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AvatarController : ControllerBase
    {
        private readonly AvatarService _avatarService;

        public AvatarController(AvatarService avatarService)
        {
            _avatarService = avatarService;
        }

        [HttpPost("generate")]
        public async Task<IActionResult> GenerateAvatar([FromBody] AvatarRequestDto avatarRequest)
        {
            if (avatarRequest == null || string.IsNullOrWhiteSpace(avatarRequest.Prompt))
            {
                return BadRequest("Prompt cannot be empty.");
            }

            var result = await _avatarService.GenerateAvatarAsync(avatarRequest.Prompt);

            if (!result.Success)
            {
                return StatusCode(502, new { success = false, error = result.Error });
            }

            // Build a canonical response shape for the frontend
            var response = new
            {
                success = true,
                image = result.ImageBase64 != null && result.ImageMime != null ? $"data:{result.ImageMime};base64,{result.ImageBase64}" : null,
                url = result.Url,
                raw = result.RawJson
            };

            return Ok(response);
        }
    }
}
