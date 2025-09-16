'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MapPin, Plus, Edit, Trash2, Home, Building, Check } from 'lucide-react';
import { MainLayout } from '@/components/store/MainLayout';
import { isUserAuthenticated, getCurrentUser } from '@/lib/auth';
import { userService } from '@/lib/services';
import { useRouter } from 'next/navigation';

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

export default function AddressesPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [newAddress, setNewAddress] = useState<Address>({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthAndLoadAddresses();
  }, []);

  const checkAuthAndLoadAddresses = async () => {
    const authStatus = isUserAuthenticated();
    setIsAuthenticated(authStatus);
    
    if (!authStatus) {
      router.push('/auth/login');
      return;
    }

    await loadAddresses();
  };

  const loadAddresses = async () => {
    try {
      const currentUser = getCurrentUser();
      if (currentUser) {
        const user = await userService.getUserByPhoneNumber(currentUser.phoneNumber);
        if (user && user.addresses) {
          setAddresses(user.addresses);
        }
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async () => {
    if (!validateAddress(newAddress)) {
      alert('Please fill in all address fields');
      return;
    }

    try {
      const currentUser = getCurrentUser();
      if (currentUser) {
        const user = await userService.getUserByPhoneNumber(currentUser.phoneNumber);
        if (user) {
          await userService.addAddress(user.id!, newAddress);
          await loadAddresses();
          setNewAddress({
            name: '',
            phone: '',
            address: '',
            city: '',
            state: '',
            pincode: '',
            isDefault: false
          });
          setIsDialogOpen(false);
        }
      }
    } catch (error) {
      console.error('Error adding address:', error);
      alert('Failed to add address');
    }
  };

  const handleUpdateAddress = async () => {
    if (!editingAddress || !validateAddress(editingAddress)) {
      alert('Please fill in all address fields');
      return;
    }

    try {
      const currentUser = getCurrentUser();
      if (currentUser) {
        const user = await userService.getUserByPhoneNumber(currentUser.phoneNumber);
        if (user && editingAddress.id) {
          await userService.updateAddress(user.id!, editingAddress.id, editingAddress);
          await loadAddresses();
          setEditingAddress(null);
          setIsDialogOpen(false);
        }
      }
    } catch (error) {
      console.error('Error updating address:', error);
      alert('Failed to update address');
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      const currentUser = getCurrentUser();
      if (currentUser) {
        const user = await userService.getUserByPhoneNumber(currentUser.phoneNumber);
        if (user) {
          await userService.removeAddress(user.id!, addressId);
          await loadAddresses();
        }
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('Failed to delete address');
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      const currentUser = getCurrentUser();
      if (currentUser) {
        const user = await userService.getUserByPhoneNumber(currentUser.phoneNumber);
        if (user) {
          await userService.updateAddress(user.id!, addressId, { isDefault: true });
          await loadAddresses();
        }
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      alert('Failed to set default address');
    }
  };

  const openEditDialog = (address: Address) => {
    setEditingAddress(address);
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingAddress(null);
    setNewAddress({
      name: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      isDefault: false
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingAddress(null);
  };

  const validateAddress = (address: Address): boolean => {
    return Object.values(address).every(value => {
      if (value === undefined || value === null) return false;
      return value.toString().trim() !== '';
    });
  };

  const formatAddress = (address: Address): string => {
    return `${address.address}, ${address.city}, ${address.state} - ${address.pincode}`;
  };

  const getAddressType = (address: Address): string => {
    if (address.address.toLowerCase().includes('home') || address.address.toLowerCase().includes('house')) {
      return 'Home';
    } else if (address.address.toLowerCase().includes('office') || address.address.toLowerCase().includes('work')) {
      return 'Work';
    } else {
      return 'Other';
    }
  };

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Please login to view your addresses</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading addresses...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Addresses</h1>
              <p className="text-gray-600">Manage your saved addresses for quick checkout</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openAddDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Address
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingAddress ? 'Edit Address' : 'Add New Address'}
                  </DialogTitle>
                </DialogHeader>
                <AddressForm
                  address={editingAddress || newAddress}
                  setAddress={editingAddress ? setEditingAddress : setNewAddress}
                  onSave={editingAddress ? handleUpdateAddress : handleAddAddress}
                  onCancel={closeDialog}
                  isEditing={!!editingAddress}
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* Addresses Grid */}
          {addresses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {addresses.map((address) => (
                <Card key={address.id} className="relative hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getAddressType(address) === 'Home' ? (
                          <Home className="h-4 w-4 text-orange-600" />
                        ) : (
                          <Building className="h-4 w-4 text-blue-600" />
                        )}
                        <CardTitle className="text-lg">
                          {getAddressType(address)}
                        </CardTitle>
                      </div>
                      {address.isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="font-medium">{address.name}</p>
                      <p className="text-sm text-gray-600">{address.phone}</p>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {formatAddress(address)}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(address)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {addresses.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAddress(address.id!)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      {!address.isDefault && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSetDefault(address.id!)}
                          className="text-xs"
                        >
                          Set as Default
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-16">
                <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No saved addresses</h3>
                <p className="text-gray-600 mb-6">Save your addresses for a faster checkout experience</p>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={openAddDialog}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Address
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Add New Address</DialogTitle>
                    </DialogHeader>
                    <AddressForm
                      address={newAddress}
                      setAddress={setNewAddress}
                      onSave={handleAddAddress}
                      onCancel={closeDialog}
                      isEditing={false}
                    />
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

interface AddressFormProps {
  address: Address;
  setAddress: (address: Address) => void;
  onSave: () => void;
  onCancel: () => void;
  isEditing: boolean;
}

function AddressForm({ address, setAddress, onSave, onCancel, isEditing }: AddressFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={address.name}
            onChange={(e) => setAddress({ ...address, name: e.target.value })}
            placeholder="Enter full name"
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            value={address.phone}
            onChange={(e) => setAddress({ ...address, phone: e.target.value })}
            placeholder="Enter phone number"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="address">Address *</Label>
        <Input
          id="address"
          value={address.address}
          onChange={(e) => setAddress({ ...address, address: e.target.value })}
          placeholder="Enter complete address"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            value={address.city}
            onChange={(e) => setAddress({ ...address, city: e.target.value })}
            placeholder="City"
          />
        </div>
        <div>
          <Label htmlFor="state">State *</Label>
          <Input
            id="state"
            value={address.state}
            onChange={(e) => setAddress({ ...address, state: e.target.value })}
            placeholder="State"
          />
        </div>
        <div>
          <Label htmlFor="pincode">Pincode *</Label>
          <Input
            id="pincode"
            value={address.pincode}
            onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
            placeholder="Pincode"
          />
        </div>
      </div>
      
      {!isEditing && (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isDefault"
            checked={address.isDefault}
            onChange={(e) => setAddress({ ...address, isDefault: e.target.checked })}
            className="rounded border-gray-300 text-orange-600 focus:ring-orange-600"
          />
          <Label htmlFor="isDefault">Set as default address</Label>
        </div>
      )}
      
      <div className="flex space-x-2 pt-4">
        <Button onClick={onSave} className="flex-1">
          <Check className="h-4 w-4 mr-2" />
          {isEditing ? 'Update Address' : 'Add Address'}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}