'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

export default function NewProductPage() {
  const router = useRouter();
  const { categories, loading: categoriesLoading } = useDataStore();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
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

  const handleWearGuideImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setWearGuideImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setWearGuideImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCareGuideImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setCareGuideImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setCareGuideImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
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

  const addWearGuideStep = () => {
    if (newWearGuideStep.trim()) {
      setFormData(prev => ({
        ...prev,
        wearGuide: {
          title: prev.wearGuide?.title || 'Rudraksha Wear Guide',
          steps: [...(prev.wearGuide?.steps || []), newWearGuideStep.trim()],
          image: prev.wearGuide?.image || wearGuideImage
        }
      }));
      setNewWearGuideStep('');
    }
  };

  const removeWearGuideStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      wearGuide: prev.wearGuide ? {
        ...prev.wearGuide,
        steps: prev.wearGuide.steps.filter((_, i) => i !== index)
      } : undefined
    }));
  };

  const updateWearGuideTitle = (title: string) => {
    setFormData(prev => ({
      ...prev,
      wearGuide: prev.wearGuide ? {
        ...prev.wearGuide,
        title,
        image: prev.wearGuide?.image || wearGuideImage
      } : {
        title,
        steps: [],
        image: wearGuideImage
      }
    }));
  };

  const addCareGuideStep = () => {
    if (newCareGuideStep.trim()) {
      setFormData(prev => ({
        ...prev,
        careGuide: {
          title: prev.careGuide?.title || 'Rudraksha Care Guide',
          steps: [...(prev.careGuide?.steps || []), newCareGuideStep.trim()],
          image: prev.careGuide?.image || careGuideImage
        }
      }));
      setNewCareGuideStep('');
    }
  };

  const removeCareGuideStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      careGuide: prev.careGuide ? {
        ...prev.careGuide,
        steps: prev.careGuide.steps.filter((_, i) => i !== index)
      } : undefined
    }));
  };

  const updateCareGuideTitle = (title: string) => {
    setFormData(prev => ({
      ...prev,
      careGuide: prev.careGuide ? {
        ...prev.careGuide,
        title,
        image: prev.careGuide?.image || careGuideImage
      } : {
        title,
        steps: [],
        image: careGuideImage
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataObj = new FormData();
      
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
        method: 'POST',
        body: formDataObj,
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          router.push('/admin-dashboard/products');
        } else {
          console.error('Error creating product:', result.error);
          alert('Failed to create product: ' + result.error);
        }
      } else {
        console.error('Failed to create product');
        alert('Failed to create product');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/admin-dashboard/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-gray-600">Create a new product with variants and guides</p>
        </div>
      </div>

      {categoriesLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Package className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-gray-600">Loading categories...</p>
          </div>
        </div>
      ) : categories.length === 0 ? (
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
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Enter the basic details for the product
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
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value: 'active' | 'inactive' | 'draft') => setFormData({...formData, status: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="spiritualMeaning">Spiritual Meaning</Label>
                    <Textarea
                      id="spiritualMeaning"
                      value={formData.spiritualMeaning || ''}
                      onChange={(e) => setFormData({...formData, spiritualMeaning: e.target.value})}
                      placeholder="Spiritual significance..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="origin">Origin</Label>
                    <Input
                      id="origin"
                      value={formData.origin || ''}
                      onChange={(e) => setFormData({...formData, origin: e.target.value})}
                      placeholder="e.g., Nepal, India"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Variants</CardTitle>
                <CardDescription>
                  Add different variants with pricing and inventory
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
                <CardTitle>Product Images</CardTitle>
                <CardDescription>
                  Upload product images (max 5)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <Label htmlFor="image-upload" className="cursor-pointer">
                    <span className="text-sm text-gray-600">Click to upload images</span>
                    <Input
                      id="image-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </Label>
                </div>

                {images.length > 0 && (
                  <div className="space-y-2">
                    <Label>Uploaded Images</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Product ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-white/80 hover:bg-white text-red-600 hover:text-red-700"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

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
                  {loading ? 'Creating...' : 'Create Product'}
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
      )}
    </div>
  );
}