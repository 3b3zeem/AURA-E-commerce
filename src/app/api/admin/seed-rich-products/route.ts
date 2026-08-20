import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

// POST /api/admin/seed-rich-products
// Populates rich data into Supabase products table (brand, bought_past_month, highlights, bank_promos, protection_plans, specs)
export async function POST() {
  try {
    const supabase = createClient();

    // Fetch existing products from Supabase
    const { data: products, error } = await supabase.from("products").select("id, name, category_id, price");

    if (error || !products) {
      return NextResponse.json({ error: error?.message || "Failed to fetch products" }, { status: 500 });
    }

    const updatedCount = products.length;

    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      const isHeadphonesOrAudio = p.name.toLowerCase().includes("headphone") || p.name.toLowerCase().includes("sound") || p.name.toLowerCase().includes("audio");
      const isKeyboardOrMouse = p.name.toLowerCase().includes("keyboard") || p.name.toLowerCase().includes("mouse");
      const isWatch = p.name.toLowerCase().includes("watch");

      const brand = isHeadphonesOrAudio ? "Redragon" : isKeyboardOrMouse ? "Redragon" : isWatch ? "AURA Tech" : "AURA Premium";
      const boughtCount = 50 + (i * 25) % 800;

      const highlights = [
        `Brand: ${brand} Official Product with 2-Year Egyptian Warranty.`,
        "Engineered with superior ergonomic precision and ultra-durable materials.",
        "Plug-and-play instant compatibility with all operating systems.",
        "Includes full retail box with manual and official serial number.",
      ];

      const bankPromos = [
        { code: "NBEAUG500", title: "10% off NBE Visa Signature Credit Cards", discount: "Save up to 500 EGP" },
        { code: "NBEAUG250", title: "10% off NBE Visa Platinum Credit Cards", discount: "Save up to 250 EGP" },
        { code: "AAIB20", title: "20% off with AAIB cards at checkout", discount: "Save 20%" },
      ];

      const protectionPlans = [
        { id: "ext-1yr", name: "1-Year Extended Warranty by Boxi (Email delivery)", price: Math.round(p.price * 0.05) },
        { id: "ext-2yr", name: "2-Year Extended Warranty by Boxi (Email delivery)", price: Math.round(p.price * 0.08) },
        { id: "damage-1yr", name: "1-Year Accidental Damage Protection by Boxi", price: Math.round(p.price * 0.10) },
      ];

      const specs = {
        "Brand Name": brand,
        "Color": i % 2 === 0 ? "Black / RGB" : "White / RGB",
        "Connectivity Technology": isKeyboardOrMouse ? "USB Braided Cable" : "Bluetooth 5.3 + 2.4G Wireless",
        "Special Features": isKeyboardOrMouse ? "Mechanical Switches, RGB Backlit, Anti-Ghosting" : "Active Noise Cancellation, Deep Bass",
        "Movement Detection / Sensor": isKeyboardOrMouse ? "Optical 7200 DPI High-Precision Sensor" : "Advanced Audio Driver 50mm",
      };

      await supabase
        .from("products")
        .update({
          brand,
          bought_past_month: boughtCount,
          highlights,
          bank_promos: bankPromos,
          protection_plans: protectionPlans,
          specs,
        })
        .eq("id", p.id);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${updatedCount} products in Supabase with rich data!`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
