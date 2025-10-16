import type { APIRoute } from "astro";

// Simple mail sender using Resend (https://resend.com)
// Requires RESEND_API_KEY in environment
export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing fields" }),
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ ok: false, error: "Email service not configured" }),
        { status: 500 }
      );
    }

    const payload = {
      from: "Summit Lighting <no-reply@summit-lighting.dev>",
      to: ["jarrod.caufield@gmail.com"],
      subject: `New contact from ${name}`,
      reply_to: email,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    };

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      return new Response(
        JSON.stringify({ ok: false, error: errText || "Failed to send" }),
        { status: 500 }
      );
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ ok: false, error: err?.message || "Unexpected error" }),
      { status: 500 }
    );
  }
};
