import { NextResponse } from "next/server";
import { getSiteById } from "@/lib/data/sites";

import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const {
    address,
    manager_name,
    status,
    client_name,
    contractor_name,
  } = body;

  const { data, error } = await supabaseAdmin
    .from('sites')
    .update({
      address,
      manager_name,
      status,
      client_name,
      contractor_name,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ site: data });
}