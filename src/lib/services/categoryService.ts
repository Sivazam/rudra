import { firestoreService } from '@/lib/firebase';

export interface ICategory {
  id?: string;
  name: string;
  slug: string;
  iconUrl: string;
  createdAt?: any;
  updatedAt?: any;
}

class CategoryService {
  private collection = 'categories';

  // Create a new category
  async createCategory(categoryData: Omit<ICategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      return await firestoreService.create(this.collection, categoryData);
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  // Get category by ID
  async getCategoryById(id: string): Promise<ICategory | null> {
    try {
      return await firestoreService.getById(this.collection, id);
    } catch (error) {
      console.error('Error getting category:', error);
      throw error;
    }
  }

  // Get category by slug
  async getCategoryBySlug(slug: string): Promise<ICategory | null> {
    try {
      const categories = await firestoreService.getAll(this.collection, {
        where: { field: 'slug', operator: '==', value: slug }
      });
      return categories.length > 0 ? categories[0] : null;
    } catch (error) {
      console.error('Error getting category by slug:', error);
      throw error;
    }
  }

  // Get all categories
  async getAllCategories(): Promise<ICategory[]> {
    try {
      return await firestoreService.getAll(this.collection, {
        orderBy: { field: 'name', direction: 'asc' }
      });
    } catch (error) {
      console.error('Error getting all categories:', error);
      throw error;
    }
  }

  // Update category
  async updateCategory(id: string, updateData: Partial<ICategory>): Promise<void> {
    try {
      await firestoreService.update(this.collection, id, updateData);
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  // Delete category
  async deleteCategory(id: string): Promise<void> {
    try {
      await firestoreService.delete(this.collection, id);
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  // Get category with product count
  async getCategoriesWithProductCount(): Promise<(ICategory & { productCount: number })[]> {
    try {
      const categories = await this.getAllCategories();
      const productService = (await import('./productService')).productService;
      
      const categoriesWithCount = await Promise.all(
        categories.map(async (category) => {
          const products = await productService.getProductsByCategory(category.slug);
          return {
            ...category,
            productCount: products.length
          };
        })
      );

      return categoriesWithCount;
    } catch (error) {
      console.error('Error getting categories with product count:', error);
      throw error;
    }
  }
}

export const categoryService = new CategoryService();
export default categoryService;