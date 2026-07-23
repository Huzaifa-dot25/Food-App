using FoodDelivery.Application.Common.Models;
using FoodDelivery.Application.DTOs.Auth;
using FoodDelivery.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace FoodDelivery.Tests.Integration;

/// <summary>
/// Integration tests using ASP.NET Core's in-memory test server.
/// These tests exercise the full HTTP pipeline: routing → middleware → controller → service → EF Core (in-memory).
/// </summary>
public class AuthControllerIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public AuthControllerIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                // Replace real SQL Server with in-memory DB for tests
                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));
                if (descriptor != null) services.Remove(descriptor);

                services.AddDbContext<AppDbContext>(opts =>
                    opts.UseInMemoryDatabase("IntegrationTestDb"));

                // Ensure DB is seeded
                var sp  = services.BuildServiceProvider();
                using var scope = sp.CreateScope();
                var db  = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                db.Database.EnsureCreated();
            });
        }).CreateClient();
    }

    // ── Register ───────────────────────────────────────────────────

    [Fact]
    public async Task POST_Register_WithValidData_Returns201()
    {
        var request = new
        {
            firstName       = "Integration",
            lastName        = "Test",
            email           = $"int{Guid.NewGuid():N}@test.com",
            phoneNumber     = "+1234567890",
            password        = "Test@1234",
            confirmPassword = "Test@1234",
            role            = "Customer"
        };

        var response = await _client.PostAsJsonAsync("/api/auth/register", request);

        response.StatusCode.Should().Be(HttpStatusCode.Created);

        var body = await response.Content.ReadFromJsonAsync<ApiResponse<AuthResponse>>();
        body.Should().NotBeNull();
        body!.Success.Should().BeTrue();
        body.Data!.AccessToken.Should().NotBeNullOrEmpty();
        body.Data.RefreshToken.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task POST_Register_WithInvalidEmail_Returns400()
    {
        var request = new
        {
            firstName       = "Test",
            lastName        = "User",
            email           = "not-an-email",
            phoneNumber     = "+1234567890",
            password        = "Test@1234",
            confirmPassword = "Test@1234",
            role            = "Customer"
        };

        var response = await _client.PostAsJsonAsync("/api/auth/register", request);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task POST_Register_WithWeakPassword_Returns400()
    {
        var request = new
        {
            firstName       = "Test",
            lastName        = "User",
            email           = "weak@test.com",
            phoneNumber     = "+1234567890",
            password        = "weak",
            confirmPassword = "weak",
            role            = "Customer"
        };

        var response = await _client.PostAsJsonAsync("/api/auth/register", request);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    // ── Login ──────────────────────────────────────────────────────

    [Fact]
    public async Task POST_Login_WithNonExistentUser_Returns400()
    {
        var request = new { email = "ghost@nobody.com", password = "Test@1234" };

        var response = await _client.PostAsJsonAsync("/api/auth/login", request);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task POST_Login_WithEmptyBody_Returns400()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/login", new { });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    // ── Protected endpoint — no JWT ────────────────────────────────

    [Fact]
    public async Task GET_Profile_WithoutToken_Returns401()
    {
        var response = await _client.GetAsync("/api/auth/profile");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    // ── Health check ───────────────────────────────────────────────

    [Fact]
    public async Task GET_Health_Returns200()
    {
        var response = await _client.GetAsync("/health");

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await response.Content.ReadAsStringAsync();
        body.Should().Contain("healthy");
    }

    // ── Rate limiting ──────────────────────────────────────────────

    [Fact]
    public async Task POST_Login_ExceedingRateLimit_Returns429()
    {
        // Hit the auth endpoint 10 times rapidly (limit is 5/min)
        var tasks = Enumerable.Range(0, 10).Select(_ =>
            _client.PostAsJsonAsync("/api/auth/login", new
            {
                email    = "rate@test.com",
                password = "Test@1234"
            }));

        var responses = await Task.WhenAll(tasks);

        // At least one response should be 429
        responses.Should().Contain(r => r.StatusCode == HttpStatusCode.TooManyRequests);
    }
}
