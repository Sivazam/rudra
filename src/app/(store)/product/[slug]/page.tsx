import type { YnsProduct } from "commerce-kit";
import { Heart, Shield, Star, Zap } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next/types";
import { Suspense } from "react";
import { ProductImageModal } from "@/app/(store)/product/[slug]/product-image-modal";
import { AddToCart } from "@/components/add-to-cart";
import {
        Breadcrumb,
        BreadcrumbItem,
        BreadcrumbLink,
        BreadcrumbList,
        BreadcrumbPage,
        BreadcrumbSeparator,
} from "@/ui/shadcn/breadcrumb";
import { Button } from "@/ui/shadcn/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/shadcn/tabs";
import { publicUrl } from "@/env.mjs";
import { getLocale, getTranslations } from "@/i18n/server";
import { commerce } from "@/lib/commerce";
import { deslugify, formatMoney } from "@/lib/utils";
import { JsonLd, mappedProductToJsonLd } from "@/ui/json-ld";
import { Markdown } from "@/ui/markdown";
import { MainProductImage } from "@/ui/products/main-product-image";
import { YnsLink } from "@/ui/yns-link";

export const generateMetadata = async (props: {
        params: Promise<{ slug: string }>;
        searchParams: Promise<{ variant?: string }>;
}): Promise<Metadata> => {
        const params = await props.params;
        const product = await commerce.product.get({ slug: params.slug });

        if (!product) {
                return notFound();
        }
        const t = await getTranslations("/product.metadata");

        const canonical = new URL(`${publicUrl}/product/${params.slug}`);

        return {
                title: t("title", { productName: product.name }),
                description: product.summary,
                alternates: { canonical },
        } satisfies Metadata;
};

