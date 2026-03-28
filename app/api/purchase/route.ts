import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

interface Product {
  id: number;
  stock: number;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const getProduct     = db.prepare("SELECT id, stock FROM products WHERE id = 1");
const decrementStock = db.prepare("UPDATE products SET stock = stock - 1 WHERE id = 1");
const insertOrder    = db.prepare("INSERT INTO orders (product_id, buyer) VALUES (1, ?)");

export async function POST(request: NextRequest) {
  let buyer: string;

  try {
    const body = await request.json();
    buyer =
      typeof body.buyer === "string" && body.buyer.trim()
        ? body.buyer.trim()
        : "anonymous";
  } catch {
    buyer = "anonymous";
  }

  let product: Product | undefined;
  try {
    product = getProduct.get() as Product | undefined;
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  if (product.stock <= 0) {
    return NextResponse.json(
      { success: false, message: "Out of stock" },
      { status: 409 }
    );
  }

  // Simulate slow processing (payment gateway, email, etc.)
  // Every concurrent request sits here before any of them decrements stock.
  await sleep(100);

  // VULNERABILITY: no transaction wraps the check above and the update below.
  // All requests that passed the stock check will decrement, causing overselling.
  try {
    decrementStock.run();
    const result = insertOrder.run(buyer);

    // FIX: replace the two lines above with a single atomic update and check the result.
    // const info = db.prepare("UPDATE products SET stock = stock - 1 WHERE id = 1 AND stock > 0").run();
    // if (info.changes === 0) return NextResponse.json({ success: false, message: "Out of stock" }, { status: 409 });
    // const result = insertOrder.run(buyer);

    return NextResponse.json({
      success: true,
      message: `Purchase successful! Order #${result.lastInsertRowid} placed for ${buyer}.`,
      orderId: result.lastInsertRowid,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
