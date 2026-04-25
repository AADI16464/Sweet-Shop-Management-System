import { Request, Response } from "express"
import { prisma } from "../prisma"

/**
 * Create a new sweet (Admin only)
 */
export async function createSweet(req: Request, res: Response) {
  const { name, description, category, price, quantity } = req.body
  let imageUrl = req.body.imageUrl

  // If a file was uploaded, use its path
  if (req.file) {
    imageUrl = `/uploads/${req.file.filename}`
  }

  if (!name || price == null || quantity == null) {
    return res.status(400).json({ error: "name, price, quantity required" })
  }

  try {
    const sweet = await prisma.sweet.create({
      data: {
        name,
        description,
        category,
        price: Number(price),
        quantity: Number(quantity),
        imageUrl: imageUrl?.trim() || null,
        inStock: Number(quantity) > 0,
      },
    })

    res.status(201).json(sweet)
  } catch (error) {
    console.error("Create sweet error:", error)
    res.status(500).json({ error: "Failed to create sweet" })
  }
}

/**
 * List all sweets
 */
export async function listSweets(req: Request, res: Response) {
  try {
    const sweets = await prisma.sweet.findMany({
      orderBy: { createdAt: "desc" },
    })
    res.json(sweets)
  } catch (error) {
    console.error("List sweets error:", error)
    res.status(500).json({ error: "Failed to fetch sweets" })
  }
}

/**
 * Search sweets
 */
export async function searchSweets(req: Request, res: Response) {
  const { q, category, minPrice, maxPrice } = req.query

  try {
    const sweets = await prisma.sweet.findMany({
      where: {
        AND: [
          category ? { category: String(category) } : {},
          minPrice || maxPrice
            ? {
                price: {
                  ...(minPrice && { gte: Number(minPrice) }),
                  ...(maxPrice && { lte: Number(maxPrice) }),
                },
              }
            : {},
          q
            ? {
                OR: [
                  { name: { contains: String(q), mode: "insensitive" } },
                  { description: { contains: String(q), mode: "insensitive" } },
                ],
              }
            : {},
        ],
      },
    })

    res.json(sweets)
  } catch (error) {
    console.error("Search sweets error:", error)
    res.status(500).json({ error: "Search failed" })
  }
}

/**
 * Update sweet
 */
export async function updateSweet(req: Request, res: Response) {
  const { id } = req.params
  const { name, description, category, price, quantity } = req.body
  let imageUrl = req.body.imageUrl

  // If a file was uploaded, use its path
  if (req.file) {
    imageUrl = `/uploads/${req.file.filename}`
  }

  try {
    const sweet = await prisma.sweet.update({
      where: { id },
      data: {
        name,
        description,
        category,
        price: price != null ? Number(price) : undefined,
        quantity: quantity != null ? Number(quantity) : undefined,
        imageUrl: imageUrl !== undefined ? (imageUrl?.trim() || null) : undefined,
        inStock: quantity != null ? Number(quantity) > 0 : undefined,
      },
    })

    res.json(sweet)
  } catch (error) {
    res.status(404).json({ error: "Sweet not found" })
  }
}

/**
 * Delete sweet
 */
export async function deleteSweet(req: Request, res: Response) {
  const { id } = req.params

  try {
    await prisma.sweet.delete({ where: { id } })
    res.status(204).send()
  } catch {
    res.status(404).json({ error: "Sweet not found" })
  }
}

/**
 * Purchase sweet
 */
export async function purchaseSweet(req: Request, res: Response) {
  const { id } = req.params
  const qty = Number(req.body.amount ?? 1)

  if (qty <= 0) {
    return res.status(400).json({ error: "Invalid purchase amount" })
  }

  try {
    const sweet = await prisma.sweet.findUnique({ where: { id } })
    if (!sweet) return res.status(404).json({ error: "Sweet not found" })
    if (sweet.quantity < qty) return res.status(400).json({ error: "Not enough stock" })

    const updated = await prisma.sweet.update({
      where: { id },
      data: {
        quantity: { decrement: qty },
        inStock: sweet.quantity - qty > 0,
      },
    })

    res.json(updated)
  } catch (error) {
    res.status(500).json({ error: "Error processing purchase" })
  }
}

/**
 * Restock sweet
 */
export async function restockSweet(req: Request, res: Response) {
  const { id } = req.params
  const qty = Number(req.body.amount ?? 1)

  if (qty <= 0) {
    return res.status(400).json({ error: "Invalid restock amount" })
  }

  try {
    const sweet = await prisma.sweet.findUnique({ where: { id } })
    if (!sweet) return res.status(404).json({ error: "Sweet not found" })

    const updated = await prisma.sweet.update({
      where: { id },
      data: {
        quantity: { increment: qty },
        inStock: true,
      },
    })

    res.json(updated)
  } catch {
    res.status(500).json({ error: "Error processing restock" })
  }
}
