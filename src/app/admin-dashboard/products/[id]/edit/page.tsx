'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  X, 
  Plus, 
  Package
} from 'lucide-react';
import Link from 'next/link';
import { useDataStore } from '@/lib/data-store';

interface ProductVariant {
  id: string;
  label: string;
  price: number;
  sku: string;
  discount: number;
  stock: number;
}

interface ProductFormData {
  name: string;
  deity: string;
  description: string;
  spiritualMeaning?: string;
  origin?: string;
  specifications?: string[];
  wearGuide?: {
    title: string;
    steps: string[];
    image?: string;
  };
  careGuide?: {
    title: string;
    steps: string[];
    image?: string;
  };
  category: string;
  tags: string[];
  status: 'active' | 'inactive' | 'draft';
  isBestseller: boolean;
  variants: ProductVariant[];
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const { categories, loading: categoriesLoading } = useDataStore();
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [newSpecification, setNewSpecification] = useState('');
  const [newWearGuideStep, setNewWearGuideStep] = useState('');
  const [newCareGuideStep, setNewCareGuideStep] = useState('');
  const [wearGuideImage, setWearGuideImage] = useState<string>('');
  const [wearGuideImageFile, setWearGuideImageFile] = useState<File | null>(null);
  const [careGuideImage, setCareGuideImage] = useState<string>('');
  const [careGuideImageFile, setCareGuideImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    deity: '',
    description: '',
    spiritualMeaning: '',
    origin: '',
    specifications: [],
    wearGuide: undefined,
    careGuide: undefined,
    category: '',
    tags: [],
    status: 'draft',
    isBestseller: false,
    variants: [
      { id: '1', label: 'Standard', price: 0, sku: '', discount: 0, stock: 0 }
    ]
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/admin/products`);
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            const product = result.data.find((p: any) => p.id === productId);
            if (product) {
              setFormData({
                name: product.name,
                deity: product.deity,
                description: product.description,
                spiritualMeaning: product.spiritualMeaning || '',
                origin: product.origin || '',
                specifications: product.specifications || [],
                wearGuide: product.wearGuide || undefined,
                careGuide: product.careGuide || undefined,
                category: product.category,
                tags: product.tags || [],
                status: product.status,
                isBestseller: product.isBestseller,
                variants: product.variants || [{ id: '1', label: 'Standard', price: 0, sku: '', discount: 0, stock: 0 }]
              });
              setImages(product.images || []);
              if (product.wearGuide?.image) {
                setWearGuideImage(product.wearGuide.image);
              }
              if (product.careGuide?.image) {
                setCareGuideImage(product.careGuide.image);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setFetching(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        setImageFiles(prev => [...prev, file]);
        const reader = new FileReader();
        reader.onload = (e) => {
          setImages(prev => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index: number) => {
    const imageToRemove = images[index];
    if (!imageToRemove.startsWith('data:')) {
      setImagesToDelete(prev => [...prev, imageToRemove]);
    }
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: Date.now().toString(),
      label: '',
      price: 0,
      sku: '',
      discount: 0,
      stock: 0
    };
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, newVariant]
    }));
  };

  const removeVariant = (id: string) => {
    if (formData.variants.length > 1) {
      setFormData(prev => ({
        ...prev,
        variants: prev.variants.filter(v => v.id !== id)
      }));
    }
  };

  const updateVariant = (id: string, field: keyof ProductVariant, value: any) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(v =>
        v.id === id ? { ...v, [field]: value } : v
      )
    }));
  };

  const addSpecification = () => {
    if (newSpecification.trim()) {
      setFormData(prev => ({
        ...prev,
        specifications: [...(prev.specifications || []), newSpecification.trim()]
      }));
      setNewSpecification('');
    }
  };

  const removeSpecification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataObj = new FormData();
      
      formDataObj.append('id', productId);
      formDataObj.append('name', formData.name);
      formDataObj.append('deity', formData.deity);
      formDataObj.append('description', formData.description);
      if (formData.spiritualMeaning) {
        formDataObj.append('spiritualMeaning', formData.spiritualMeaning);
      }
      if (formData.origin) {
        formDataObj.append('origin', formData.origin);
      }
      formDataObj.append('category', formData.category);
      formDataObj.append('status', formData.status);
      formDataObj.append('isBestseller', formData.isBestseller.toString());
      formDataObj.append('tags', JSON.stringify(formData.tags));
      formDataObj.append('variants', JSON.stringify(formData.variants));
      formDataObj.append('imagesToDelete', JSON.stringify(imagesToDelete));
      
      if (formData.specifications) {
        formDataObj.append('specifications', JSON.stringify(formData.specifications));
      }
      if (formData.wearGuide) {
        formDataObj.append('wearGuide', JSON.stringify(formData.wearGuide));
      }
      if (formData.careGuide) {
        formDataObj.append('careGuide', JSON.stringify(formData.careGuide));
      }
      
      imageFiles.forEach((file, index) => {
        formDataObj.append('newImages', file);
      });

      if (wearGuideImageFile) {
        formDataObj.append('wearGuideImage', wearGuideImageFile);
      }
      if (careGuideImageFile) {
        formDataObj.append('careGuideImage', careGuideImageFile);
      }

      const response = await fetch('/api/admin/products', {
        method: 'PUT',
        body: formDataObj,
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          router.push('/admin-dashboard/products');
        } else {
          console.error('Error updating product:', result.error);
          alert('Failed to update product: ' + result.error);
        }
      } else {
        console.error('Failed to update product');
        alert('Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/admin-dashboard/products">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Package className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-gray-600">Loading product...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/admin-dashboard/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-gray-600">Update product information and variants</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Update the basic details for the product
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., 5 Mukhi Rudraksha"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deity">Deity/Associated With *</Label>
                  <Input
                    id="deity"
                    value={formData.deity}
                    onChange={(e) => setFormData({...formData, deity: e.target.value})}
                    placeholder="e.g., Lord Shiva"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe your product in detail..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriesLoading ? (
                        <SelectItem value="" disabled>Loading categories...</SelectItem>
                      ) : categories.length > 0 ? (
                        categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>No categories available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select value={formData.status} onValueChange={(value: 'active' | 'inactive' | 'draft') => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product Variants</CardTitle>
              <CardDescription>
                Update product variants with pricing and inventory
              </CardDescription>
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
                        onClick={() => removeVariant(variant.id)}
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
                        value={variant.label}
                        onChange={(e) => updateVariant(variant.id, 'label', e.target.value)}
                        placeholder="e.g., Small, Medium, Large"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Price *</Label>
                      <Input
                        type="number"
                        value={variant.price}
                        onChange={(e) => updateVariant(variant.id, 'price', Number(e.target.value))}
                        placeholder="0"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Discount (%)</Label>
                      <Input
                        type="number"
                        value={variant.discount}
                        onChange={(e) => updateVariant(variant.id, 'discount', Number(e.target.value))}
                        placeholder="0"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Stock *</Label>
                      <Input
                        type="number"
                        value={variant.stock}
                        onChange={(e) => updateVariant(variant.id, 'stock', Number(e.target.value))}
                        placeholder="0"
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>SKU</Label>
                    <Input
                      value={variant.sku}
                      onChange={(e) => updateVariant(variant.id, 'sku', e.target.value)}
                      placeholder="Stock keeping unit"
                    />
                  </div>
                </div>
              ))}
              
              <Button type="button" variant="outline" onClick={addVariant}>
                <Plus className="h-4 w-4 mr-2" />
                Add Variant
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                type="submit"
                form="product-form"
                className="w-full bg-orange-600 hover:bg-orange-700"
                disabled={loading}
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Updating...' : 'Update Product'}
              </Button>
              
              <Link href="/admin-dashboard/products">
                <Button variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}