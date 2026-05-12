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
    .from("Bill_Items")
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
    .from("Firecrackers")
    .select("*")
    .eq("id", item.firecracker_id)
    .single();

  const currentStock = cracker?.[item.category] || 0;

  await supabase
    .from("Firecrackers")
    .update({
      [item.category]:
        currentStock + item.quantity,
    })
    .eq("id", item.firecracker_id);

  // delete item
  await supabase
    .from("Bill_Items")
    .delete()
    .eq("id", id);

  return NextResponse.json({
    success: true,
  });
}