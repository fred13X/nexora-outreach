export default {
  async fetch(request, env) {
    const key = env.OPENPLACES_API_KEY;

    return new Response(JSON.stringify({
      secret_exists: Boolean(key),
      secret_length: key ? key.length : 0,
      starts_correctly: key ? key.startsWith("opa_live_") : false
    }), {
      headers: {
        "content-type": "application/json"
      }
    });
  }
};
