export default {
  async fetch(request, env) {
    return new Response("Nexora Outreach is online!", {
      headers: {
        "content-type": "text/plain"
      }
    });
  }
};
