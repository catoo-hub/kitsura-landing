import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const serviceId = url.searchParams.get("serviceId");

  if (!serviceId) {
    return new Response(JSON.stringify({ error: "Missing serviceId" }), {
      status: 400,
    });
  }

  const WATA_DIGITAL_GOODS_TOKEN = import.meta.env.WATA_DIGITAL_GOODS_TOKEN;

  if (!WATA_DIGITAL_GOODS_TOKEN) {
    return new Response(
      JSON.stringify({ error: "WATA_DIGITAL_GOODS_TOKEN is not set" }),
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://dg-api.wata.pro/api/v2/vouchers?serviceId=${serviceId}`,
      {
        headers: {
          Authorization: `Bearer ${WATA_DIGITAL_GOODS_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Wata API Error (Vouchers List):", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to fetch vouchers" }),
        { status: response.status }
      );
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error: any) {
    console.error("Server Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal Server Error" }),
      { status: 500 }
    );
  }
};
