using FoodDelivery.Infrastructure.Services;
using FluentAssertions;
using Xunit;

namespace FoodDelivery.Tests.Unit;

public class GeoServiceTests
{
    private readonly GeoService _geoService = new();

    [Theory]
    [InlineData(40.7128, -74.0060, 40.7128, -74.0060, 0)]      // same point
    [InlineData(51.5074, -0.1278, 48.8566,  2.3522,  341.0)]   // London → Paris ~341km
    [InlineData(24.8607,  67.0011, 24.9056, 67.0822, 9.0)]     // Karachi local ~9km
    public void CalculateDistanceKm_KnownPoints_ReturnsApproximateDistance(
        double lat1, double lon1, double lat2, double lon2, double expectedKm)
    {
        var result = _geoService.CalculateDistanceKm(lat1, lon1, lat2, lon2);

        if (expectedKm == 0)
            result.Should().BeApproximately(0, 0.001);
        else
            result.Should().BeApproximately(expectedKm, expectedKm * 0.05); // within 5%
    }

    [Fact]
    public void CalculateDistanceKm_IsSymmetric()
    {
        double d1 = _geoService.CalculateDistanceKm(51.5, -0.1, 48.8, 2.3);
        double d2 = _geoService.CalculateDistanceKm(48.8, 2.3, 51.5, -0.1);
        d1.Should().BeApproximately(d2, 0.001);
    }
}