export default async function SingleProductPage(props: {
        params: Promise<{ slug: string }>;
        searchParams: Promise<{ variant?: string; image?: string }>;
}) {
        const params = await props.params;

        const product = await commerce.product.get({ slug: params.slug });

        if (!product) {
                return notFound();
        }

        const t = await getTranslations("/product.page");
        const locale = await getLocale();

        // Cast to YnsProduct to access YNS-specific fields
        const ynsProduct = product as YnsProduct;
        const category = ynsProduct.category?.slug;
        const images = product.images;

        return (
                <article className="pb-12 bg-white">
                        <Breadcrumb className="px-4 py-4 bg-gray-50">
                                <BreadcrumbList>
                                        <BreadcrumbItem>
                                                <BreadcrumbLink asChild className="inline-flex min-h-12 min-w-12 items-center justify-center">
                                                        <YnsLink href="/">{t("allProducts")}</YnsLink>
                                                </BreadcrumbLink>
                                        </BreadcrumbItem>
                                        {category && (
                                                <>
                                                        <BreadcrumbSeparator />
                                                        <BreadcrumbItem>
                                                                <BreadcrumbLink className="inline-flex min-h-12 min-w-12 items-center justify-center" asChild>
                                                                        <YnsLink href={`/category/${category}`}>{deslugify(category)}</YnsLink>
                                                                </BreadcrumbLink>
                                                        </BreadcrumbItem>
                                                </>
                                        )}
                                        <BreadcrumbSeparator />
                                        <BreadcrumbItem>
                                                <BreadcrumbPage>{product.name}</BreadcrumbPage>
                                        </BreadcrumbItem>
                                </BreadcrumbList>
                        </Breadcrumb>

                        <div className="container mx-auto px-4 py-8">
                                <div className="grid gap-8 lg:grid-cols-2">
                                        {/* Product Images */}
                                        <div className="space-y-4">
                                                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                                        {images[0] && (
                                                                <MainProductImage
                                                                        src={images[0]}
                                                                        className="w-full h-full object-cover"
                                                                        loading="eager"
                                                                        priority
                                                                        alt={product.name}
                                                                />
                                                        )}
                                                </div>
                                                <div className="grid grid-cols-4 gap-2">
                                                        {images.slice(1, 5).map((image, idx) => (
                                                                <div
                                                                        key={idx}
                                                                        className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                                                                >
                                                                        <Image
                                                                                src={image}
                                                                                alt={`${product.name} view ${idx + 2}`}
                                                                                width={100}
                                                                                height={100}
                                                                                className="w-full h-full object-cover"
                                                                        />
                                                                </div>
                                                        ))}
                                                </div>
                                        </div>

                                        {/* Product Details */}
                                        <div className="space-y-6">
                                                <div>
                                                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                                                        <div className="flex items-center gap-2 mb-4">
                                                                <div className="flex items-center">
                                                                        {[...Array(5)].map((_, i) => (
                                                                                <Star
                                                                                        key={i}
                                                                                        className={`h-4 w-4 ${i < 4 ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                                                                                />
                                                                        ))}
                                                                </div>
                                                                <span className="text-sm text-gray-600">4.7 (547 reviews)</span>
                                                        </div>

                                                        {/* Price */}
                                                        <div className="flex items-center gap-3 mb-4">
                                                                <span className="text-3xl font-bold text-orange-600">
                                                                        {formatMoney({
                                                                                amount: product.price,
                                                                                currency: product.currency,
                                                                                locale,
                                                                        })}
                                                                </span>
                                                                <span className="text-lg text-gray-500 line-through">
                                                                        {formatMoney({
                                                                                amount: product.price * 1.25, // 25% off
                                                                                currency: product.currency,
                                                                                locale,
                                                                        })}
                                                                </span>
                                                                <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded">25% OFF</span>
                                                        </div>

                                                        {/* Origin */}
                                                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                                                                <Shield className="h-4 w-4" />
                                                                <span>Origin: Nepali</span>
                                                        </div>
                                                </div>

                                                {/* Product Specifications */}
                                                <div className="bg-gray-50 rounded-lg p-6">
                                                        <h3 className="text-lg font-semibold mb-4">Product Specifications</h3>
                                                        <div className="grid grid-cols-2 gap-4">
                                                                <div className="flex items-center gap-2">
                                                                        <Zap className="h-4 w-4 text-orange-600" />
                                                                        <span className="text-sm">Aura Cleansing</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                        <Heart className="h-4 w-4 text-orange-600" />
                                                                        <span className="text-sm">Positive Energies</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                        <Shield className="h-4 w-4 text-orange-600" />
                                                                        <span className="text-sm">Spiritual Growth</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                        <Star className="h-4 w-4 text-orange-600" />
                                                                        <span className="text-sm">Meditation Aid</span>
                                                                </div>
                                                        </div>
                                                </div>

                                                {/* Add to Cart Buttons */}
                                                <div className="space-y-3">
                                                        <AddToCart
                                                                variantId={ynsProduct.variants[0]?.id || product.id}
                                                                className={`w-full py-3 text-lg font-semibold ${(product.stock || 0) <= 0 ? "opacity-50 cursor-not-allowed bg-gray-400" : "bg-orange-600 hover:bg-orange-700"}`}
                                                        >
                                                                {(product.stock || 0) <= 0 ? "Out of Stock" : "Add to Cart"}
                                                        </AddToCart>
                                                        <Button
                                                                className="w-full py-3 text-lg font-semibold border-2 border-orange-600 text-orange-600 hover:bg-orange-50"
                                                                variant="outline"
                                                                disabled={(product.stock || 0) <= 0}
                                                        >
                                                                Buy Now
                                                        </Button>
                                                </div>

                                                {/* Product Information Tabs */}
                                                <Tabs defaultValue="description" className="w-full">
                                                        <TabsList className="grid w-full grid-cols-3">
                                                                <TabsTrigger value="description">Description</TabsTrigger>
                                                                <TabsTrigger value="wear-guide">Wear Guide</TabsTrigger>
                                                                <TabsTrigger value="care-guide">Care Guide</TabsTrigger>
                                                        </TabsList>
                                                        <TabsContent value="description" className="mt-4">
                                                                <div className="prose text-secondary-foreground">
                                                                        <Markdown
                                                                                source={
                                                                                        product.summary || "High-quality Rudraksha bead with authentic spiritual properties."
                                                                                }
                                                                        />
                                                                </div>
                                                        </TabsContent>
                                                        <TabsContent value="wear-guide" className="mt-4">
                                                                <div className="space-y-3 text-sm text-gray-700">
                                                                        <h4 className="font-semibold">Rudraksha Wear Guide</h4>
                                                                        <ul className="space-y-2">
                                                                                <li>• Wear on Monday morning after bathing</li>
                                                                                <li>• Chant "Om Namah Shivaya" 11 times before wearing</li>
                                                                                <li>• Touch the Rudraksha to your heart and forehead</li>
                                                                                <li>• Remove during sleep, bath, and toilet visits</li>
                                                                                <li>• Women should remove during menstrual periods</li>
                                                                        </ul>
                                                                </div>
                                                        </TabsContent>
                                                        <TabsContent value="care-guide" className="mt-4">
                                                                <div className="space-y-3 text-sm text-gray-700">
                                                                        <h4 className="font-semibold">Care Guide</h4>
                                                                        <ul className="space-y-2">
                                                                                <li>• Clean with soft cloth and mild soap</li>
                                                                                <li>• Avoid exposure to chemicals and perfumes</li>
                                                                                <li>• Store in a clean, dry place</li>
                                                                                <li>• Do not share with others</li>
                                                                                <li>• Re-energize by placing in sunlight for 1 hour monthly</li>
                                                                        </ul>
                                                                </div>
                                                        </TabsContent>
                                                </Tabs>
                                        </div>
                                </div>
                        </div>

                        <Suspense>
                                <SimilarProducts id={product.id} />
                        </Suspense>

                        <Suspense>
                                <ProductImageModal images={images} />
                        </Suspense>

                        <JsonLd jsonLd={mappedProductToJsonLd(product)} />
                </article>
        );
}

async function SimilarProducts({ id }: { id: string }) {
        // TODO: Implement similar products functionality
        return null;
}
