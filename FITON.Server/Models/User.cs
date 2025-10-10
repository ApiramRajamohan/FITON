namespace FITON.Server.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string PasswordHash { get; set; } = null!;
        public List<RefreshToken> RefreshTokens { get; set; } = new();
        public bool IsAdmin { get; set; } = false;

        // One-to-one measurement (optional)
        public Measurement? Measurement { get; set; }

        // One-to-many outfits
        public List<Outfit> Outfits { get; set; } = new();
    }

    public class RefreshToken
    {
        public int Id { get; set; }
        public string Token { get; set; } = null!;
        public int UserId { get; set; }
        public DateTime Expires { get; set; }
        public bool IsRevoked { get; set; } = false;
        public User User { get; set; } = null!;
    }
}

