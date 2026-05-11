import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";


// GET ALL
export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("firecrackers")
    .select("*")
    .order("id");

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}


// CREATE NEW
export async function POST(req: Request) {
  const supabase = await createClient();

  const body = await req.json();

  const {
    name,
    high,
    med,
    low,
    very_low,
    stock,
  } = body;

  const { data, error } = await supabase
    .from("firecrackers")
    .insert({
      name,
      high,
      med,
      low,
      very_low,
      stock,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
  console.log(data);
  console.log("updated a row");
  console.log(body)
  return NextResponse.json(data);
}


// UPDATE
export async function PUT(req: Request) {
  const supabase = await createClient();

  const body = await req.json();

  const {
    id,
    name,
    high,
    med,
    low,
    very_low,
    stock,
    reason,
  } = body;

  // old row
  const { data: oldData } = await supabase
    .from("firecrackers")
    .select("*")
    .eq("id", id)
    .single();

  if (!oldData) {
    return NextResponse.json(
      { error: "Item not found" },
      { status: 404 }
    );
  }

  // update
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
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  // stock adjustment log
  await supabase
    .from("Stock_Adjustments")
    .insert({
      firecracker_id: id,
      old_stock: oldData.stock,
      new_stock: stock,
      change_amount: stock - oldData.stock,
      reason: reason || "Admin edit",
    });

  // 4. ALSO log into Bills (as audit)
  await supabase.from("Bills").insert({
    customer_name: "ADMIN",
    total_amount: 0,
    type: "ADJUSTMENT",
  });

  return NextResponse.json(data);
}