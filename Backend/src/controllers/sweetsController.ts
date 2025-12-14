import { Request, Response } from "express";
import prisma from "../prisma";

export async function createSweet(req: Request, res: Response) {
  const { name, description, category, price, quantity, imageUrl } = req.body;
  if (!name || price == null || quantity == null) return res.status(400).json({ error: "name, price, quantity required" });

  const sweet = await prisma.sweet.create({
    data: {
      name,
      description,
      category,
      price: Number(price),
      quantity: Number(quantity),
      imageUrl,
      inStock: Number(quantity) > 0,
    },
  });

  res.status(201).json(sweet);
}

export async function listSweets(req: Request, res: Response) {
  const sweets = await prisma.sweet.findMany({ orderBy: { createdAt: "desc" } });
  res.json(sweets);
}

export async function searchSweets(req: Request, res: Response) {
  const { q, category, minPrice, maxPrice } = req.query;

  const filters: any = {};

  if (category) filters.category = String(category);
  if (minPrice || maxPrice) {
    filters.price = {};
    if (minPrice) filters.price.gte = Number(minPrice);
    if (maxPrice) filters.price.lte = Number(maxPrice);
  }

  const sweets = await prisma.sweet.findMany({
    where: {
      AND: [
        filters.category ? { category: filters.category } : {},
        filters.price ? { price: filters.price } : {},
        q ? {
          OR: [
            { name: { contains: String(q), mode: "insensitive" } },
            { description: { contains: String(q), mode: "insensitive" } },
          ],
        } : {},
      ],
    },
  });

  res.json(sweets);
}

export async function updateSweet(req: Request, res: Response) {
  const id = req.params.id;
  const { name, description, category, price, quantity, imageUrl } = req.body;

  try {
    const sweet = await prisma.sweet.update({
      where: { id },
      data: {
        name,
        description,
        category,
        price: price != null ? Number(price) : undefined,
        quantity: quantity != null ? Number(quantity) : undefined,
        imageUrl,
        inStock: quantity != null ? Number(quantity) > 0 : undefined,
      },
    });
    res.json(sweet);
  } catch (err) {
    res.status(404).json({ error: "Sweet not found" });
  }
}

export async function deleteSweet(req: Request, res: Response) {
  const id = req.params.id;
  try {
    await prisma.sweet.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    res.status(404).json({ error: "Sweet not found" });
  }
}

export async function purchaseSweet(req: Request, res: Response) {
  const id = req.params.id;
  const { amount } = req.body;
  const qty = amount != null ? Number(amount) : 1;
  if (qty <= 0) return res.status(400).json({ error: "Invalid purchase amount" });

  try {
    const sweet = await prisma.sweet.findUnique({ where: { id } });
    if (!sweet) return res.status(404).json({ error: "Sweet not found" });
    if (sweet.quantity < qty) return res.status(400).json({ error: "Not enough stock" });

    const updated = await prisma.sweet.update({
      where: { id },
      data: { quantity: { decrement: qty }, inStock: (sweet.quantity - qty) > 0 },
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Error processing purchase" });
  }
}

export async function restockSweet(req: Request, res: Response) {
  const id = req.params.id;
  const { amount } = req.body;
  const qty = amount != null ? Number(amount) : 1;
  if (qty <= 0) return res.status(400).json({ error: "Invalid restock amount" });

  try {
    const sweet = await prisma.sweet.findUnique({ where: { id } });
    if (!sweet) return res.status(404).json({ error: "Sweet not found" });

    const updated = await prisma.sweet.update({
      where: { id },
      data: { quantity: { increment: qty }, inStock: true },
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Error processing restock" });
  }
}