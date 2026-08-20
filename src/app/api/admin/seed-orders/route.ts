import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

export async function POST(request: Request) {
  try {
    const supabase = createClient();

    // 1. Fetch available products from Supabase to attach to mock orders
    const { data: existingProducts } = await supabase
      .from("products")
      .select("id, name, price, images")
      .limit(6);

    const prods = existingProducts && existingProducts.length > 0 ? existingProducts : [
      {
        id: null,
        name: "AURA SoundMaster Pro Wireless Headphones",
        price: 3499,
        images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600"],
      },
      {
        id: null,
        name: "AURA Mechanical RGB Gaming Keyboard",
        price: 1899,
        images: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600"],
      },
      {
        id: null,
        name: "AURA UltraSync Smart Watch Series X",
        price: 4200,
        images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"],
      },
    ];

    // Mock Delivery Orders Data Set with Egyptian Governorates and realistic delivery details
    const MOCK_DELIVERY_ORDERS = [
      {
        status: "delivered",
        total_amount: prods[0]?.price ? prods[0].price + 50 : 3549,
        points_earned: 350,
        points_redeemed: 0,
        discount_amount: 0,
        tracking_number: "AUR-EG-998412",
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        shipping_address: {
          fullName: "Mahmoud Hassan",
          phone: "01098765432",
          email: "mahmoud.hassan@gmail.com",
          street: "90th Street, Fifth Settlement",
          buildingNo: "Bldg 14, Apt 3",
          city: "New Cairo",
          state: "Cairo",
          zipCode: "11835",
          country: "Egypt",
          deliveryInstructions: "Please call upon arrival at building entrance gate.",
        },
        items: [
          {
            product_id: prods[0]?.id || null,
            product_name: prods[0]?.name || "AURA SoundMaster Pro Headphones",
            product_image: prods[0]?.images?.[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
            price: Number(prods[0]?.price || 3499),
            quantity: 1,
          },
        ],
      },
      {
        status: "shipped",
        total_amount: (prods[1]?.price || 1899) + 75,
        points_earned: 190,
        points_redeemed: 0,
        discount_amount: 100,
        tracking_number: "AUR-EG-883019",
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        shipping_address: {
          fullName: "Nour El-Din Ahmed",
          phone: "01234567890",
          email: "nour.ahmed@outlook.com",
          street: "Fouad Street, Downtown",
          buildingNo: "Flat 5, Floor 2",
          city: "Alexandria",
          state: "Alexandria",
          zipCode: "21500",
          country: "Egypt",
          deliveryInstructions: "Deliver between 2 PM and 6 PM.",
        },
        items: [
          {
            product_id: prods[1]?.id || null,
            product_name: prods[1]?.name || "AURA Mechanical Keyboard",
            product_image: prods[1]?.images?.[0] || "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600",
            price: Number(prods[1]?.price || 1899),
            quantity: 1,
          },
        ],
      },
      {
        status: "processing",
        total_amount: (prods[2]?.price || 4200) + 90,
        points_earned: 420,
        points_redeemed: 50,
        discount_amount: 50,
        tracking_number: "AUR-EG-774102",
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        shipping_address: {
          fullName: "Sara Ibrahim",
          phone: "01122334455",
          email: "sara.ibrahim@yahoo.com",
          street: "El-Ghaiesh St, Near Stadium",
          buildingNo: "Tower B, Apt 11",
          city: "Mansoura",
          state: "Dakahlia",
          zipCode: "35511",
          country: "Egypt",
          deliveryInstructions: "Leave package with front receptionist.",
        },
        items: [
          {
            product_id: prods[2]?.id || null,
            product_name: prods[2]?.name || "AURA UltraSync Smart Watch",
            product_image: prods[2]?.images?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
            price: Number(prods[2]?.price || 4200),
            quantity: 1,
          },
        ],
      },
      {
        status: "pending",
        total_amount: 2450,
        points_earned: 245,
        points_redeemed: 0,
        discount_amount: 0,
        tracking_number: "AUR-EG-661048",
        created_at: new Date().toISOString(),
        shipping_address: {
          fullName: "Karim Mostafa",
          phone: "01555667788",
          email: "karim.mostafa@gmail.com",
          street: "Kornish El-Nile",
          buildingNo: "Building 8",
          city: "Luxor",
          state: "Luxor",
          zipCode: "85511",
          country: "Egypt",
          deliveryInstructions: "Call 15 minutes before arrival.",
        },
        items: [
          {
            product_id: prods[0]?.id || null,
            product_name: prods[0]?.name || "AURA Audio Accessory",
            product_image: prods[0]?.images?.[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
            price: 2450,
            quantity: 1,
          },
        ],
      },
      {
        status: "shipped",
        total_amount: 1550,
        points_earned: 155,
        points_redeemed: 0,
        discount_amount: 0,
        tracking_number: "AUR-EG-552910",
        created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        shipping_address: {
          fullName: "Tarek Omar",
          phone: "01011223344",
          email: "tarek.omar@gmail.com",
          street: "Pyramids Road",
          buildingNo: "Apt 2, Bldg 45",
          city: "Giza",
          state: "Giza",
          zipCode: "12511",
          country: "Egypt",
          deliveryInstructions: "Cash payment ready at door.",
        },
        items: [
          {
            product_id: prods[1]?.id || null,
            product_name: prods[1]?.name || "AURA Gaming Peripheral",
            product_image: prods[1]?.images?.[0] || "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600",
            price: 1500,
            quantity: 1,
          },
        ],
      },
    ];

    const insertedOrders = [];

    for (const mockOrd of MOCK_DELIVERY_ORDERS) {
      const { items, ...orderData } = mockOrd;

      // Insert Order
      const { data: newOrd, error: ordErr } = await supabase
        .from("orders")
        .insert([orderData])
        .select()
        .single();

      if (ordErr) {
        console.error("Seed order insert error:", ordErr);
        continue;
      }

      if (newOrd && items.length > 0) {
        const orderItemsData = items.map(item => ({
          order_id: newOrd.id,
          ...item,
        }));

        await supabase.from("order_items").insert(orderItemsData);
      }

      insertedOrders.push(newOrd);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${insertedOrders.length} realistic delivery orders!`,
      orders: insertedOrders,
    });
  } catch (err: any) {
    console.error("Seed delivery orders exception:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
