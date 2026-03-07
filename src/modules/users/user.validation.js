import { z } from "zod";

export const addressSchema = z.object({
    name: z.string().min(1, "Name is required"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    addressLine1: z.string().min(1, "Address Line 1 is required"),
    addressLine2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    pincode: z.string().min(6, "Pincode is required"),
    addressType: z.enum(["HOME", "WORK", "HOTEL", "OTHER"]).default("HOME"),
    coordinates: z.object({
        lat: z.number(),
        lng: z.number()
    }).optional(),
    isDefault: z.boolean().default(false)
});

export const updateAddressSchema = addressSchema.partial();
