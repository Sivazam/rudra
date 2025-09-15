"use client";

import { useState } from "react";
import { Button } from "@/ui/shadcn/button";
import {
        Dialog,
        DialogContent,
        DialogDescription,
        DialogFooter,
        DialogHeader,
        DialogTitle,
        DialogTrigger,
} from "@/ui/shadcn/dialog";
import {
        Select,
        SelectContent,
        SelectItem,
        SelectTrigger,
        SelectValue,
} from "@/ui/shadcn/select";
import { AddToCart } from "@/components/add-to-cart";
import type { YnsProduct } from "commerce-kit";

interface VariantSelectionModalProps {
        product: YnsProduct;
        children: React.ReactNode;
        className?: string;
}

export function VariantSelectionModal({ product, children, className }: VariantSelectionModalProps) {
        const [open, setOpen] = useState(false);
        const [selectedVariant, setSelectedVariant] = useState<string>("");
        const [quantity, setQuantity] = useState("1");

        const handleAddToCart = () => {
                if (!selectedVariant) return;
                
                const variantId = selectedVariant || product.variants[0]?.id || product.id;
                const quantityNum = parseInt(quantity) || 1;
                
                // Here you would typically call the add to cart function
                // For now, we'll close the modal and let the parent handle it
                setOpen(false);
                
                // You could trigger a toast notification here
                console.log(`Added ${quantityNum} of variant ${selectedVariant} to cart`);
        };

        return (
                <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                                <div className={className}>
                                        {children}
                                </div>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                        <DialogTitle>Select Product Options</DialogTitle>
                                        <DialogDescription>
                                                Please select the variant and quantity for {product.name}.
                                        </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                        {product.variants && product.variants.length > 0 && (
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                        <label htmlFor="variant" className="text-right">
                                                                Variant
                                                        </label>
                                                        <Select value={selectedVariant} onValueChange={setSelectedVariant}>
                                                                <SelectTrigger className="col-span-3">
                                                                        <SelectValue placeholder="Select a variant" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                        {product.variants.map((variant) => (
                                                                                <SelectItem key={variant.id} value={variant.id}>
                                                                                        {variant.name || `Variant ${variant.id}`}
                                                                                </SelectItem>
                                                                        ))}
                                                                </SelectContent>
                                                        </Select>
                                                </div>
                                        )}
                                        <div className="grid grid-cols-4 items-center gap-4">
                                                <label htmlFor="quantity" className="text-right">
                                                        Quantity
                                                </label>
                                                <Select value={quantity} onValueChange={setQuantity}>
                                                        <SelectTrigger className="col-span-3">
                                                                <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                                                        <SelectItem key={num} value={num.toString()}>
                                                                                {num}
                                                                        </SelectItem>
                                                                ))}
                                                        </SelectContent>
                                                </Select>
                                        </div>
                                </div>
                                <DialogFooter>
                                        <Button variant="outline" onClick={() => setOpen(false)}>
                                                Cancel
                                        </Button>
                                        <AddToCart
                                                variantId={selectedVariant || product.variants[0]?.id || product.id}
                                                quantity={parseInt(quantity) || 1}
                                                className="bg-orange-600 hover:bg-orange-700"
                                                onSuccess={() => setOpen(false)}
                                        >
                                                Add to Cart
                                        </AddToCart>
                                </DialogFooter>
                        </DialogContent>
                </Dialog>
        );
}