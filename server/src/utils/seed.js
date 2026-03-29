require("dotenv").config();
const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

const categories = [
  {
    name: "Headphones",
    slug: "headphones",
    description: "Premium audio headphones",
  },
  {
    name: "Speakers",
    slug: "speakers",
    description: "Wireless and wired speakers",
  },
  { name: "Earbuds", slug: "earbuds", description: "In-ear audio devices" },
  {
    name: "Accessories",
    slug: "accessories",
    description: "Audio accessories and cables",
  },
];

const products = [
  {
    name: "Auralith Pro X1",
    description:
      "Premium over-ear headphones with active noise cancellation, 40-hour battery life, and studio-quality sound. Perfect for audiophiles and professionals.",
    price: 299.99,
    comparePrice: 349.99,
    stock: 50,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
    ],
    categorySlug: "headphones",
    isFeatured: true,
  },
  {
    name: "Auralith Studio S3",
    description:
      "Open-back studio headphones designed for mixing and mastering. Natural soundstage with exceptional clarity across all frequencies.",
    price: 199.99,
    comparePrice: null,
    stock: 30,
    images: ["https://images.unsplash.com/photo-1545127398-14699f92334b?w=800"],
    categorySlug: "headphones",
    isFeatured: true,
  },
  {
    name: "Auralith Beam B1",
    description:
      "Compact wireless speaker with 360-degree sound, IPX7 waterproof rating, and 24-hour playtime. Your perfect outdoor companion.",
    price: 129.99,
    comparePrice: 159.99,
    stock: 75,
    images: [
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800",
    ],
    categorySlug: "speakers",
    isFeatured: true,
  },
  {
    name: "Auralith Tower T2",
    description:
      "Floor-standing tower speaker with dual woofers and a silk dome tweeter. Fills any room with rich, detailed sound.",
    price: 499.99,
    comparePrice: null,
    stock: 15,
    images: ["https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800"],
    categorySlug: "speakers",
    isFeatured: false,
  },
  {
    name: "Auralith Air A2",
    description:
      "True wireless earbuds with hybrid ANC, 8-hour battery plus 24 from the case, and a custom-tuned 11mm driver for deep bass.",
    price: 149.99,
    comparePrice: 179.99,
    stock: 100,
    images: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800",
    ],
    categorySlug: "earbuds",
    isFeatured: true,
  },
  {
    name: "Auralith Fit F1",
    description:
      "Sport earbuds with secure ear hooks, IPX5 sweat resistance, and 6-hour battery. Built for your most intense workouts.",
    price: 89.99,
    comparePrice: null,
    stock: 60,
    images: [
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800",
    ],
    categorySlug: "earbuds",
    isFeatured: false,
  },
  {
    name: "Auralith Cable C1",
    description:
      "Premium braided 3.5mm to 3.5mm audio cable, 1.5m length. Gold-plated connectors for pristine signal transfer.",
    price: 24.99,
    comparePrice: null,
    stock: 200,
    images: [
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800",
    ],
    categorySlug: "accessories",
    isFeatured: false,
  },
  {
    name: "Auralith Stand ST1",
    description:
      "Aluminium desktop headphone stand with cable management and non-slip base. Keeps your setup clean and organised.",
    price: 49.99,
    comparePrice: 59.99,
    stock: 80,
    images: [
      "https://images.unsplash.com/photo-1612198790700-0c7b89059c6d?w=800",
    ],
    categorySlug: "accessories",
    isFeatured: false,
  },
];

async function seed() {
  console.log("Seeding database...");

  for (const cat of categories) {
    await sql`
      INSERT INTO "Category" (id, name, slug, description, "createdAt")
      VALUES (gen_random_uuid(), ${cat.name}, ${cat.slug}, ${cat.description}, NOW())
      ON CONFLICT (slug) DO NOTHING
    `;
    console.log(`Category: ${cat.name}`);
  }

  for (const product of products) {
    const category = await sql`
      SELECT id FROM "Category" WHERE slug = ${product.categorySlug}
    `;

    if (category.length === 0) {
      console.log(`Category not found for ${product.name}`);
      continue;
    }

    const slug = product.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    await sql`
      INSERT INTO "Product" (id, name, slug, description, price, "comparePrice", stock, images, "categoryId", "isFeatured", "isActive", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${product.name}, ${slug}, ${product.description}, ${product.price}, ${product.comparePrice}, ${product.stock}, ${product.images}, ${category[0].id}, ${product.isFeatured}, true, NOW(), NOW())
      ON CONFLICT (slug) DO NOTHING
    `;
    console.log(`Product: ${product.name}`);
  }

  console.log("Seeding complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed error:", err.message);
  process.exit(1);
});
