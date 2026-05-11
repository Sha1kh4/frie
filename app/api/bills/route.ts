import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("Bills")
    .select(`
      *,
      Bill_Items (
        *,
        Firecrackers (*)
      )
    `)
    .order("id", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();

  const supabase = await createClient();

  const { customer_name } = body;

  const { data, error } = await supabase
    .from("Bills")
    .insert({
      customer_name,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}