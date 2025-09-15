import { firestoreService } from '@/lib/firebase';

export interface IProductMetadata {
  origin: string;
  material: string;
}

export interface IProduct {
  id?: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  spiritualMeaning: string;
  deity: string;
  images: string[];
  metadata: IProductMetadata;
  status: 'active' | 'inactive';
  createdAt?: any;
  updatedAt?: any;
}

class ProductService {
  private collection = 'products';

  // Create a new product
  async createProduct(productData: Omit<IProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      return await firestoreService.create(this.collection, productData);
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  // Get product by ID
  async getProductById(id: string): Promise<IProduct | null> {
    try {
      return await firestoreService.getById(this.collection, id);
    } catch (error) {
      console.error('Error getting product:', error);
      throw error;
    }
  }

  // Get product by slug
  async getProductBySlug(slug: string): Promise<IProduct | null> {
    try {
      const products = await firestoreService.getAll(this.collection, {
        where: { field: 'slug', operator: '==', value: slug }
      });
      return products.length > 0 ? products[0] : null;
    } catch (error) {
      console.error('Error getting product by slug:', error);
      throw error;
    }
  }

  // Get all products
  async getAllProducts(activeOnly: boolean = true): Promise<IProduct[]> {
    try {
      if (activeOnly) {
        return await firestoreService.getAll(this.collection, {
          where: { field: 'status', operator: '==', value: 'active' }
        });
      }
      return await firestoreService.getAll(this.collection);
    } catch (error) {
      console.error('Error getting all products:', error);
      throw error;
    }
  }

  // Get products by category
  async getProductsByCategory(category: string): Promise<IProduct[]> {
    try {
      return await firestoreService.getAll(this.collection, {
        where: { field: 'category', operator: '==', value: category }
      });
    } catch (error) {
      console.error('Error getting products by category:', error);
      throw error;
    }
  }

  // Update product
  async updateProduct(id: string, updateData: Partial<IProduct>): Promise<void> {
    try {
      await firestoreService.update(this.collection, id, updateData);
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  // Delete product
  async deleteProduct(id: string): Promise<void> {
    try {
      await firestoreService.delete(this.collection, id);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  // Search products
  async searchProducts(query: string): Promise<IProduct[]> {
    try {
      // Note: Firestore doesn't have native text search, so we'll get all active products and filter
      const products = await this.getAllProducts(true);
      const lowercaseQuery = query.toLowerCase();
      
      return products.filter(product => 
        product.name.toLowerCase().includes(lowercaseQuery) ||
        product.description.toLowerCase().includes(lowercaseQuery) ||
        product.deity.toLowerCase().includes(lowercaseQuery) ||
        product.spiritualMeaning.toLowerCase().includes(lowercaseQuery)
      );
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  // Get featured products
  async getFeaturedProducts(limit: number = 8): Promise<IProduct[]> {
    try {
      return await firestoreService.getAll(this.collection, {
        where: { field: 'status', operator: '==', value: 'active' },
        orderBy: { field: 'createdAt', direction: 'desc' },
        limit
      });
    } catch (error) {
      console.error('Error getting featured products:', error);
      throw error;
    }
  }
}

export const productService = new ProductService();
export default productService;