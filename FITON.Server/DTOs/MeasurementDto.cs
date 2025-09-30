using System.ComponentModel.DataAnnotations;

namespace FITON.Server.DTOs
{
    public class MeasurementDto
    {
        [Range(0, 300)]
        public double? Height { get; set; }

        [Range(0, 500)]
        public double? Weight { get; set; }

        [Range(0, 300)]
        [Display(Name = "Chest/Bust")]
        public double? Chest { get; set; }

        [Range(0, 300)]
        public double? Waist { get; set; }

        [Range(0, 300)]
        public double? Hips { get; set; }

        [Range(0, 300)]
        public double? Shoulders { get; set; }

        [Range(0, 300)]
        [Display(Name = "Neck Circumference")]
        public double? NeckCircumference { get; set; }

        [Range(0, 300)]
        [Display(Name = "Sleeve Length")]
        public double? SleeveLength { get; set; }

        [Range(0, 300)]
        public double? Inseam { get; set; }

        [Range(0, 300)]
        public double? Thigh { get; set; }

        public string? SkinColor { get; set; }

        public string? Description { get; set; }
    }
}
