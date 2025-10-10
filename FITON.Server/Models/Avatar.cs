using System.ComponentModel.DataAnnotations;

namespace FITON.Server.Models
{
    public class Avatar
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        // Measurement-based properties
        [Required]
        public double Height { get; set; }

        [Required]
        public double Weight { get; set; }

        public double? Chest { get; set; }
        public double? Waist { get; set; }
        public double? Hips { get; set; }
        public double? ShoulderWidth { get; set; }

        // Avatar visual properties
        [StringLength(20)]
        public string SkinTone { get; set; } = "Medium";

        [StringLength(20)]
        public string HairColor { get; set; } = "Brown";

        [StringLength(20)]
        public string EyeColor { get; set; } = "Brown";

        // 3D Model data (for future implementation)
        public string? ModelData { get; set; }
        public string? TextureData { get; set; }

        // Avatar status
        public bool IsGenerated { get; set; } = false;
        public string? GenerationStatus { get; set; } = "Pending";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public User User { get; set; } = null!;
    }
}