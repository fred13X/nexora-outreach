export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/health") {
      return new Response(
        JSON.stringify({
          ok: true,
          service: "Nexora Outreach"
        }),
        {
          headers: { "content-type": "application/json" }
        }
      );
    }

    return new Response("Nexora Outreach is online!", {
      headers: {
        "content-type": "text/plain"
      }
    });
  }
};
