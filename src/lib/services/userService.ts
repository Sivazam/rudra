import { firestoreService } from '@/lib/firebase';
import { type IUser } from '@/lib/models/User';

class UserService {
  private collection = 'users';

  // Create or update user
  async createOrUpdateUser(userData: Omit<IUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      // Check if user already exists
      const existingUsers = await firestoreService.getAll(this.collection, {
        where: { field: 'phoneNumber', operator: '==', value: userData.phoneNumber }
      });

      if (existingUsers.length > 0) {
        // Update existing user
        const existingUser = existingUsers[0];
        await firestoreService.update(this.collection, existingUser.id, userData);
        return existingUser.id;
      } else {
        // Create new user
        return await firestoreService.create(this.collection, userData);
      }
    } catch (error) {
      console.error('Error creating/updating user:', error);
      throw error;
    }
  }

  // Get user by phone number
  async getUserByPhoneNumber(phoneNumber: string): Promise<IUser | null> {
    try {
      const users = await firestoreService.getAll(this.collection, {
        where: { field: 'phoneNumber', operator: '==', value: phoneNumber }
      });
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error('Error getting user by phone number:', error);
      throw error;
    }
  }

  // Get user by ID
  async getUserById(id: string): Promise<IUser | null> {
    try {
      return await firestoreService.getById(this.collection, id);
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }

  // Update user
  async updateUser(id: string, updateData: Partial<IUser>): Promise<void> {
    try {
      await firestoreService.update(this.collection, id, updateData);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Get user with orders
  async getUserWithOrders(phoneNumber: string): Promise<IUser & { orders?: any[] } | null> {
    try {
      const user = await this.getUserByPhoneNumber(phoneNumber);
      if (!user) {
        return null;
      }

      // Get user orders
      const { orderService } = await import('./orderService');
      const orders = await orderService.getOrdersByUserId(phoneNumber);

      return {
        ...user,
        orders
      };
    } catch (error) {
      console.error('Error getting user with orders:', error);
      throw error;
    }
  }

  // Delete user
  async deleteUser(id: string): Promise<void> {
    try {
      await firestoreService.delete(this.collection, id);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
}

export const userService = new UserService();
export default userService;