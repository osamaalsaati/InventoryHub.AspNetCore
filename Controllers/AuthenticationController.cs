using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using InventoryHub.Api.Configuration;
using InventoryHub.Api.Contracts.Authentication;

namespace InventoryHub.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthenticationController(
    IOptions<AdminCredentialsOptions> credentialsOptions) : ControllerBase
{
    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var credentials = credentialsOptions.Value;

        if (!IsValid(request, credentials))
        {
            return Unauthorized(new { message = "اسم المستخدم أو كلمة المرور غير صحيحة." });
        }

        var claims = new[]
        {
            new Claim(ClaimTypes.Name, credentials.Username),
            new Claim(ClaimTypes.Role, "Administrator")
        };

        var identity = new ClaimsIdentity(
            claims,
            CookieAuthenticationDefaults.AuthenticationScheme);

        await HttpContext.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            new ClaimsPrincipal(identity),
            new AuthenticationProperties
            {
                IsPersistent = true,
                ExpiresUtc = DateTimeOffset.UtcNow.AddHours(8)
            });

        return Ok(new { username = credentials.Username });
    }

    [Authorize]
    [HttpGet("me")]
    public IActionResult CurrentUser() => Ok(new { username = User.Identity?.Name });

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return NoContent();
    }

    private static bool IsValid(LoginRequest request, AdminCredentialsOptions credentials)
    {
        if (!string.Equals(request.Username, credentials.Username, StringComparison.Ordinal))
        {
            return false;
        }

        var suppliedPassword = Encoding.UTF8.GetBytes(request.Password);
        var configuredPassword = Encoding.UTF8.GetBytes(credentials.Password);

        return suppliedPassword.Length == configuredPassword.Length
            && CryptographicOperations.FixedTimeEquals(suppliedPassword, configuredPassword);
    }
}
