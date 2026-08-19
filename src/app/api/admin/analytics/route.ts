import { NextResponse } from "next/server";
import { getAggregatedAnalytics } from "@/lib/analytics/serverStore";
import { createClient } from "@/lib/supabase/client";
import { verifyAdmin } from "@/lib/auth/adminGuard";

export async function GET(request: Request) {
  try {
    // Admin Guard Check
    const authCheck = await verifyAdmin(request);
    if (!authCheck.isAdmin && authCheck.response) {
      return authCheck.response;
    }

    const { searchParams } = new URL(request.url);
    const timeframe = (searchParams.get("timeframe") as "today" | "7d" | "30d" | "all") || "7d";

    const supabase = createClient();

    // Fetch Orders from DB
    let orders: any[] = [];
    try {
      const { data: dbOrders } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });
      if (dbOrders) orders = dbOrders;
    } catch {}

    // Fetch Products from DB
    let products: any[] = [];
    try {
      const { data: dbProducts } = await supabase.from("products").select("*");
      if (dbProducts) products = dbProducts;
    } catch {}

    const report = await getAggregatedAnalytics(timeframe, orders, products);

    return NextResponse.json(report);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
