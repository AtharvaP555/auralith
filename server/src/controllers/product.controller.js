const sql = require("../utils/prisma");
const { sendSuccess, sendError } = require("../utils/response");

const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      minPrice,
      maxPrice,
      sort = "createdAt",
      order = "desc",
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const validSortFields = {
      price: "p.price",
      createdAt: 'p."createdAt"',
      name: "p.name",
    };
    const sortField = validSortFields[sort] || 'p."createdAt"';
    const sortOrder = order === "asc" ? "ASC" : "DESC";

    let products, total;

    if (!category && !search && !minPrice && !maxPrice) {
      products = await sql`
        SELECT p.id, p.name, p.slug, p.description, p.price, p."comparePrice",
               p.stock, p.images, p."isFeatured", p."createdAt",
               c.name as "categoryName", c.slug as "categorySlug",
               COALESCE(AVG(r.rating), 0) as "avgRating",
               COUNT(DISTINCT r.id) as "reviewCount"
        FROM "Product" p
        LEFT JOIN "Category" c ON p."categoryId" = c.id
        LEFT JOIN "Review" r ON p.id = r."productId"
        WHERE p."isActive" = true
        GROUP BY p.id, c.name, c.slug
        ORDER BY p."createdAt" DESC
        LIMIT ${limitNum} OFFSET ${offset}
      `;

      const countResult = await sql`
        SELECT COUNT(*) as total FROM "Product" WHERE "isActive" = true
      `;
      total = parseInt(countResult[0].total);
    } else if (search && !category && !minPrice && !maxPrice) {
      const searchTerm = `%${search}%`;
      products = await sql`
        SELECT p.id, p.name, p.slug, p.description, p.price, p."comparePrice",
               p.stock, p.images, p."isFeatured", p."createdAt",
               c.name as "categoryName", c.slug as "categorySlug",
               COALESCE(AVG(r.rating), 0) as "avgRating",
               COUNT(DISTINCT r.id) as "reviewCount"
        FROM "Product" p
        LEFT JOIN "Category" c ON p."categoryId" = c.id
        LEFT JOIN "Review" r ON p.id = r."productId"
        WHERE p."isActive" = true
          AND (p.name ILIKE ${searchTerm} OR p.description ILIKE ${searchTerm})
        GROUP BY p.id, c.name, c.slug
        ORDER BY p."createdAt" DESC
        LIMIT ${limitNum} OFFSET ${offset}
      `;
      const countResult = await sql`
        SELECT COUNT(*) as total FROM "Product"
        WHERE "isActive" = true
          AND (name ILIKE ${searchTerm} OR description ILIKE ${searchTerm})
      `;
      total = parseInt(countResult[0].total);
    } else if (category && !search && !minPrice && !maxPrice) {
      products = await sql`
        SELECT p.id, p.name, p.slug, p.description, p.price, p."comparePrice",
               p.stock, p.images, p."isFeatured", p."createdAt",
               c.name as "categoryName", c.slug as "categorySlug",
               COALESCE(AVG(r.rating), 0) as "avgRating",
               COUNT(DISTINCT r.id) as "reviewCount"
        FROM "Product" p
        LEFT JOIN "Category" c ON p."categoryId" = c.id
        LEFT JOIN "Review" r ON p.id = r."productId"
        WHERE p."isActive" = true AND c.slug = ${category}
        GROUP BY p.id, c.name, c.slug
        ORDER BY p."createdAt" DESC
        LIMIT ${limitNum} OFFSET ${offset}
      `;
      const countResult = await sql`
        SELECT COUNT(p.id) as total FROM "Product" p
        LEFT JOIN "Category" c ON p."categoryId" = c.id
        WHERE p."isActive" = true AND c.slug = ${category}
      `;
      total = parseInt(countResult[0].total);
    } else {
      products = await sql`
        SELECT p.id, p.name, p.slug, p.description, p.price, p."comparePrice",
               p.stock, p.images, p."isFeatured", p."createdAt",
               c.name as "categoryName", c.slug as "categorySlug",
               COALESCE(AVG(r.rating), 0) as "avgRating",
               COUNT(DISTINCT r.id) as "reviewCount"
        FROM "Product" p
        LEFT JOIN "Category" c ON p."categoryId" = c.id
        LEFT JOIN "Review" r ON p.id = r."productId"
        WHERE p."isActive" = true
        GROUP BY p.id, c.name, c.slug
        ORDER BY p."createdAt" DESC
        LIMIT ${limitNum} OFFSET ${offset}
      `;
      const countResult = await sql`
        SELECT COUNT(*) as total FROM "Product" WHERE "isActive" = true
      `;
      total = parseInt(countResult[0].total);
    }

    return sendSuccess(res, {
      products,
      pagination: {
        total,
        page: parseInt(page),
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error("GET PRODUCTS ERROR:", err.message);
    return sendError(res, "Failed to fetch products");
  }
};

const getProduct = async (req, res) => {
  try {
    const { slug } = req.params;

    const result = await sql`
      SELECT p.*, c.name as "categoryName", c.slug as "categorySlug",
             COALESCE(AVG(r.rating), 0) as "avgRating",
             COUNT(DISTINCT r.id) as "reviewCount"
      FROM "Product" p
      LEFT JOIN "Category" c ON p."categoryId" = c.id
      LEFT JOIN "Review" r ON p.id = r."productId"
      WHERE p.slug = ${slug} AND p."isActive" = true
      GROUP BY p.id, c.name, c.slug
    `;

    if (result.length === 0) {
      return sendError(res, "Product not found", 404);
    }

    return sendSuccess(res, { product: result[0] });
  } catch (err) {
    console.error("GET PRODUCT ERROR:", err.message);
    return sendError(res, "Failed to fetch product");
  }
};

const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      comparePrice,
      stock,
      images,
      categoryId,
      isFeatured,
    } = req.body;

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const existing = await sql`SELECT id FROM "Product" WHERE slug = ${slug}`;
    if (existing.length > 0) {
      return sendError(res, "Product with this name already exists", 409);
    }

    const result = await sql`
      INSERT INTO "Product" (id, name, slug, description, price, "comparePrice", stock, images, "categoryId", "isFeatured", "isActive", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${name}, ${slug}, ${description}, ${price}, ${comparePrice || null}, ${stock || 0}, ${images || []}, ${categoryId}, ${isFeatured || false}, true, NOW(), NOW())
      RETURNING *
    `;

    return sendSuccess(res, { product: result[0] }, "Product created", 201);
  } catch (err) {
    console.error("CREATE PRODUCT ERROR:", err.message);
    return sendError(res, "Failed to create product");
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      comparePrice,
      stock,
      images,
      categoryId,
      isFeatured,
      isActive,
    } = req.body;

    const result = await sql`
      UPDATE "Product"
      SET name = COALESCE(${name}, name),
          description = COALESCE(${description}, description),
          price = COALESCE(${price}, price),
          "comparePrice" = ${comparePrice},
          stock = COALESCE(${stock}, stock),
          images = COALESCE(${images}, images),
          "categoryId" = COALESCE(${categoryId}, "categoryId"),
          "isFeatured" = COALESCE(${isFeatured}, "isFeatured"),
          "isActive" = COALESCE(${isActive}, "isActive"),
          "updatedAt" = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return sendError(res, "Product not found", 404);
    }

    return sendSuccess(res, { product: result[0] }, "Product updated");
  } catch (err) {
    console.error("UPDATE PRODUCT ERROR:", err.message);
    return sendError(res, "Failed to update product");
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await sql`UPDATE "Product" SET "isActive" = false WHERE id = ${id}`;
    return sendSuccess(res, {}, "Product deleted");
  } catch (err) {
    console.error("DELETE PRODUCT ERROR:", err.message);
    return sendError(res, "Failed to delete product");
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await sql`
      SELECT c.*, COUNT(p.id) as "productCount"
      FROM "Category" c
      LEFT JOIN "Product" p ON c.id = p."categoryId" AND p."isActive" = true
      GROUP BY c.id
      ORDER BY c.name ASC
    `;

    return sendSuccess(res, { categories });
  } catch (err) {
    console.error("GET CATEGORIES ERROR:", err.message);
    return sendError(res, "Failed to fetch categories");
  }
};

const getRelatedProducts = async (req, res) => {
  try {
    const { slug } = req.params;

    const product = await sql`
      SELECT id, "categoryId" FROM "Product"
      WHERE slug = ${slug} AND "isActive" = true
    `;

    if (product.length === 0) {
      return sendError(res, "Product not found", 404);
    }

    const related = await sql`
      SELECT p.id, p.name, p.slug, p.price, p."comparePrice",
             p.images, p.stock,
             c.name as "categoryName",
             COALESCE(AVG(r.rating), 0) as "avgRating",
             COUNT(DISTINCT r.id) as "reviewCount"
      FROM "Product" p
      LEFT JOIN "Category" c ON p."categoryId" = c.id
      LEFT JOIN "Review" r ON p.id = r."productId"
      WHERE p."categoryId" = ${product[0].categoryId}
        AND p.id != ${product[0].id}
        AND p."isActive" = true
      GROUP BY p.id, c.name
      ORDER BY RANDOM()
      LIMIT 4
    `;

    return sendSuccess(res, { products: related });
  } catch (err) {
    console.error("GET RELATED PRODUCTS ERROR:", err.message);
    return sendError(res, "Failed to fetch related products");
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getRelatedProducts,
};
