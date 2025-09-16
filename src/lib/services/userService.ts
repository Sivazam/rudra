import { firestoreService } from '@/lib/firebase';
import { type IUser } from '@/lib/models/User';

interface Address {
  id?: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
  createdAt?: string;
}

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
        const updateData = { ...userData };
        
        // Preserve existing addresses and orderIds if not provided
        if (!updateData.addresses && existingUser.addresses) {
          updateData.addresses = existingUser.addresses;
        }
        if (!updateData.orderIds && existingUser.orderIds) {
          updateData.orderIds = existingUser.orderIds;
        }

        await firestoreService.update(this.collection, existingUser.id, updateData);
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

  // Add address to user
  async addAddress(userId: string, address: Omit<Address, 'id' | 'createdAt'>): Promise<void> {
    try {
      const user = await this.getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const addresses = user.addresses || [];
      const newAddress: Address = {
        ...address,
        id: `addr_${Date.now()}`,
        createdAt: new Date().toISOString(),
        isDefault: addresses.length === 0 // Make first address default
      };

      // If this is set as default, remove default from other addresses
      if (address.isDefault) {
        addresses.forEach(addr => addr.isDefault = false);
      }

      addresses.push(newAddress);

      await firestoreService.update(this.collection, userId, { addresses });
    } catch (error) {
      console.error('Error adding address:', error);
      throw error;
    }
  }

  // Update address
  async updateAddress(userId: string, addressId: string, updateData: Partial<Address>): Promise<void> {
    try {
      const user = await this.getUserById(userId);
      if (!user || !user.addresses) {
        throw new Error('User or addresses not found');
      }

      const addresses = user.addresses.map(addr => {
        if (addr.id === addressId) {
          // If this is set as default, remove default from other addresses
          if (updateData.isDefault) {
            user.addresses.forEach(otherAddr => {
              if (otherAddr.id !== addressId) {
                otherAddr.isDefault = false;
              }
            });
          }
          return { ...addr, ...updateData };
        }
        return addr;
      });

      await firestoreService.update(this.collection, userId, { addresses });
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  }

  // Remove address
  async removeAddress(userId: string, addressId: string): Promise<void> {
    try {
      const user = await this.getUserById(userId);
      if (!user || !user.addresses) {
        throw new Error('User or addresses not found');
      }

      const addresses = user.addresses.filter(addr => addr.id !== addressId);
      
      // If we removed the default address, make another one default
      if (addresses.length > 0 && !addresses.some(addr => addr.isDefault)) {
        addresses[0].isDefault = true;
      }

      await firestoreService.update(this.collection, userId, { addresses });
    } catch (error) {
      console.error('Error removing address:', error);
      throw error;
    }
  }

  // Add order to user's order history
  async addOrderToUser(userId: string, orderId: string): Promise<void> {
    try {
      const user = await this.getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const orderIds = user.orderIds || [];
      if (!orderIds.includes(orderId)) {
        orderIds.push(orderId);
        await firestoreService.update(this.collection, userId, { orderIds });
      }
    } catch (error) {
      console.error('Error adding order to user:', error);
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
      let orders = [];

      // Try to get orders by user ID first
      try {
        orders = await orderService.getOrdersByUserId(phoneNumber);
      } catch (error) {
        console.warn('Error getting orders by userId, trying alternative method:', error);
        
        // Fallback: get orders by orderIds if available
        if (user.orderIds && user.orderIds.length > 0) {
          try {
            const orderPromises = user.orderIds.map(orderId => 
              orderService.getOrderById(orderId).catch(() => null)
            );
            const orderResults = await Promise.all(orderPromises);
            orders = orderResults.filter(order => order !== null);
          } catch (fallbackError) {
            console.error('Fallback order fetching failed:', fallbackError);
          }
        }
      }

      return {
        ...user,
        orders
      };
    } catch (error) {
      console.error('Error getting user with orders:', error);
      throw error;
    }
  }

  // Get user addresses
  async getUserAddresses(userId: string): Promise<Address[]> {
    try {
      const user = await this.getUserById(userId);
      return user?.addresses || [];
    } catch (error) {
      console.error('Error getting user addresses:', error);
      throw error;
    }
  }

  // Get default address
  async getDefaultAddress(userId: string): Promise<Address | null> {
    try {
      const addresses = await this.getUserAddresses(userId);
      return addresses.find(addr => addr.isDefault) || addresses[0] || null;
    } catch (error) {
      console.error('Error getting default address:', error);
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