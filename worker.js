const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

const TAGS = {
  hotel: '["tourism"="hotel"]',
  "holiday cottage": '["tourism"="guest_house"]',
  cafe: '["amenity"="cafe"]',
  restaurant: '["amenity"="restaurant"]',
  gym: '["leisure"="fitness_centre"]',
  hairdresser: '["shop"="hairdresser"]',
  beauty: '["shop"="beauty"]',
  dentist: '["amenity"="dentist"]'
};

function response(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...CORS
    }
  });
}

async function findLeads(location, industry, limit) {
  const geo = await fetch(
    "https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" +
    encodeURIComponent(location),
    {
      headers: {
        "User-Agent": "Nexora-Outreach/1.0"
      }
    }
  );

  if (!geo.ok) throw new Error("Could not find that location.");

  const places = await geo.json();

  if (!places.length) {
    throw new Error("Location not found.");
  }

  const lat = Number(places[0].lat);
  const lon = Number(places[0].lon);
  const tag = TAGS[industry] || TAGS.hotel;

  const query = `
[out:json][timeout:20];
nwr${tag}(around:25000,${lat},${lon});
out center tags ${limit};
`;

  const result = await fetch(
    "https://overpass-api.de/api/interpreter",
    {
      method: "POST",
      headers: {
        "content-type": "text/plain"
      },
      body: query
    }
  );

  if (!result.ok) {
    throw new Error("Lead database temporarily unavailable.");
  }

  const data = await result.json();

  return (data.elements || [])
    .map((item) => {
      const t = item.tags || {};
      const centre = item.center || item;

      return {
        id: String(item.id),
        name: t.name || "",
        phone: t.phone || t["contact:phone"] || "",
        website: t.website || t["contact:website"] || "",
        address: [
          t["addr:housenumber"],
          t["addr:street"],
          t["addr:postcode"]
        ].filter(Boolean).join(", "),
        latitude: centre.lat,
        longitude: centre.lon
      };
    })
    .filter(lead => lead.name)
    .slice(0, limit);
}

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS });
    }

    const url = new URL(request.url);

    if (url.pathname === "/api/health") {
      return response({
        ok: true,
        service: "Nexora Outreach"
      });
    }

    if (url.pathname === "/api/leads") {
      try {
        const location =
          url.searchParams.get("location") || "Manchester, UK";

        const industry =
          (url.searchParams.get("category") || "hotel").toLowerCase();

        const limit = Math.min(
          Math.max(
            Number(url.searchParams.get("limit") || 10),
            1
          ),
          25
        );

        const leads = await findLeads(
          location,
          industry,
          limit
        );

        return response({
          ok: true,
          location,
          industry,
          count: leads.length,
          leads
        });

      } catch (error) {
        return response({
          ok: false,
          error: error.message
        }, 500);
      }
    }

    return response({
      ok: true,
      service: "Nexora Outreach",
      endpoints: [
        "/api/health",
        "/api/leads"
      ]
    });
  }
};
