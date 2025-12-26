import type { APIRoute } from "astro";
import { incrementSteamTopups } from "@/lib/stats";

export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({
      message: "Steam Topup API is running. Use POST to create an order.",
    }),
    { status: 200 }
  );
};

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const { accountName, amount } = body;

  if (!accountName || !amount) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
    });
  }

  const WATA_API_TOKEN = import.meta.env.WATA_API_TOKEN;
  console.log(
    "Processing Steam topup request. Token exists:",
    !!WATA_API_TOKEN
  );

  if (!WATA_API_TOKEN) {
    console.warn("WATA_API_TOKEN is not set. Returning mock response.");
    // Mock delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Increment stats even in mock mode for testing
    await incrementSteamTopups();

    return new Response(
      JSON.stringify({
        paymentLink: "https://example.com/mock-payment",
        mock: true,
        message: "API Token not configured. This is a mock response.",
      }),
      { status: 200 }
    );
  }

  try {
    // 1. Calculate price
    // We assume 'amount' from user is what they want to receive on Steam (netAmount).
    const amountResponse = await fetch(
      `https://dg-api.wata.pro/api/v2/steam/amount?NetAmount=${amount}&Account=${accountName}`,
      {
        headers: {
          Authorization: `Bearer ${WATA_API_TOKEN}`,
        },
      }
    );

    if (!amountResponse.ok) {
      const errorText = await amountResponse.text();
      console.error("Wata API Error (Amount):", errorText);
      return new Response(
        JSON.stringify({
          error: "Failed to calculate price. Check account name.",
        }),
        { status: 400 }
      );
    }

    const priceData = await amountResponse.json();
    console.log("Price data received:", priceData);
    // priceData.minPrice is the minimum we must charge.
    const sellingPrice = priceData.minPrice;

    const origin = new URL(request.url).origin;

    // 2. Create order
    const orderId = crypto.randomUUID();
    const createResponse = await fetch("https://dg-api.wata.pro/api/v2/steam", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WATA_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        account: accountName,
        amount: sellingPrice,
        netAmount: Number(amount),
        description: `Пополнение счета Steam для ${accountName}`,
        orderId: orderId,
        successRedirectUrl: `${origin}/success`,
        failRedirectUrl: `${origin}/fail`,
      }),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error("Wata API Error (Create):", errorText);
      return new Response(JSON.stringify({ error: "Failed to create order" }), {
        status: 500,
      });
    }

    const orderData = await createResponse.json();
    console.log("Order created successfully:", orderData);

    // Increment stats on successful order creation
    await incrementSteamTopups();

    return new Response(JSON.stringify(orderData), {
      status: 200,
    });
  } catch (error: any) {
    console.error("Server Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal Server Error" }),
      {
        status: 500,
      }
    );
  }
};
