import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const { voucherId, amount, count, email, description } = body;

  if (!voucherId || !amount || !count || !email) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
    });
  }

  const WATA_DIGITAL_GOODS_TOKEN = import.meta.env.WATA_DIGITAL_GOODS_TOKEN;

  if (!WATA_DIGITAL_GOODS_TOKEN) {
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
    const origin = new URL(request.url).origin;
    const orderId = crypto.randomUUID();

    const createResponse = await fetch(
      "https://dg-api.wata.pro/api/v2/vouchers",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WATA_DIGITAL_GOODS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          voucherId,
          amount,
          count,
          orderId,
          email,
          description: description || `Voucher purchase ${voucherId}`,
          successRedirectUrl: `${origin}/success`,
          failRedirectUrl: `${origin}/fail`,
        }),
      }
    );

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error("Wata API Error (Create Voucher Order):", errorText);
      return new Response(JSON.stringify({ error: "Failed to create order" }), {
        status: 500,
      });
    }

    const orderData = await createResponse.json();

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
