const Stripe = require("stripe");
const jwt = require("jsonwebtoken");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  const sessionId = event.queryStringParameters?.session_id;
  if (!sessionId) {
    return { statusCode: 400, body: "Missing session_id" };
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Sécurité : on n’autorise le lien que si le paiement est bien fait
    if (session.payment_status !== "paid") {
      return { statusCode: 403, body: "Not paid" };
    }

    const email =
      session.customer_details?.email ||
      session.customer_email ||
      null;

    if (!email) {
      return { statusCode: 400, body: "Missing email" };
    }

    const token = jwt.sign(
      { email, purpose: "downloads" },
      process.env.DOWNLOAD_TOKEN_SECRET,
      { expiresIn: "24h" }
    );

    const downloadUrl =
      "https://analyse-autopartage.netlify.app/.netlify/functions/download?token=" +
      encodeURIComponent(token);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ downloadUrl }),
    };
  } catch (e) {
    return { statusCode: 500, body: "Server error" };
  }
};
