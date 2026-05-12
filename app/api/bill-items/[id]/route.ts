    import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // get item
  const { data: item, error } = await supabase
    .from("bill_items")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  // restore stock
  const { data: cracker } = await supabase
    .from("firecrackers")
    .select("*")
    .eq("id", item.firecracker_id)
    .single();

  const currentStock = cracker?.[item.category] || 0;

  await supabase
    .from("firecrackers")
    .update({
      [item.category]:
        currentStock + item.quantity,
    })
    .eq("id", item.firecracker_id);

  // delete item
  await supabase
    .from("bill_items")
    .delete()
    .eq("id", id);

  return NextResponse.json({
    success: true,
  });
}