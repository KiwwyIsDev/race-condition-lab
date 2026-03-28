import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

interface Order {
  id: number;
  buyer: string;
  created_at: string;
}

const getAllOrders = db.prepare(
  "SELECT id, buyer, created_at FROM orders ORDER BY id ASC"
);

export async function GET() {
  try {
    return NextResponse.json(getAllOrders.all() as Order[]);
  } catch (err) {
    console.error("[GET /api/orders]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
