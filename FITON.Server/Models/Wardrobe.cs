namespace FITON.Server.Models
{
    public class Wardrobe
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Description { get; set; } = "";
        public int UserId { get; set; }
        
        // Top clothing item (shirt, blouse, etc.)
        public int? TopClothesId { get; set; }
        
        // Bottom clothing item (pants, skirt, etc.)
        public int? BottomClothesId { get; set; }
        
        // Full outfit item (dress, frock, etc.)
        public int? FullOutfitClothesId { get; set; }
        
        // Additional accessories or notes
        public string Accessories { get; set; } = "";
        public string Occasion { get; set; } = "Casual";
        public string Season { get; set; } = "All";
        
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Navigation properties for the User
        public User? User { get; set; }
        
        // Navigation properties for outfit items
        public Outfit? TopClothes { get; set; }
        public Outfit? BottomClothes { get; set; }
        public Outfit? FullOutfitClothes { get; set; }
    }
}