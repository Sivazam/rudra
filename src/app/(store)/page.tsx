import { Heart, ShoppingCart, Star } from "lucide-react";
import Image from "next/image";
import type { Metadata } from "next/types";
import { VariantSelectionDialog } from "@/components/variant-selection-dialog";
import { publicUrl } from "@/env.mjs";
import { getTranslations } from "@/i18n/server";
import { commerce } from "@/lib/commerce";
import StoreConfig from "@/store.config";
import { CategoryBox } from "@/ui/category-box";
import { ProductList } from "@/ui/products/product-list";
import { Button } from "@/ui/shadcn/button";
import { YnsLink } from "@/ui/yns-link";

export const metadata: Metadata = {
	alternates: { canonical: publicUrl },
};

export default async function Home() {
	try {
		// Load products from YNS using REST API (default behavior)
		const result = await commerce.product.browse({ first: 12 });
		const t = await getTranslations("/");

		const products = result.data || [];

		return (
			<main className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
				{/* Hero Section */}
				<section className="relative bg-gradient-to-r from-orange-600 to-orange-800 text-white py-16 px-4">
					<div className="max-w-7xl mx-auto text-center">
						<h1 className="text-4xl md:text-6xl font-bold mb-4">Sanathan Rudraksha</h1>
						<p className="text-xl md:text-2xl mb-8 text-orange-100">handmade RUDRAKSHA MALA</p>
						<div className="flex justify-center space-x-4">
							<Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50">
								Shop Now
							</Button>
							<Button
								size="lg"
								variant="outline"
								className="border-white text-white hover:bg-white hover:text-orange-600"
							>
								Learn More
							</Button>
						</div>
					</div>
				</section>

				{/* Category Navigation */}
				<section className="py-8 px-4 bg-white shadow-sm">
					<div className="max-w-7xl mx-auto">
						<div className="flex flex-wrap justify-center gap-4 md:gap-8">
							{[
								{ name: "Rudraksha", href: "/category/rudraksha" },
								{ name: "Malas", href: "/category/malas" },
								{ name: "Bracelets", href: "/category/bracelets" },
								{ name: "Gemstones", href: "/category/gemstones" },
								{ name: "Yantras", href: "/category/yantras" },
							].map((category) => (
								<YnsLink
									key={category.name}
									href={category.href}
									className="px-6 py-3 rounded-full bg-orange-100 text-orange-800 hover:bg-orange-200 transition-colors font-medium"
								>
									{category.name}
								</YnsLink>
							))}
						</div>
					</div>
				</section>

				{/* Products Section */}
				<section className="py-12 px-4">
					<div className="max-w-7xl mx-auto">
						<div className="flex items-center justify-between mb-8">
							<h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
							<div className="text-orange-600 font-medium">12 results</div>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
							{products
								.slice(0, 12)
								.map(
									(product: {
										id: string;
										name: string;
										description: string;
										price?: number;
										images?: { url: string }[];
									}) => (
										<div
											key={product.id}
											className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
										>
											{/* Product Image */}
											<div className="relative aspect-square bg-gray-100">
												{product.images?.[0] && (
													<Image
														src={product.images[0].url}
														alt={product.name}
														fill
														className="object-cover"
													/>
												)}
												<button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50">
													<Heart className="h-4 w-4 text-gray-600" />
												</button>
											</div>

											{/* Product Info */}
											<div className="p-4">
												<h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
												<p className="text-sm text-gray-600 mb-2">{product.description}</p>

												{/* Rating */}
												<div className="flex items-center mb-3">
													<div className="flex items-center">
														{[...Array(5)].map((_, i) => (
															<Star
																key={i}
																className={`h-4 w-4 ${i < 4 ? "text-yellow-400 fill-current" : "text-gray-300"}`}
															/>
														))}
													</div>
													<span className="ml-2 text-sm text-gray-600">4.7 (547)</span>
												</div>

												{/* Price and Add Button */}
												<div className="flex items-center justify-between">
													<div className="text-xl font-bold text-orange-600">
														₹{product.price?.toFixed(2) || "1,499.00"}
													</div>
													<VariantSelectionDialog product={product}>
														<Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
															<ShoppingCart className="h-4 w-4" />
														</Button>
													</VariantSelectionDialog>
												</div>
											</div>
										</div>
									),
								)}
						</div>
					</div>
				</section>

				{/* Original Category Section */}
				<section className="w-full py-8 px-4">
					<div className="max-w-7xl mx-auto">
						<h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Shop by Category</h2>
						<div className="grid gap-8 lg:grid-cols-2">
							{StoreConfig.categories.map(({ slug, image }) => (
								<CategoryBox key={slug} categorySlug={slug} src={image.src} />
							))}
						</div>
					</div>
				</section>
			</main>
		);
	} catch (error) {
		console.error("Error in Home component:", error);
		const t = await getTranslations("/");

		// Fallback to empty products if YNS fails
		const products: never[] = [];

		return (
			<main className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
				{/* Hero Section */}
				<section className="relative bg-gradient-to-r from-orange-600 to-orange-800 text-white py-16 px-4">
					<div className="max-w-7xl mx-auto text-center">
						<h1 className="text-4xl md:text-6xl font-bold mb-4">Sanathan Rudraksha</h1>
						<p className="text-xl md:text-2xl mb-8 text-orange-100">handmade RUDRAKSHA MALA</p>
						<div className="flex justify-center space-x-4">
							<Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50">
								Shop Now
							</Button>
							<Button
								size="lg"
								variant="outline"
								className="border-white text-white hover:bg-white hover:text-orange-600"
							>
								Learn More
							</Button>
						</div>
					</div>
				</section>

				{/* Category Navigation */}
				<section className="py-8 px-4 bg-white shadow-sm">
					<div className="max-w-7xl mx-auto">
						<div className="flex flex-wrap justify-center gap-4 md:gap-8">
							{[
								{ name: "Rudraksha", href: "/category/rudraksha" },
								{ name: "Malas", href: "/category/malas" },
								{ name: "Bracelets", href: "/category/bracelets" },
								{ name: "Gemstones", href: "/category/gemstones" },
								{ name: "Yantras", href: "/category/yantras" },
							].map((category) => (
								<YnsLink
									key={category.name}
									href={category.href}
									className="px-6 py-3 rounded-full bg-orange-100 text-orange-800 hover:bg-orange-200 transition-colors font-medium"
								>
									{category.name}
								</YnsLink>
							))}
						</div>
					</div>
				</section>

				{/* Products Section */}
				<section className="py-12 px-4">
					<div className="max-w-7xl mx-auto">
						<div className="flex items-center justify-between mb-8">
							<h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
							<div className="text-orange-600 font-medium">12 results</div>
						</div>

						<div className="text-center py-12">
							<p className="text-gray-600 mb-4">No products available at the moment.</p>
							<p className="text-sm text-red-500">
								Error loading products: {error instanceof Error ? error.message : "Unknown error"}
							</p>
						</div>
					</div>
				</section>

				{/* Original Category Section */}
				<section className="w-full py-8 px-4">
					<div className="max-w-7xl mx-auto">
						<h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Shop by Category</h2>
						<div className="grid gap-8 lg:grid-cols-2">
							{StoreConfig.categories.map(({ slug, image }) => (
								<CategoryBox key={slug} categorySlug={slug} src={image.src} />
							))}
						</div>
					</div>
				</section>
			</main>
		);
	}
}
