namespace FITON.Server.DTOs
{
    public class AuthorizationResponse
    {
        public int id { get; set; }
        public string username { get; set; }
        public string email { get; set; }

        public AuthorizationResponse(int id, string username, string email)
        {
            this.id = id;
            this.username = username;
            this.email = email;
        }
    }
}
