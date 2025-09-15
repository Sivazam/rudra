"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/ui/shadcn/button";
import {
        Dialog,
        DialogContent,
        DialogDescription,
        DialogHeader,
        DialogTitle,
        DialogTrigger,
} from "@/ui/shadcn/dialog";
import { RadioGroup, RadioGroupItem } from "@/ui/shadcn/radio-group";
import { Label } from "@/ui/shadcn/label";
import { useCart } from "@/context/cart-context";
import { Plus } from "lucide-react";
import type { Product as CommerceProduct } from "commerce-kit";

interface VariantSelectionDialogProps {
        product: CommerceProduct;
        children: React.ReactNode;
        className?: string;
}

export function VariantSelectionDialog({ product, children, className }: VariantSelectionDialogProps) {
        const [open, setOpen] = useState(false);
        const [selectedVariant, setSelectedVariant] = useState<string>("");
        const [quantity, setQuantity] = useState(1);
        const { openCart, optimisticAdd } = useCart();

        // Mock variants for demonstration - in a real app, these would come from the product data
        const variants = [
                { id: product.id, name: "Standard", price: product.price },
                { id: `${product.id}-silver`, name: "Silver Capped", price: product.price * 1.2 },
                { id: `${product.id}-gold`, name: "Gold Capped", price: product.price * 1.5 },
                { id: `${product.id}-bracelet`, name: "Bracelet Style", price: product.price * 1.3 },
        ];

        const handleAddToCart = async () => {
                if (!selectedVariant) return;
                
                try {
                        await optimisticAdd(selectedVariant, quantity);
                        setOpen(false);
                        openCart();
                        // Reset selection
                        setSelectedVariant("");
                        setQuantity(1);
                } catch (error) {
                        console.error("Failed to add to cart:", error);
                }
        };

        return (
                <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                                <div className={className}>
                                        {children}
                                </div>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                                <DialogHeader>
                                        <DialogTitle>Select Variant</DialogTitle>
                                        <DialogDescription>
                                                Please select the variant you'd like to purchase for {product.name}
                                        </DialogDescription>
                                </DialogHeader>
                                
                                <div className="grid gap-6 py-4">
                                        {/* Product Image */}
                                        <div className="flex gap-4">
                                                <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                        {product.images[0] && (
                                                                <Image
                                                                        src={product.images[0]}
                                                                        alt={product.name}
                                                                        width={96}
                                                                        height={96}
                                                                        className="w-full h-full object-cover"
                                                                />
                                                        )}
                                                </div>
                                                <div>
                                                        <h3 className="font-semibold">{product.name}</h3>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                                Choose from our available variants below
                                                        </p>
                                                </div>
                                        </div>

                                        {/* Variant Selection */}
                                        <div className="space-y-3">
                                                <Label className="text-sm font-medium">Select Variant</Label>
                                                <RadioGroup
                                                        value={selectedVariant}
                                                        onValueChange={setSelectedVariant}
                                                        className="grid gap-3"
                                                >
                                                        {variants.map((variant) => (
                                                                <div key={variant.id} className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-gray-50">
                                                                        <RadioGroupItem value={variant.id} id={variant.id} />
                                                                        <Label htmlFor={variant.id} className="flex-1 cursor-pointer">
                                                                                <div className="flex justify-between items-center">
                                                                                        <span>{variant.name}</span>
                                                                                        <span className="font-medium">
                                                                                                {new Intl.NumberFormat("en-IN", {
                                                                                                        style: "currency",
                                                                                                        currency: product.currency,
                                                                                                }).format(variant.price)}
                                                                                        </span>
                                                                                </div>
                                                                        </Label>
                                                                </div>
                                                        ))}
                                                </RadioGroup>
                                        </div>

                                        {/* Quantity Selection */}
                                        <div className="space-y-3">
                                                <Label className="text-sm font-medium">Quantity</Label>
                                                <div className="flex items-center gap-3">
                                                        <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                                disabled={quantity <= 1}
                                                        >
                                                                -
                                                        </Button>
                                                        <span className="w-12 text-center">{quantity}</span>
                                                        <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setQuantity(quantity + 1)}
                                                        >
                                                                +
                                                        </Button>
                                                </div>
                                        </div>
                                </div>

                                <div className="flex justify-end gap-3">
                                        <Button variant="outline" onClick={() => setOpen(false)}>
                                                Cancel
                                        </Button>
                                        <Button 
                                                onClick={handleAddToCart}
                                                disabled={!selectedVariant}
                                                className="bg-orange-600 hover:bg-orange-700"
                                        >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add to Cart
                                        </Button>
                                </div>
                        </DialogContent>
                </Dialog>
        );
}