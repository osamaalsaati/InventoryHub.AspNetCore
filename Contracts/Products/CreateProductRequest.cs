using System.ComponentModel.DataAnnotations;

namespace TestAspApi.Contracts.Products;

public sealed class CreateProductRequest
{
    [Required(ErrorMessage = "اسم المنتج مطلوب.")]
    [MaxLength(120, ErrorMessage = "اسم المنتج يجب ألا يتجاوز 120 حرفًا.")]
    public string Name { get; init; } = string.Empty;

    [Range(typeof(decimal), "0.01", "999999999.99", ErrorMessage = "السعر يجب أن يكون أكبر من صفر.")]
    public decimal Price { get; init; }
}
