'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Plus, Edit, Trash2, Check } from 'lucide-react';
import { userService } from '@/lib/services';
import { getCurrentUser } from '@/lib/auth';

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

interface AddressSelectionProps {
  onAddressSelect: (address: Address) => void;
  selectedAddress?: Address;
}

export function AddressSelection({ onAddressSelect, selectedAddress }: AddressSelectionProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
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

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const currentUser = getCurrentUser();
      if (currentUser) {
        console.log('Loading addresses for user:', currentUser.phoneNumber);
        const user = await userService.getUserByPhoneNumber(currentUser.phoneNumber);
        if (user && user.addresses) {
          console.log('Found user with addresses:', user.addresses.length, user.addresses);
          setAddresses(user.addresses);
          
          // Auto-select default address if none is selected
          if (!selectedAddress) {
            const defaultAddress = user.addresses.find(addr => addr.isDefault) || user.addresses[0];
            if (defaultAddress) {
              console.log('Auto-selecting default address:', defaultAddress);
              onAddressSelect(defaultAddress);
            }
          }
        } else {
          console.log('User found but no addresses:', user);
        }
      } else {
        console.log('No current user found');
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
          setShowAddForm(false);
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

  const validateAddress = (address: Address): boolean => {
    return Object.values(address).every(value => {
      if (value === undefined || value === null) return false;
      return value.toString().trim() !== '';
    });
  };

  const formatAddress = (address: Address): string => {
    return `${address.address}, ${address.city}, ${address.state} - ${address.pincode}`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Shipping Address
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading addresses...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Shipping Address
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {addresses.length > 0 ? (
          <>
            <RadioGroup
              value={selectedAddress?.id || ''}
              onValueChange={(value) => {
                console.log('Radio button changed to:', value);
                const address = addresses.find(addr => addr.id === value);
                if (address) {
                  console.log('Found address, calling onAddressSelect:', address);
                  onAddressSelect(address);
                } else {
                  console.log('No address found for id:', value);
                }
              }}
              className="space-y-3"
            >
              {addresses.map((address) => (
                <div key={address.id} className="relative">
                  <RadioGroupItem
                    value={address.id || ''}
                    id={address.id}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={address.id}
                    className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors peer-data-[state=checked]:border-orange-600 peer-data-[state=checked]:bg-orange-50 hover:bg-gray-50 ${
                      selectedAddress?.id === address.id ? 'border-orange-600 bg-orange-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{address.name}</span>
                          <span className="text-sm text-gray-600">{address.phone}</span>
                          {address.isDefault && (
                            <Badge variant="secondary" className="text-xs">
                              Default
                            </Badge>
                          )}
                        </div>
                        {selectedAddress?.id === address.id && (
                          <Check className="h-4 w-4 text-orange-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{formatAddress(address)}</p>
                    </div>
                  </Label>
                  
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingAddress(address)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {!address.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetDefault(address.id!)}
                        className="h-8 w-8 p-0"
                      >
                        <span className="text-xs">Set Default</span>
                      </Button>
                    )}
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
                </div>
              ))}
            </RadioGroup>
            
            <Separator />
          </>
        ) : (
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 mb-4">No saved addresses found</p>
          </div>
        )}

        {showAddForm || editingAddress ? (
          <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
            <h3 className="font-medium">
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={editingAddress ? editingAddress.name : newAddress.name}
                  onChange={(e) => {
                    if (editingAddress) {
                      setEditingAddress({ ...editingAddress, name: e.target.value });
                    } else {
                      setNewAddress({ ...newAddress, name: e.target.value });
                    }
                  }}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={editingAddress ? editingAddress.phone : newAddress.phone}
                  onChange={(e) => {
                    if (editingAddress) {
                      setEditingAddress({ ...editingAddress, phone: e.target.value });
                    } else {
                      setNewAddress({ ...newAddress, phone: e.target.value });
                    }
                  }}
                  placeholder="Enter phone number"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={editingAddress ? editingAddress.address : newAddress.address}
                onChange={(e) => {
                  if (editingAddress) {
                    setEditingAddress({ ...editingAddress, address: e.target.value });
                  } else {
                    setNewAddress({ ...newAddress, address: e.target.value });
                  }
                }}
                placeholder="Enter complete address"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={editingAddress ? editingAddress.city : newAddress.city}
                  onChange={(e) => {
                    if (editingAddress) {
                      setEditingAddress({ ...editingAddress, city: e.target.value });
                    } else {
                      setNewAddress({ ...newAddress, city: e.target.value });
                    }
                  }}
                  placeholder="City"
                />
              </div>
              <div>
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={editingAddress ? editingAddress.state : newAddress.state}
                  onChange={(e) => {
                    if (editingAddress) {
                      setEditingAddress({ ...editingAddress, state: e.target.value });
                    } else {
                      setNewAddress({ ...newAddress, state: e.target.value });
                    }
                  }}
                  placeholder="State"
                />
              </div>
              <div>
                <Label htmlFor="pincode">Pincode *</Label>
                <Input
                  id="pincode"
                  value={editingAddress ? editingAddress.pincode : newAddress.pincode}
                  onChange={(e) => {
                    if (editingAddress) {
                      setEditingAddress({ ...editingAddress, pincode: e.target.value });
                    } else {
                      setNewAddress({ ...newAddress, pincode: e.target.value });
                    }
                  }}
                  placeholder="Pincode"
                />
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={editingAddress ? handleUpdateAddress : handleAddAddress}
                className="flex-1"
              >
                {editingAddress ? 'Update Address' : 'Add Address'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingAddress(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={() => setShowAddForm(true)}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Address
          </Button>
        )}
      </CardContent>
    </Card>
  );
}