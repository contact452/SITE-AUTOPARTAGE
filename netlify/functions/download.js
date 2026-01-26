const jwt = require("jsonwebtoken");

exports.handler = async (event) => {
  const token = event.queryStringParameters?.token;

  if (!token) {
    return {
      statusCode: 400,
      body: "Token manquant",
    };
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.DOWNLOAD_TOKEN_SECRET
    );

    console.log("✅ Token valide pour :", decoded.email);

    const calculatorUrl = process.env.FILE_CALCULATOR_URL;
    const guideUrl = process.env.FILE_GUIDE_URL;

   return {
  statusCode: 200,
  headers: { "Content-Type": "text/html; charset=utf-8" },
  body: `
    <!doctype html>
    <html lang="fr">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Téléchargement</title>
      </head>
      <body>
        <h2>Téléchargement</h2>
        <p>Merci pour votre achat.</p>
        <ul>
          <li><a href="${calculatorUrl}" target="_blank" rel="noopener">📊 Télécharger le calculateur</a></li>
          <li><a href="${guideUrl}" target="_blank" rel="noopener">📘 Télécharger le mode d’emploi</a></li>
        </ul>
        <hr style="margin:20px 0; opacity:0.3">

<p style="font-size:13px; color:#666; max-width:520px;">
  <strong>ℹ️ Information importante</strong><br>
  Si Google affiche une page de connexion avant le téléchargement,
  connectez-vous simplement à un compte Google puis relancez le téléchargement.
  <br>
  <strong>Votre lien reste valable 24 heures.</strong>
</p>

      </body>
    </html>
  `,
};

  } catch (err) {
    console.error("❌ Token invalide ou expiré");
    return {
      statusCode: 401,
      body: "Lien expiré ou invalide",
    };
  }
};
