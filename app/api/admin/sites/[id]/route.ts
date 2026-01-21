import { NextRequest, NextResponse } from "next/server";
import { getSiteById, updateSite } from "@/lib/data/sites";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const site = await getSiteById(id);
    if (!site) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ site });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Failed" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const site = await updateSite(id, body);
    return NextResponse.json({ site });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Failed" }, { status: 500 });
  }
}