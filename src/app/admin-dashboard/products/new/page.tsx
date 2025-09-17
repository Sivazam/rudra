'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Upload, Image as ImageIcon, Save, Plus, X, DollarSign, Package } from 'lucide-react';
import Link from 'next/link';
import { useDataStore } from '@/lib/data-store';

interface Variant {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount: number;
  stock: number;
  sku: string;
}

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  spiritualMeaning: string;
  deity: string;
  category: string;
  status: 'active' | 'inactive';
  images: File[];
  imagePreviews: string[];
  variants: Variant[];
  metadata: {
    origin: string;
    material: string;
  };
}

export default function NewProductPage() {
  const router = useRouter();
  const { categories, addProduct, loading: dataStoreLoading } = useDataStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    slug: '',
    description: '',
    spiritualMeaning: '',
    deity: '',
    category: '',
    status: 'active',
    images: [],
    imagePreviews: [],
    variants: [],
    metadata: {
      origin: '',
      material: ''
    }
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, file],
          imagePreviews: [...prev.imagePreviews, e.target?.result as string]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      imagePreviews: prev.imagePreviews.filter((_, i) => i !== index)
    }));
  };

  const addVariant = () => {
    const newVariant: Variant = {
      id: Date.now().toString(),
      name: '',
      price: 0,
      discount: 0,
      stock: 0,
      sku: ''
    };
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, newVariant]
    }));
  };

  const updateVariant = (index: number, field: keyof Variant, value: any) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) => 
        i === index ? { ...variant, [field]: value } : variant
      )
    }));
  };

  const removeVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.name || !formData.description || !formData.category) {
        alert('Please fill in all required fields');
        return;
      }

      // Validate variants (only if variants exist)
      if (formData.variants.length > 0) {
        const invalidVariants = formData.variants.filter(v => !v.name || v.price <= 0 || v.stock < 0);
        if (invalidVariants.length > 0) {
          alert('Please ensure all variants have valid names, prices, and stock quantities');
          return;
        }
      } else {
        // If no variants, we need at least a basic price
        alert('Please add at least one variant with pricing information');
        return;
      }

      // Calculate total stock from variants
      const totalStock = formData.variants.length > 0 ? formData.variants.reduce((sum, variant) => sum + variant.stock, 0) : 0;
      
      // Calculate main price from first variant (if variants exist)
      const mainPrice = formData.variants.length > 0 ? formData.variants[0].price : 0;
      const mainOriginalPrice = formData.variants.length > 0 ? formData.variants[0].originalPrice : undefined;
      const mainDiscount = formData.variants.length > 0 ? formData.variants[0].discount : 0;
      
      // Get the selected category name
      const selectedCategory = categories.find(cat => cat.id === formData.category);
      
      // Add product using the data store with image upload
      await addProduct({
        name: formData.name,
        description: formData.description,
        price: mainPrice,
        originalPrice: mainOriginalPrice,
        discount: mainDiscount,
        category: formData.category,
        categoryName: selectedCategory?.name || 'Unknown Category',
        variants: formData.variants,
        status: formData.status,
        stock: totalStock
      }, formData.images.length > 0 ? formData.images : undefined);

      // Show success message and redirect
      alert('Product created successfully!');
      router.push('/admin-dashboard/products');
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Failed to create product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Show loading state while data store is loading
  if (dataStoreLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/admin-dashboard/products">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  // Show message if no categories exist
  if (categories.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/admin-dashboard/products">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
            <p className="text-gray-600">Create a new product with variants and pricing</p>
          </div>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Categories Available</h3>
            <p className="text-gray-600 mb-4">
              You need to create at least one category before adding products.
            </p>
            <Link href="/admin-dashboard/categories/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Category
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/admin-dashboard/products">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-gray-600">Create a new product with variants and pricing</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="xl:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Enter the basic details for your product
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Original 5 Mukhi Rudraksha"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input
                    id="slug"
                    placeholder="auto-generated"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your product in detail..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="spiritualMeaning">Spiritual Meaning</Label>
                  <Textarea
                    id="spiritualMeaning"
                    placeholder="Spiritual significance..."
                    value={formData.spiritualMeaning}
                    onChange={(e) => setFormData(prev => ({ ...prev, spiritualMeaning: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deity">Associated Deity</Label>
                  <Input
                    id="deity"
                    placeholder="e.g., Lord Shiva"
                    value={formData.deity}
                    onChange={(e) => setFormData(prev => ({ ...prev, deity: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, category: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.length > 0 ? (
                        categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>
                          No categories available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: 'active' | 'inactive') => 
                    setFormData(prev => ({ ...prev, status: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="origin">Origin</Label>
                  <Input
                    id="origin"
                    placeholder="e.g., Nepal, India"
                    value={formData.metadata.origin}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      metadata: { ...prev.metadata, origin: e.target.value }
                    }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="material">Material</Label>
                <Input
                  id="material"
                  placeholder="e.g., Silver, Crystal, Wood"
                  value={formData.metadata.material}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    metadata: { ...prev.metadata, material: e.target.value }
                  }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Variants */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Product Variants</CardTitle>
                  <CardDescription>
                    Add different variants with pricing and inventory
                  </CardDescription>
                </div>
                <Button type="button" variant="outline" onClick={addVariant}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Variant
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.variants.map((variant, index) => (
                <div key={variant.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Variant {index + 1}</h4>
                    {formData.variants.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeVariant(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Variant Name *</Label>
                      <Input
                        placeholder="e.g., Small, Medium, Large"
                        value={variant.name}
                        onChange={(e) => updateVariant(index, 'name', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>SKU</Label>
                      <Input
                        placeholder="Stock keeping unit"
                        value={variant.sku}
                        onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Price (₹) *</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={variant.price || ''}
                        onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                        min="0"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Stock Quantity *</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={variant.stock || ''}
                        onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Original Price (₹)</Label>
                      <Input
                        type="number"
                        placeholder="For discount calculation"
                        value={variant.originalPrice || ''}
                        onChange={(e) => updateVariant(index, 'originalPrice', parseFloat(e.target.value) || undefined)}
                        min="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Discount (%)</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={variant.discount || ''}
                        onChange={(e) => updateVariant(index, 'discount', parseFloat(e.target.value) || 0)}
                        min="0"
                        max="100"
                      />
                      {variant.originalPrice && variant.discount > 0 && (
                        <div className="text-sm text-green-600">
                          Final price: {formatPrice(variant.price)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Card>
            <CardContent className="pt-6">
              <Button 
                type="submit" 
                className="w-full"
                onClick={handleSubmit}
                disabled={loading || !formData.name || !formData.description || !formData.category}
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Creating Product...' : 'Create Product'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
              <CardDescription>
                Add product images (max 5)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formData.imagePreviews.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {formData.imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Product preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Upload product images
                    </p>
                  </div>
                )}

                {formData.imagePreviews.length < 5 && (
                  <Label htmlFor="image-upload" className="cursor-pointer">
                    <Button variant="outline" className="w-full" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Add Images
                      </span>
                    </Button>
                  </Label>
                )}
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />

                <div className="text-xs text-gray-500">
                  <p>Max 5 images</p>
                  <p>Recommended: 800x800px</p>
                  <p>Formats: JPG, PNG, WebP</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Preview</CardTitle>
              <CardDescription>
                How your product will appear
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {formData.name || 'Product Name'}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {formData.description || 'Product description...'}
                    </p>
                  </div>

                  {formData.variants.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Variants:</div>
                      {formData.variants.slice(0, 2).map((variant, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{variant.name || 'Variant name'}</span>
                          <span className="font-medium">
                            {variant.price > 0 ? formatPrice(variant.price) : '₹0'}
                          </span>
                        </div>
                      ))}
                      {formData.variants.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{formData.variants.length - 2} more variants
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <Badge variant={formData.status === 'active' ? 'default' : 'secondary'}>
                      {formData.status}
                    </Badge>
                    {formData.imagePreviews.length > 0 && (
                      <span className="text-xs text-gray-500">
                        {formData.imagePreviews.length} image(s)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}