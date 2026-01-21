import { NextResponse } from "next/server";
import { listSites } from "@/lib/data/sites";

export const dynamic = "force-dynamic";

export async function GET(_req: Request) {
  try {
    const sites = await listSites();
    return NextResponse.json({ sites });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Failed" },
      { status: 500 }
    );
  }
}