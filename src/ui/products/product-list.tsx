import type { Product } from "commerce-kit";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import { Button } from "@/ui/shadcn/button";
import { VariantSelectionDialog } from "@/components/variant-selection-dialog";
import { getLocale } from "@/i18n/server";
import { formatMoney } from "@/lib/utils";
import { JsonLd, mappedProductsToJsonLd } from "@/ui/json-ld";
import { YnsLink } from "@/ui/yns-link";

export const ProductList = async ({ products }: { products: Product[] }) => {
        const locale = await getLocale();

        return (
                <>
                        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {products.map((product, idx) => {
                                        return (
                                                <li key={product.id} className="group">
                                                        <article className="overflow-hidden bg-white rounded-lg shadow-sm border">
                                                                <YnsLink href={`/product/${product.slug}`}>
                                                                        {product.images[0] && (
                                                                                <div className="rounded-t-lg aspect-square w-full overflow-hidden bg-neutral-100">
                                                                                        <Image
                                                                                                className="group-hover:rotate hover-perspective w-full bg-neutral-100 object-cover object-center transition-opacity group-hover:opacity-75"
                                                                                                src={product.images[0]}
                                                                                                width={768}
                                                                                                height={768}
                                                                                                loading={idx < 3 ? "eager" : "lazy"}
                                                                                                priority={idx < 3}
                                                                                                sizes="(max-width: 1024x) 100vw, (max-width: 1280px) 50vw, 700px"
                                                                                                alt=""
                                                                                        />
                                                                                </div>
                                                                        )}
                                                                </YnsLink>
                                                                <div className="p-4">
                                                                        <YnsLink href={`/product/${product.slug}`}>
                                                                                <h2 className="text-xl font-medium text-neutral-700 hover:text-orange-600 transition-colors">
                                                                                        {product.name}
                                                                                </h2>
                                                                        </YnsLink>
                                                                        <div className="mt-2 flex items-center justify-between">
                                                                                <div className="text-base font-normal text-neutral-900">
                                                                                        {product.price && (
                                                                                                <p>
                                                                                                        {formatMoney({
                                                                                                                amount: product.price,
                                                                                                                currency: product.currency,
                                                                                                                locale,
                                                                                                        })}
                                                                                                </p>
                                                                                        )}
                                                                                </div>
                                                                                <VariantSelectionDialog product={product}>
                                                                                        <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
                                                                                                <ShoppingCart className="h-4 w-4" />
                                                                                        </Button>
                                                                                </VariantSelectionDialog>
                                                                        </div>
                                                                </div>
                                                        </article>
                                                </li>
                                        );
                                })}
                        </ul>
                        <JsonLd jsonLd={mappedProductsToJsonLd(products)} />
                </>
        );
};
