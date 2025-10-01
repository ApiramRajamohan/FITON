namespace FITON.Server.DTOs
{
    public class AvatarGenerationResultDto
    {
        public bool Success { get; set; }
        public string? ImageBase64 { get; set; }
        public string? ImageMime { get; set; }
        public string? Url { get; set; }
        public string? RawJson { get; set; }
        public string? Error { get; set; }
    }
}
