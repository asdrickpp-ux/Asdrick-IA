const express = require("express");
const OpenAI = require("openai");

const app = express();

const PORT = process.env.PORT || 3000;


/* =====================================================
   OPENAI
===================================================== */

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
    console.error("❌ OPENAI_API_KEY est absente.");
}

const client = apiKey
    ? new OpenAI({
        apiKey: apiKey
    })
    : null;


/* =====================================================
   CORS
===================================================== */

app.use((req, res, next) => {

    res.header(
        "Access-Control-Allow-Origin",
        "*"
    );

    res.header(
        "Access-Control-Allow-Methods",
        "GET,POST,OPTIONS"
    );

    res.header(
        "Access-Control-Allow-Headers",
        "Content-Type"
    );

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();

});


/* =====================================================
   JSON
===================================================== */

app.use(
    express.json({
        limit: "1mb"
    })
);


/* =====================================================
   PAGE TEST
===================================================== */

app.get("/", (req, res) => {

    res.json({
        status: "online",
        assistant: "Asdrick AI",
        version: "1.0",
        ai: client ? "connected" : "missing_api_key"
    });

});


/* =====================================================
   CHAT IA
===================================================== */

app.post("/api/chat", async (req, res) => {

    try {

        if (!client) {

            return res.status(500).json({
                success: false,
                error: "La clé API OpenAI n'est pas configurée sur Render."
            });

        }


        const message =
            typeof req.body?.message === "string"
                ? req.body.message.trim()
                : "";


        if (!message) {

            return res.status(400).json({
                success: false,
                error: "Message manquant."
            });

        }


        console.log(
            "📩 Message reçu :",
            message
        );


        const response =
            await client.responses.create({

                model: "gpt-5-mini",

                instructions: `
Tu es Asdrick AI, l'assistant personnel d'Asdrick.

Tu réponds en français par défaut.

Ton style :
- naturel
- intelligent
- direct
- chaleureux
- parfois humoristique
- pas de réponses inutilement longues
- tu expliques clairement les choses compliquées
- tu ne prétends jamais avoir accès à l'iPhone si tu ne l'as pas réellement
- tu ne prétends jamais avoir effectué une action que tu n'as pas effectuée

Tu dois répondre directement à la demande de l'utilisateur.
`,

                input: message

            });


        const reply =
            response.output_text ||
            "Je n'ai pas réussi à générer une réponse.";


        console.log(
            "🤖 Réponse générée."
        );


        return res.json({

            success: true,

            reply: reply

        });


    } catch (error) {

        console.error(
            "❌ Erreur IA :",
            error
        );


        return res.status(500).json({

            success: false,

            error:
                "Une erreur est survenue lors de la communication avec l'IA."

        });

    }

});


/* =====================================================
   SERVEUR
===================================================== */

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `🚀 Asdrick AI lancé sur le port ${PORT}`
        );

    }
);