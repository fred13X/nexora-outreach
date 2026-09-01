export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/health") {
      return new Response(
        JSON.stringify({ ok: true, service: "Nexora Outreach" }),
        { headers: { "content-type": "application/json" } }
      );
    }

    if (url.pathname === "/api/leads") {
      const params = new URLSearchParams({
        category: url.searchParams.get("category") || "hotel",
        lat: "53.4808",
        lon: "-2.2426",
        radius_mi: "15",
        limit: url.searchParams.get("limit") || "10",
        min_confidence: "0.70"
      });

      const response = await fetch(
        `https://api.openplacesapi.com/v1/places?${params}`,
        {
          headers: {
            "Authorization": `Bearer ${env.OPENPLACES_API_KEY}`
          }
        }
      );

      const data = await response.json();

      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: { "content-type": "application/json" }
      });
    }

    return new Response("Nexora Outreach is online!");
  }
};
