using Microsoft.EntityFrameworkCore;
using InventoryHub.Api.Contracts.Products;
using InventoryHub.Api.Data;
using InventoryHub.Api.Models;

namespace InventoryHub.Api.Services.Products;

public sealed class ProductService(AppDbContext dbContext) : IProductService
{
    public async Task<IReadOnlyList<ProductResponse>> GetAllAsync(CancellationToken cancellationToken) =>
        await dbContext.Products
            .AsNoTracking()
            .OrderByDescending(product => product.Id)
            .Select(product => new ProductResponse(product.Id, product.Name, product.Price))
            .ToListAsync(cancellationToken);

    public async Task<ProductResponse?> GetByIdAsync(int id, CancellationToken cancellationToken) =>
        await dbContext.Products
            .AsNoTracking()
            .Where(product => product.Id == id)
            .Select(product => new ProductResponse(product.Id, product.Name, product.Price))
            .SingleOrDefaultAsync(cancellationToken);

    public async Task<ProductResponse> CreateAsync(CreateProductRequest request, CancellationToken cancellationToken)
    {
        var product = new Product { Name = request.Name.Trim(), Price = request.Price };
        dbContext.Products.Add(product);
        await dbContext.SaveChangesAsync(cancellationToken);
        return ToResponse(product);
    }

    public async Task<ProductResponse?> UpdateAsync(int id, UpdateProductRequest request, CancellationToken cancellationToken)
    {
        var product = await dbContext.Products.FindAsync([id], cancellationToken);
        if (product is null) return null;

        product.Name = request.Name.Trim();
        product.Price = request.Price;
        await dbContext.SaveChangesAsync(cancellationToken);
        return ToResponse(product);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken)
    {
        var product = await dbContext.Products.FindAsync([id], cancellationToken);
        if (product is null) return false;

        dbContext.Products.Remove(product);
        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static ProductResponse ToResponse(Product product) =>
        new(product.Id, product.Name, product.Price);
}
