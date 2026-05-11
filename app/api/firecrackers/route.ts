import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("Firecrackers")
    .select("*")
    .order("id");
  console.log(data,error)
  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

export async function PUT(req: Request) {
  const body = await req.json();

  const supabase = await createClient();

  const { id, name, high, med, low, very_low } = body;

  const { data, error } = await supabase
    .from("Firecrackers")
    .update({
      name,
      high,
      med,
      low,
      very_low,
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

  return NextResponse.json(data);
}   