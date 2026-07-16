using FoodDelivery.Application.Common.Models;
using FoodDelivery.Application.DTOs.Auth;

namespace FoodDelivery.Application.Services.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<AuthResponse> RefreshTokenAsync(string refreshToken);
    Task LogoutAsync(int userId);

    Task SendOtpAsync(string email);
    Task VerifyOtpAsync(VerifyOtpRequest request);
    Task SendPasswordResetOtpAsync(ForgotPasswordRequest request);
    Task ResetPasswordAsync(ResetPasswordRequest request);

    Task<UserProfileDto> GetProfileAsync(int userId);
    Task<UserProfileDto> UpdateProfileAsync(int userId, UpdateProfileRequest request);
    Task<string> UploadProfileImageAsync(int userId, Stream imageStream, string fileName);

    Task<IReadOnlyList<AddressDto>> GetAddressesAsync(int userId);
    Task<AddressDto> AddAddressAsync(int userId, CreateAddressRequest request);
    Task<AddressDto> UpdateAddressAsync(int userId, int addressId, CreateAddressRequest request);
    Task DeleteAddressAsync(int userId, int addressId);
    Task SetDefaultAddressAsync(int userId, int addressId);
}
