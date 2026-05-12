import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const TABLE = "Billing";

type BillingBody = {
  client_name?: unknown;
  service?: unknown;
  amount?: unknown;
  status?: unknown;
};

function parseString(value: unknown, field: string): string | Response {
  if (typeof value !== "string" || !value.trim()) {
    return NextResponse.json({ error: `${field} is required` }, { status: 400 });
  }
  return value.trim();
}

function parseNonNegNum(value: unknown, field: string): number | Response {
  if (value === undefined || value === null || value === "") {
    return NextResponse.json({ error: `${field} is required` }, { status: 400 });
  }
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) {
    return NextResponse.json(
      { error: `${field} must be a non-negative number` },
      { status: 400 },
    );
  }
  return n;
}

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

export async function POST(req: Request) {
  const body = (await req.json()) as BillingBody;

  const client_name = parseString(body.client_name, "client_name");
  if (client_name instanceof Response) return client_name;

  const service = parseString(body.service, "service");
  if (service instanceof Response) return service;

  const amount = parseNonNegNum(body.amount, "amount");
  if (amount instanceof Response) return amount;

  const status = parseString(body.status, "status");
  if (status instanceof Response) return status;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from(TABLE)
    .insert({ client_name, service, amount, status })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PUT(req: Request) {
  const body = (await req.json()) as BillingBody & { id?: unknown };

  const id =
    typeof body.id === "number"
      ? body.id
      : typeof body.id === "string"
        ? Number(body.id)
        : NaN;

  if (!Number.isFinite(id) || !Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "valid id is required" }, { status: 400 });
  }

  const client_name = parseString(body.client_name, "client_name");
  if (client_name instanceof Response) return client_name;

  const service = parseString(body.service, "service");
  if (service instanceof Response) return service;

  const amount = parseNonNegNum(body.amount, "amount");
  if (amount instanceof Response) return amount;

  const status = parseString(body.status, "status");
  if (status instanceof Response) return status;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from(TABLE)
    .update({ client_name, service, amount, status })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("id");
  const id = raw === null ? NaN : Number(raw);

  if (!Number.isFinite(id) || !Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "valid id query param is required" }, { status: 400 });
  }

  const supabase = await createClient();

  const { error } = await supabase.from(TABLE).delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
