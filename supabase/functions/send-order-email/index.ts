import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const TO_EMAIL = Deno.env.get("TO_EMAIL")!; // store owner's email

serve(async (req) => {
  try {
    // Supabase Database Webhooks send a POST with the record payload
    const payload = await req.json();

    // payload.record is the newly inserted order row
    const order = payload.record;

    if (!order) {
      return new Response("No record in payload", { status: 400 });
    }

    // Parse items array (stored as JSON in Supabase)
    const items: Array<{
      name: string;
      size: string;
      quantity: number;
      price: number;
    }> = Array.isArray(order.items) ? order.items : JSON.parse(order.items || "[]");

    // Build items rows for the email table
    const itemsRows = items
      .map(
        (item) => `
        <tr>
          <td style="padding:10px 14px;border-bottom:1px solid #2a2a2a;">${item.name}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #2a2a2a;text-align:center;">${item.size}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #2a2a2a;text-align:center;">${item.quantity}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #2a2a2a;text-align:right;">${(item.price * item.quantity).toFixed(0)} DH</td>
        </tr>`
      )
      .join("");

    const customerName = order.customer_name || "Unknown";
    const phone = order.phone || "—";
    const city = order.city || "—";
    const address = order.address || "—";
    const note = order.note || "None";
    const total = typeof order.total === "number" ? order.total.toFixed(0) : order.total || "0";
    const shipping = typeof order.shipping === "number" ? order.shipping.toFixed(0) : "0";
    const subtotal = typeof order.subtotal === "number" ? order.subtotal.toFixed(0) : total;
    const createdAt = order.created_at
      ? new Date(order.created_at).toLocaleString("en-GB", { dateStyle: "full", timeStyle: "short" })
      : new Date().toLocaleString("en-GB", { dateStyle: "full", timeStyle: "short" });
    const orderId = order.id ? String(order.id).slice(0, 8).toUpperCase() : "N/A";

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Order — AKS Wear</title>
</head>
<body style="margin:0;padding:0;background:#0d0d0d;font-family:'Segoe UI',Arial,sans-serif;color:#e0e0e0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0d;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#141414;border-radius:16px;overflow:hidden;border:1px solid #2a2a2a;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#c9a84c,#e8c97a);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;font-size:28px;font-weight:800;color:#0d0d0d;letter-spacing:2px;">AKS WEAR</h1>
              <p style="margin:6px 0 0;font-size:14px;color:#3a2a00;font-weight:600;">🛒 NEW ORDER RECEIVED</p>
            </td>
          </tr>

          <!-- Order ID + Date -->
          <tr>
            <td style="padding:24px 40px 0;text-align:center;">
              <p style="margin:0;font-size:13px;color:#888;">Order ID: <strong style="color:#c9a84c;font-family:monospace;letter-spacing:1px;">#${orderId}</strong></p>
              <p style="margin:4px 0 0;font-size:13px;color:#666;">${createdAt}</p>
            </td>
          </tr>

          <!-- Customer Info -->
          <tr>
            <td style="padding:28px 40px 0;">
              <h2 style="margin:0 0 16px;font-size:16px;color:#c9a84c;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #2a2a2a;padding-bottom:10px;">👤 Customer Details</h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:6px 0;color:#888;width:120px;">Name</td>
                  <td style="padding:6px 0;color:#e0e0e0;font-weight:600;">${customerName}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#888;">Phone</td>
                  <td style="padding:6px 0;color:#e0e0e0;">${phone}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#888;">City</td>
                  <td style="padding:6px 0;color:#e0e0e0;">${city}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#888;">Address</td>
                  <td style="padding:6px 0;color:#e0e0e0;">${address}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#888;vertical-align:top;">Note</td>
                  <td style="padding:6px 0;color:#aaa;font-style:italic;">${note}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items -->
          <tr>
            <td style="padding:28px 40px 0;">
              <h2 style="margin:0 0 16px;font-size:16px;color:#c9a84c;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #2a2a2a;padding-bottom:10px;">📦 Order Items</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <thead>
                  <tr style="background:#1e1e1e;">
                    <th style="padding:10px 14px;text-align:left;font-size:12px;color:#888;font-weight:600;text-transform:uppercase;">Product</th>
                    <th style="padding:10px 14px;text-align:center;font-size:12px;color:#888;font-weight:600;text-transform:uppercase;">Size</th>
                    <th style="padding:10px 14px;text-align:center;font-size:12px;color:#888;font-weight:600;text-transform:uppercase;">Qty</th>
                    <th style="padding:10px 14px;text-align:right;font-size:12px;color:#888;font-weight:600;text-transform:uppercase;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsRows || `<tr><td colspan="4" style="padding:14px;color:#666;text-align:center;">No items</td></tr>`}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Totals -->
          <tr>
            <td style="padding:20px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:6px 0;color:#888;text-align:right;">Subtotal</td>
                  <td style="padding:6px 0;color:#e0e0e0;text-align:right;width:100px;">${subtotal} DH</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#888;text-align:right;">Shipping</td>
                  <td style="padding:6px 0;color:#4caf50;text-align:right;">${shipping === "0" ? "FREE" : `${shipping} DH`}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0 0;border-top:1px solid #2a2a2a;text-align:right;font-size:18px;font-weight:700;color:#c9a84c;">TOTAL</td>
                  <td style="padding:10px 0 0;border-top:1px solid #2a2a2a;text-align:right;font-size:18px;font-weight:700;color:#c9a84c;">${total} DH</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 40px 32px;text-align:center;">
              <a href="https://akswear.shop/admin" style="display:inline-block;background:linear-gradient(135deg,#c9a84c,#e8c97a);color:#0d0d0d;font-weight:700;font-size:14px;padding:14px 32px;border-radius:8px;text-decoration:none;letter-spacing:1px;">VIEW IN ADMIN PANEL →</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#0d0d0d;padding:20px 40px;text-align:center;border-top:1px solid #1e1e1e;">
              <p style="margin:0;font-size:12px;color:#444;">AKS Wear · Automated order notification</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    // Send via Resend
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "AKS Wear Orders <onboarding@resend.dev>",
        to: [TO_EMAIL],
        subject: `🛒 New Order #${orderId} — ${customerName} — ${total} DH`,
        html,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      console.error("Resend error:", result);
      return new Response(JSON.stringify({ error: result }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("Email sent:", result.id);
    return new Response(JSON.stringify({ success: true, emailId: result.id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
