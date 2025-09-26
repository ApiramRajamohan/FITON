namespace FITON.Server.Models
{
    public class Measurement
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public double Height { get; set; }
        public double Weight { get; set; }
        public double Chest { get; set; }
        public double Waist { get; set; }
        public double Hips { get; set; }
        public double Inseam { get; set; }

        // Navigation
        public User User { get; set; } = null!;
    }
}