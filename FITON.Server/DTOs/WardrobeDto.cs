using System.ComponentModel.DataAnnotations;

namespace FITON.Server.DTOs
{
    public class OutfitDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Description { get; set; } = "";
        public string Category { get; set; } = "Casual";
        public string Brand { get; set; } = "";
        public string Size { get; set; } = "";
        public string Color { get; set; } = "";
        public string Type { get; set; } = "Shirt";
        public string ImageUrl { get; set; } = "";
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int UserId { get; set; }
    }

    public class SaveOutfitDto
    {
        [Required]
        [StringLength(100, MinimumLength = 1, ErrorMessage = "Name must be between 1 and 100 characters")]
        public string Name { get; set; } = null!;

        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
        public string Description { get; set; } = "";

        [Required]
        [StringLength(50, ErrorMessage = "Category cannot exceed 50 characters")]
        public string Category { get; set; } = "Casual";

        [StringLength(50, ErrorMessage = "Brand cannot exceed 50 characters")]
        public string Brand { get; set; } = "";

        [StringLength(20, ErrorMessage = "Size cannot exceed 20 characters")]
        public string Size { get; set; } = "";

        [StringLength(50, ErrorMessage = "Color cannot exceed 50 characters")]
        public string Color { get; set; } = "";

        [Required]
        [StringLength(50, ErrorMessage = "Type cannot exceed 50 characters")]
        public string Type { get; set; } = "Shirt";

        // [Url(ErrorMessage = "Please provide a valid URL for the image")] // Removed strict URL validation
        public string ImageUrl { get; set; } = "";
    }

    public class UpdateOutfitDto
    {
        [StringLength(100, MinimumLength = 1, ErrorMessage = "Name must be between 1 and 100 characters")]
        public string? Name { get; set; }

        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
        public string? Description { get; set; }

        [StringLength(50, ErrorMessage = "Category cannot exceed 50 characters")]
        public string? Category { get; set; }

        [StringLength(50, ErrorMessage = "Brand cannot exceed 50 characters")]
        public string? Brand { get; set; }

        [StringLength(20, ErrorMessage = "Size cannot exceed 20 characters")]
        public string? Size { get; set; }

        [StringLength(50, ErrorMessage = "Color cannot exceed 50 characters")]
        public string? Color { get; set; }

        [StringLength(50, ErrorMessage = "Type cannot exceed 50 characters")]
        public string? Type { get; set; }

        // [Url(ErrorMessage = "Please provide a valid URL for the image")] // Removed strict URL validation
        public string? ImageUrl { get; set; }
    }

    public class OutfitResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Description { get; set; } = "";
        public string Category { get; set; } = "Casual";
        public string Brand { get; set; } = "";
        public string Size { get; set; } = "";
        public string Color { get; set; } = "";
        public string Type { get; set; } = "Shirt";
        public string ImageUrl { get; set; } = "";
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}