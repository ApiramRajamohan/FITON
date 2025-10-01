using System.ComponentModel.DataAnnotations;

namespace FITON.Server.DTOs
{
    public class MeasurementDto
    {
        public string? Height { get; set; }
        public string? Weight { get; set; }
        public string? Chest { get; set; }
        public string? Waist { get; set; }
        public string? Hips { get; set; }
        public string? Shoulders { get; set; }
        public string? NeckCircumference { get; set; }
        public string? SleeveLength { get; set; }
        public string? Inseam { get; set; }
        public string? Thigh { get; set; }
        public string? SkinColor { get; set; }
        public string? Description { get; set; }
    }
}
