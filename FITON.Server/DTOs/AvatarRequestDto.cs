namespace FITON.Server.DTOs
{
    public class AvatarRequestDto
    {
        public string? Prompt { get; set; }
        public string? Gender { get; set; } // optional: 'male' or 'female'
    }
}
