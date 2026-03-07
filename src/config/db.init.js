import bcrypt from "bcryptjs";
import Order from "../modules/orders/order.model.js";
import Product from "../modules/products/product.model.js";
import User from "../modules/users/user.model.js";
import env from "./env.js";

// ─────────────────────────────────────────────────────────────
// Additional indexes not already declared on the schema files.
// Model.syncIndexes() will create these if missing and drop
// any obsolete indexes not defined here or on the schema.
// ─────────────────────────────────────────────────────────────
const EXTRA_INDEXES = [
    {
        model: User,
        label: "users",
        indexes: [
            // Speed up refresh-token cleanup: find tokens by expiry
            {
                spec: { "refreshTokens.expiresAt": 1 },
                opts: { name: "idx_user_refreshTokens_expiresAt" }
            },
            // Status filter for admin user listing
            {
                spec: { status: 1, createdAt: -1 },
                opts: { name: "idx_user_status_createdAt" }
            }
        ]
    },
    {
        model: Product,
        label: "products",
        indexes: [
            // Active product listing with sort (most used query pattern)
            {
                spec: { isActive: 1, createdAt: -1 },
                opts: { name: "idx_product_isActive_createdAt" }
            }
        ]
    },
    {
        model: Order,
        label: "orders",
        indexes: [
            // Per-user order history
            {
                spec: { user: 1, createdAt: -1 },
                opts: { name: "idx_order_user_createdAt" }
            },
            // Admin order dashboard: filter by status + sort by date
            {
                spec: { orderStatus: 1, createdAt: -1 },
                opts: { name: "idx_order_orderStatus_createdAt" }
            },
            // Revenue aggregation filter
            {
                spec: { paymentStatus: 1 },
                opts: { name: "idx_order_paymentStatus" }
            }
        ]
    }
];

// ─────────────────────────────────────────────────────────────
// Step 1: Ensure collections exist & sync all indexes
// ─────────────────────────────────────────────────────────────
async function syncIndexes() {
    console.log("🗄️  Syncing indexes on: users, products, orders ...");

    // Ensure any extra programmatic indexes are registered on the schemas
    // before calling syncIndexes (which reads schema.indexes())
    for (const { model, indexes } of EXTRA_INDEXES) {
        for (const { spec, opts } of indexes) {
            model.schema.index(spec, opts);
        }
    }

    // syncIndexes: creates missing, drops stale — safe to call on every boot
    await Promise.all(
        EXTRA_INDEXES.map(({ model }) => model.syncIndexes())
    );

    console.log("✅ Indexes synced");
}

// ─────────────────────────────────────────────────────────────
// Step 2: Seed default ADMIN user if none exists
// ─────────────────────────────────────────────────────────────
async function seedAdminUser() {
    // Never seed in test environment
    if (env.isTest) {
        console.log("⏭️  Admin seed skipped (test environment)");
        return;
    }

    if (!env.ADMIN_PHONE || !env.ADMIN_PASSWORD) {
        console.warn(
            "⚠️  ADMIN_PHONE / ADMIN_PASSWORD not set — skipping admin seed"
        );
        return;
    }

    const existing = await User.findOne({ role: "ADMIN" });
    if (existing) {
        console.log("✅ Admin user already exists — skipping seed");
        return;
    }

    const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 12);
    await User.create({
        phone: env.ADMIN_PHONE,
        passwordHash,
        name: "Super Admin",
        role: "ADMIN",
        status: "ACTIVE"
    });

    console.log(
        `👤 Default admin created (phone: ${env.ADMIN_PHONE}) — change the password immediately!`
    );
}

// ─────────────────────────────────────────────────────────────
// Step 3: Seed sample collections and products if database is empty
// ─────────────────────────────────────────────────────────────
import Collection from "../modules/collections/collection.model.js";
import { collectionsData, getProductsData } from "./seed-data.js";

async function seedSampleData() {
    // Only seed if collections are empty
    const collectionCount = await Collection.countDocuments();
    if (collectionCount > 0) return;

    console.log("🌱 Database is empty. Seeding sample collections and products...");

    // Seed Collections
    await Collection.insertMany(collectionsData);
    
    // Fetch newly created collections to get their auto-generated _ids
    const mango = await Collection.findOne({ slug: "mango-pickles" });
    const garlic = await Collection.findOne({ slug: "garlic-pickles" });
    const spice = await Collection.findOne({ slug: "spice-powders" });
    const atta = await Collection.findOne({ slug: "organic-atta" });
    const combo = await Collection.findOne({ slug: "combos" });

    if (mango && garlic && spice && atta && combo) {
        // Generate products data with the correct referenced collection IDs
        const productsList = getProductsData(mango._id, garlic._id, spice._id, atta._id, combo._id);
        
        const productCount = await Product.countDocuments();
        if (productCount === 0) {
            await Product.insertMany(productsList);
            console.log("✅ Sample products seeded successfully.");
        }
    }
}

// ─────────────────────────────────────────────────────────────
// Main entry point — called from server.js and migrate.js
// ─────────────────────────────────────────────────────────────
export async function initializeDatabase() {
    try {
        await syncIndexes();
        await seedAdminUser();
        await seedSampleData();
    } catch (err) {
        console.error("❌ Database initialization failed:", err.message);
        throw err; // Let the caller decide whether to exit
    }
}

export default initializeDatabase;
