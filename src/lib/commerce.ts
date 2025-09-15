// Local commerce configuration using MongoDB
import { dbConnect } from "./db";
import { Category, Product, Variant } from "./models";

// Commerce operations using local database
export const commerce = {
	// Product operations
	product: {
		browse: async ({ first = 12, category, search } = {}) => {
			try {
				await dbConnect();

				let query: { isActive: boolean; category?: any; $or?: any[] } = { isActive: true };

				if (category) {
					const categoryDoc = await Category.findOne({ slug: category }).maxTimeMS(5000);
					if (categoryDoc) {
						query.category = categoryDoc._id;
					}
				}

				if (search) {
					query.$or = [
						{ name: { $regex: search, $options: "i" } },
						{ description: { $regex: search, $options: "i" } },
						{ spiritualMeaning: { $regex: search, $options: "i" } },
					];
				}

				const products = await Product.find(query)
					.populate("category")
					.limit(first)
					.sort({ createdAt: -1 })
					.maxTimeMS(5000);

				return {
					data: products.map((product) => ({
						id: product._id.toString(),
						name: product.name,
						slug: product.slug,
						description: product.description,
						price: 1499, // Default price - will be overridden by variants
						images: product.images.map((url) => ({ url })),
						category: product.category.name,
						featured: product.featured,
					})),
					totalCount: products.length,
				};
			} catch (error) {
				console.error("Error in commerce.product.browse:", error);
				return {
					data: [],
					totalCount: 0,
				};
			}
		},

		findBySlug: async (slug: string) => {
			await dbConnect();

			const product = await Product.findOne({ slug, isActive: true }).populate("category");

			if (!product) return null;

			const variants = await Variant.find({ product: product._id, isActive: true });

			return {
				id: product._id.toString(),
				name: product.name,
				slug: product.slug,
				description: product.description,
				spiritualMeaning: product.spiritualMeaning,
				deity: product.deity,
				images: product.images.map((url) => ({ url })),
				category: product.category.name,
				featured: product.featured,
				variants: variants.map((variant) => ({
					id: variant._id.toString(),
					type: variant.type,
					options: variant.options.map((option) => ({
						label: option.label,
						price: option.price,
						sku: option.sku,
						inventory: option.inventory,
						discount: option.discount,
					})),
				})),
			};
		},
	},

	// Category operations
	category: {
		list: async () => {
			await dbConnect();

			const categories = await Category.find({ isActive: true }).sort({ name: 1 });

			return categories.map((category) => ({
				id: category._id.toString(),
				name: category.name,
				slug: category.slug,
				description: category.description,
				iconUrl: category.iconUrl,
			}));
		},

		findBySlug: async (slug: string) => {
			await dbConnect();

			const category = await Category.findOne({ slug, isActive: true });

			if (!category) return null;

			return {
				id: category._id.toString(),
				name: category.name,
				slug: category.slug,
				description: category.description,
				iconUrl: category.iconUrl,
			};
		},
	},
};

export default commerce;
