const Stripe = require("stripe");
const jwt = require("jsonwebtoken");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const sig =
    event.headers["stripe-signature"] || event.headers["Stripe-Signature"];

  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Signature error:", err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  console.log("✅ Stripe event received:", stripeEvent.type);

  if (stripeEvent.type === "checkout.session.completed") {
    const session = stripeEvent.data.object;

     const email =
    session.customer_details?.email ||
    session.customer_email ||
    session.customer?.email ||
    null;

  if (!email) {
    console.error("❌ No customer email found in Checkout session");
    return { statusCode: 200, body: "ok" }; // on ne bloque pas Stripe
  }


    const token = jwt.sign(
      { email, purpose: "downloads" },
      process.env.DOWNLOAD_TOKEN_SECRET,
      { expiresIn: "24h" }
    );

    const downloadUrl =
      `https://analyse-autopartage.netlify.app/.netlify/functions/download?token=` +
      encodeURIComponent(token);

    console.log("✅ Download token created:", downloadUrl);
  }
// Envoi à Make pour email automatique
try {
  const res = await fetch(process.env.MAKE_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      email,
      downloadUrl,
      eventType: stripeEvent.type,
    }),
  });

  console.log("✅ Make notified:", res.status);
} catch (e) {
  console.error("❌ Make call failed:", e.message);
}

  return { statusCode: 200, body: "ok" };
};
