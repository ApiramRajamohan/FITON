using System.ComponentModel.DataAnnotations;

namespace FITON.Server.DTOs
{
    public class MeasurementDto
    {
        [Range(0, 300)] public double Height { get; set; }
        [Range(0, 500)] public double Weight { get; set; }
        [Range(0, 300)] public double Chest { get; set; }
        [Range(0, 300)] public double Waist { get; set; }
        [Range(0, 300)] public double Hips { get; set; }
        [Range(0, 300)] public double Inseam { get; set; }
    }
}