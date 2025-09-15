import orderService, { IOrder, IOrderItem, ICustomerInfo } from './orderService';
import productService, { IProduct, IProductMetadata } from './productService';
import categoryService, { ICategory } from './categoryService';
import variantService, { IVariant } from './variantService';
import discountService, { IDiscount } from './discountService';
import userService, { IUser } from './userService';

export {
  // Order Service
  orderService,
  type IOrder,
  type IOrderItem,
  type ICustomerInfo,
  
  // Product Service
  productService,
  type IProduct,
  type IProductMetadata,
  
  // Category Service
  categoryService,
  type ICategory,
  
  // Variant Service
  variantService,
  type IVariant,
  
  // Discount Service
  discountService,
  type IDiscount,
  
  // User Service
  userService,
  type IUser,
};

// Default exports
const services = {
  orderService,
  productService,
  categoryService,
  variantService,
  discountService,
  userService,
};

export default services;