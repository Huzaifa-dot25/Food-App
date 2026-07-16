namespace FoodDelivery.Application.Common.Interfaces;

public interface IGeoService
{
    /// <summary>
    /// Calculate straight-line distance in kilometres using Haversine formula.
    /// </summary>
    double CalculateDistanceKm(double lat1, double lon1, double lat2, double lon2);
}
