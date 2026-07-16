namespace FoodDelivery.Application.Common.Interfaces;

public interface IFileStorageService
{
    /// <summary>Upload a file stream and return its public URL.</summary>
    Task<string> UploadAsync(Stream fileStream, string fileName, string contentType, string folder);

    /// <summary>Delete a file by its URL or path.</summary>
    Task DeleteAsync(string fileUrl);
}
