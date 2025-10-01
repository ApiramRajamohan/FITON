using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using FITON.Server.DTOs;
using System;

namespace FITON.Server.Services
{
    public class AvatarService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;

        public AvatarService(IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
        }

        public async Task<AvatarGenerationResultDto> GenerateAvatarAsync(string prompt)
        {
            var apiKey = _configuration["ImagineArt:ApiKey"];
            var apiUrl = _configuration["ImagineArt:ApiUrl"];
            
            if (string.IsNullOrEmpty(apiKey) || string.IsNullOrEmpty(apiUrl))
            {
                // Return mock response if no API configuration
                await Task.Delay(2000);
                return new AvatarGenerationResultDto
                {
                    Success = true,
                    ImageBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
                    ImageMime = "image/png",
                    Url = null,
                    RawJson = null
                };
            }

            try
            {
                var client = _httpClientFactory.CreateClient();
                
                // Create form data for the Imagine Art API
                // Always enforce safety + clothing directives server-side
                var safetySuffix = " The subject must be fully clothed in modest, neutral athletic or casual apparel. No nudity, no underwear-only, no transparent or see-through garments, no sexual or explicit content, no exaggerated anatomy. Use the provided measurements exactly; do not invent or randomize proportions; reflect differences faithfully.";
                var effectivePrompt = prompt.Contains("No nudity", StringComparison.OrdinalIgnoreCase) || prompt.Contains("Fully clothed", StringComparison.OrdinalIgnoreCase)
                    ? prompt + " " + safetySuffix
                    : prompt + safetySuffix;

                using var formData = new MultipartFormDataContent();
                formData.Add(new StringContent(effectivePrompt), "prompt");
                formData.Add(new StringContent("realistic"), "style");
                formData.Add(new StringContent("1:1"), "aspect_ratio");
                formData.Add(new StringContent("5"), "seed");
                
                // Add authorization header
                client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey);
                
                Console.WriteLine($"Sending request to: {apiUrl}");
                Console.WriteLine($"Prompt (effective): {effectivePrompt}");
                
                var response = await client.PostAsync(apiUrl, formData);
                
                Console.WriteLine($"Response Status: {response.StatusCode}");
                
                if (response.IsSuccessStatusCode)
                {
                    var mediaType = response.Content.Headers.ContentType?.MediaType ?? string.Empty;
                    Console.WriteLine($"Content-Type: {mediaType}");

                    // If the API returned an image directly, convert to base64
                    if (mediaType.StartsWith("image/"))
                    {
                        var bytes = await response.Content.ReadAsByteArrayAsync();
                        var b64 = Convert.ToBase64String(bytes);
                        return new AvatarGenerationResultDto
                        {
                            Success = true,
                            ImageBase64 = b64,
                            ImageMime = mediaType
                        };
                    }

                    // Otherwise treat as JSON/string
                    var responseBody = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"Response Body (text): {responseBody}");

                    AvatarGenerationResultDto result = new AvatarGenerationResultDto
                    {
                        Success = true,
                        RawJson = responseBody
                    };

                    try
                    {
                        using var doc = JsonDocument.Parse(responseBody);
                        var root = doc.RootElement;

                        // Try common fields
                        if (root.TryGetProperty("data", out var dataEl))
                        {
                            if (dataEl.ValueKind == JsonValueKind.Object)
                            {
                                if (dataEl.TryGetProperty("url", out var urlEl) && urlEl.ValueKind == JsonValueKind.String)
                                {
                                    result.Url = urlEl.GetString();
                                }
                                if (dataEl.TryGetProperty("image_base64", out var imgEl) && imgEl.ValueKind == JsonValueKind.String)
                                {
                                    result.ImageBase64 = imgEl.GetString();
                                    result.ImageMime = "image/png"; // assume png if not provided
                                }
                                if (dataEl.TryGetProperty("images", out var imagesEl) && imagesEl.ValueKind == JsonValueKind.Array && imagesEl.GetArrayLength() > 0)
                                {
                                    var first = imagesEl[0];
                                    if (first.ValueKind == JsonValueKind.String)
                                    {
                                        var val = first.GetString();
                                        if (!string.IsNullOrEmpty(val))
                                        {
                                            if (val!.StartsWith("http")) result.Url = val; else result.ImageBase64 = val;
                                        }
                                    }
                                    else if (first.ValueKind == JsonValueKind.Object && first.TryGetProperty("url", out var innerUrl) && innerUrl.ValueKind == JsonValueKind.String)
                                    {
                                        result.Url = innerUrl.GetString();
                                    }
                                }
                            }
                        }
                        else
                        {
                            // Fallback top-level fields
                            if (root.TryGetProperty("url", out var topUrl) && topUrl.ValueKind == JsonValueKind.String)
                                result.Url = topUrl.GetString();
                            if (root.TryGetProperty("image_url", out var imageUrl) && imageUrl.ValueKind == JsonValueKind.String)
                                result.Url = imageUrl.GetString();
                            if (root.TryGetProperty("image_base64", out var topImg) && topImg.ValueKind == JsonValueKind.String)
                            {
                                result.ImageBase64 = topImg.GetString();
                                result.ImageMime = "image/png";
                            }
                            if (root.TryGetProperty("images", out var imagesTop) && imagesTop.ValueKind == JsonValueKind.Array && imagesTop.GetArrayLength() > 0)
                            {
                                var first = imagesTop[0];
                                if (first.ValueKind == JsonValueKind.String)
                                {
                                    var val = first.GetString();
                                    if (!string.IsNullOrEmpty(val))
                                    {
                                        if (val!.StartsWith("http")) result.Url = val; else result.ImageBase64 = val;
                                    }
                                }
                            }
                        }
                    }
                    catch (Exception jsonEx)
                    {
                        Console.WriteLine($"JSON parse attempt failed: {jsonEx.Message}");
                        // leave as raw
                    }

                    return result;
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"API Error: {response.StatusCode} - {errorContent}");
                    return new AvatarGenerationResultDto
                    {
                        Success = false,
                        Error = $"API Error: {response.StatusCode} - {errorContent}"
                    };
                }
            }
            catch (Exception ex)
            {
                return new AvatarGenerationResultDto
                {
                    Success = false,
                    Error = $"Failed to generate image: {ex.Message}"
                };
            }
        }
    }
}
