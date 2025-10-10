using System.ComponentModel.DataAnnotations;

namespace FITON.Server.Models
{
    public class Outfit
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = null!;
        
        [StringLength(500)]
        public string Description { get; set; } = "";
        
        [Required]
        [StringLength(50)]
        public string Category { get; set; } = "Casual";
        
        [StringLength(50)]
        public string Brand { get; set; } = "";
        
        [StringLength(20)]
        public string Size { get; set; } = "";
        
        [StringLength(50)]
        public string Color { get; set; } = "";
        
        [Required]
        [StringLength(50)]
        public string Type { get; set; } = "Shirt";
        
        public string ImageUrl { get; set; } = "";
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Foreign key to User
        public int UserId { get; set; }
        public User User { get; set; } = null!;
    }
}