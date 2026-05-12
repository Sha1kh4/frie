import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const supabase = await createClient();

    const {
      bill_id,
      firecracker_id,
      category,
      quantity,
      price,
    } = body;

    // get current stock
    const { data: cracker, error: crackerError } =
      await supabase
        .from("firecrackers")
        .select("*")
        .eq("id", firecracker_id)
        .single();

    if (crackerError) {
      return NextResponse.json(
        { error: crackerError.message },
        { status: 500 }
      );
    }

    const currentStock = cracker.stock;

    if (currentStock < quantity) {
      return NextResponse.json(
        { error: "Not enough stock" },
        { status: 400 }
      );
    }

    // insert bill item
    const { data, error } = await supabase
      .from("bill_items")
      .insert({
        bill_id,
        firecracker_id,
        category,
        quantity,
        price,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // reduce stock
    await supabase
      .from("firecrackers")
      .update({
        stock: currentStock - quantity,
      })
      .eq("id", firecracker_id);

    // update total
    const { data: items } = await supabase
      .from("bill_items")
      .select("total")
      .eq("bill_id", bill_id);

    const total_amount =
      items?.reduce(
        (sum, item) => sum + Number(item.total),
        0
      ) || 0;

    await supabase
      .from("bills")
      .update({
        total_amount,
      })
      .eq("id", bill_id);

    return NextResponse.json(data);
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}