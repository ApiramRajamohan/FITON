using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using FITON.Server;

namespace FITON.Tests
{
    public class AuthenticatedTestBase : IClassFixture<WebApplicationFactory<Program>>
    {
        protected readonly HttpClient _client;
        protected readonly WebApplicationFactory<Program> _factory;

        public AuthenticatedTestBase(WebApplicationFactory<Program> factory)
        {
            _factory = factory;
            _client = factory.CreateClient();
        }

        protected async Task<string> RegisterAndLoginAsync(string username = "testuser", string email = "test@example.com", string password = "TestPass123!")
        {
            // Register
            var registerDto = new { Username = username, Email = email, Password = password };
            await _client.PostAsJsonAsync("/api/Auth/register", registerDto);

            // Login
            var loginDto = new { Email = email, Password = password };
            var loginResponse = await _client.PostAsJsonAsync("/api/Auth/login", loginDto);

            if (!loginResponse.IsSuccessStatusCode)
            {
                return string.Empty;
            }

            var loginResult = await loginResponse.Content.ReadFromJsonAsync<LoginResponse>();
            return loginResult?.Token ?? string.Empty;
        }

        protected void SetAuthToken(string token)
        {
            if (!string.IsNullOrEmpty(token))
            {
                _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            }
        }

        protected async Task<HttpClient> GetAuthenticatedClientAsync(string username = "testuser", string email = "test@example.com", string password = "TestPass123!")
        {
            var token = await RegisterAndLoginAsync(username, email, password);
            SetAuthToken(token);
            return _client;
        }

        private class LoginResponse
        {
            public string? Token { get; set; }
        }
    }
}
