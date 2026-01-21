import { NextResponse } from "next/server";
import { getSiteById, updateSite } from "@/lib/data/sites";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const site = await getSiteById(params.id);
    if (!site) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ site });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message ?? "Failed" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const site = await updateSite(params.id, body);
    return NextResponse.json({ site });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message ?? "Failed" },
      { status: 500 }
    );
  }
}