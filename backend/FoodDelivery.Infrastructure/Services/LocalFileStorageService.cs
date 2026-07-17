using FoodDelivery.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;

namespace FoodDelivery.Infrastructure.Services;

/// <summary>
/// Stores files on the local filesystem under wwwroot/uploads.
/// Swap this for Azure Blob / S3 in production.
/// </summary>
public class LocalFileStorageService : IFileStorageService
{
    private readonly string _uploadPath;
    private readonly string _baseUrl;

    public LocalFileStorageService(IConfiguration config)
    {
        _uploadPath = config["FileStorage:UploadPath"] ?? "wwwroot/uploads";
        _baseUrl    = config["FileStorage:BaseUrl"]    ?? "https://localhost:5001/uploads";
    }

    public async Task<string> UploadAsync(Stream fileStream, string fileName, string contentType, string folder)
    {
        var dir = Path.Combine(_uploadPath, folder);
        Directory.CreateDirectory(dir);

        // Ensure unique filename
        var ext       = Path.GetExtension(fileName);
        var safeName  = $"{Guid.NewGuid():N}{ext}";
        var fullPath  = Path.Combine(dir, safeName);

        await using var fs = new FileStream(fullPath, FileMode.Create, FileAccess.Write);
        await fileStream.CopyToAsync(fs);

        return $"{_baseUrl}/{folder}/{safeName}";
    }

    public Task DeleteAsync(string fileUrl)
    {
        // Convert URL back to physical path
        var relativePath = fileUrl.Replace(_baseUrl, string.Empty).TrimStart('/');
        var fullPath     = Path.Combine(_uploadPath, relativePath.Replace('/', Path.DirectorySeparatorChar));

        if (File.Exists(fullPath))
            File.Delete(fullPath);

        return Task.CompletedTask;
    }
}
