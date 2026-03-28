import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

interface Product {
  name: string;
  price: number;
  stock: number;
}

const getProduct = db.prepare(
  "SELECT name, price, stock FROM products WHERE id = 1"
);

export async function GET() {
  try {
    const product = getProduct.get() as Product | undefined;
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (err) {
    console.error("[GET /api/products]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
