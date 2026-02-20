import { z } from "zod";

export const variantSchema = z.object({
    label: z.string().min(1, "Label is required"),
    type: z.enum(["SIZE", "COMBO"]).default("SIZE"),
    unit: z.string().optional(),
    price: z.number().positive("Price must be positive"),
    mrp: z.number().positive("MRP must be positive"),
    discount: z.number().min(0).max(100).optional().default(0),
    stock: z.number().int().min(0).default(0),
    realStock: z.number().int().min(0).optional().default(0),
    inStock: z.number().int().min(0).optional().default(0),
    isDefault: z.boolean().optional().default(false)
}).refine(data => data.price <= data.mrp, {
    message: "Price cannot be greater than MRP",
    path: ["price"]
});

const productBaseSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters").max(200),
    description: z.string().optional(),
    images: z.array(z.string().url()).min(1, "At least one image is required"),
    type: z.string().optional(),
    brand: z.string().optional(),
    flavor: z.string().optional(),
    itemForm: z.string().optional(),
    ingredients: z.string().optional(),
    nutritionInformation: z.string().optional(),
    packagingType: z.string().optional(),
    storageInstruction: z.string().optional(),
    dietaryPreference: z.string().optional(),
    canReturn: z.boolean().optional(),
    isDeliverableEverywhere: z.boolean().optional().default(true),
    availableLocations: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    collections: z.array(z.string()).optional(),
    variants: z.array(variantSchema).min(1, "At least one variant is required"),
    isActive: z.boolean().optional().default(true),

    // SEO
    metaTitle: z.string().max(70).optional(),
    metaDescription: z.string().max(160).optional(),
    keywords: z.array(z.string()).optional(),

    keyBenefits: z.array(z.object({
        title: z.string(),
        icon: z.string()
    })).optional(),

    keyIngredients: z.array(z.object({
        name: z.string(),
        image: z.string().url().optional(),
        description: z.string().optional()
    })).optional(),

    expertBadges: z.array(z.string()).optional()
});

const validateDefaultVariant = (data) => {
    if (!data.variants) return true; // For partial updates where variants might not be present
    const defaultVariants = data.variants.filter(v => v.isDefault);
    return defaultVariants.length === 1;
};

export const productCreateSchema = productBaseSchema.refine(validateDefaultVariant, {
    message: "Exactly one variant must be marked as default",
    path: ["variants"]
});

export const productUpdateSchema = productBaseSchema.partial().refine(validateDefaultVariant, {
    message: "Exactly one variant must be marked as default (if variants are provided)",
    path: ["variants"]
});
