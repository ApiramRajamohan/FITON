namespace FITON.Server.DTOs
{
    public class AvatarDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public double Height { get; set; }
        public double Weight { get; set; }
        public double? Chest { get; set; }
        public double? Waist { get; set; }
        public double? Hips { get; set; }
        public double? ShoulderWidth { get; set; }
        public string SkinTone { get; set; } = "Medium";
        public string HairColor { get; set; } = "Brown";
        public string EyeColor { get; set; } = "Brown";
        public bool IsGenerated { get; set; }
        public string? GenerationStatus { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateAvatarDto
    {
        public string Name { get; set; } = string.Empty;
        public string SkinTone { get; set; } = "Medium";
        public string HairColor { get; set; } = "Brown";
        public string EyeColor { get; set; } = "Brown";
    }

    public class UpdateAvatarDto
    {
        public string? Name { get; set; }
        public string? SkinTone { get; set; }
        public string? HairColor { get; set; }
        public string? EyeColor { get; set; }
    }

    public class AvatarResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public AvatarDto? Data { get; set; }
    }

    public class AvatarListResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public List<AvatarDto> Data { get; set; } = new();
    }

    public class Generate3DModelDto
    {
        public int AvatarId { get; set; }
        public string ModelType { get; set; } = "Basic"; // Basic, Detailed, etc.
    }

    public class VirtualTryOnDto
    {
        public int AvatarId { get; set; }
        public int OutfitId { get; set; }
        public string ViewType { get; set; } = "Front"; // Front, Side, Back, 360
    }
}