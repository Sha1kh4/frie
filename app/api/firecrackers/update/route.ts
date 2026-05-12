import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET
export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("firecrackers")
    .select("*")
    .order("id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PUT(req: Request) {
  const supabase = await createClient();

  const body = await req.json();

  const { id, name, high, med, low, very_low, stock, reason } = body;

  const { data: oldData } = await supabase
    .from("firecrackers")
    .select("*")
    .eq("id", id)
    .single();

  if (!oldData) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("firecrackers")
    .update({
      name,
      high,
      med,
      low,
      very_low,
      stock,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from("stock_adjustments").insert({
    firecracker_id: id,
    old_stock: oldData.stock,
    new_stock: stock,
    change_amount: stock - oldData.stock,
    reason: reason || "Admin edit",
  });

  // 4. ALSO log into bills (as audit)
  await supabase.from("bills").insert({
    customer_name: "ADMIN",
    total_amount: 0,
    type: "ADJUSTMENT",
  });

  return NextResponse.json(data);
}

// DELETE
export async function DELETE(req: Request) {
  const supabase = await createClient();

  const { searchParams } = new URL(req.url);

  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  const { error } = await supabase.from("firecrackers").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
  });
}
