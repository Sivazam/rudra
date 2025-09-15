export interface IUser {
  id?: string;
  phoneNumber: string;
  name?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface IUserWithOrders extends IUser {
  orders?: any[];
}