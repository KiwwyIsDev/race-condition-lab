import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

const resetLab = db.transaction(() => {
  db.prepare("DELETE FROM orders").run();
  db.prepare("UPDATE products SET stock = 1 WHERE id = 1").run();
});

export async function POST() {
  try {
    resetLab();
    return NextResponse.json({
      success: true,
      message: "Lab reset: stock restored to 1, all orders deleted.",
    });
  } catch (err) {
    console.error("[POST /api/reset]", err);
    return NextResponse.json({ error: "Reset failed" }, { status: 500 });
  }
}
