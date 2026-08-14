const express = require("express");
const OpenAI = require("openai");

const app = express();

const PORT = process.env.PORT || 3000;


/* =====================================================
   OPENAI
===================================================== */

const apiKey = process.env.OPENAI_API_KEY;

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
        limit: "2mb"
    })
);


/* =====================================================
   TEST
===================================================== */

app.get("/", (req, res) => {

    res.json({
        status: "online",
        assistant: "Asdrick AI",
        version: "2.0",
        ai: client ? "connected" : "missing_api_key"
    });

});


/* =====================================================
   CHAT
===================================================== */

app.post("/api/chat", async (req, res) => {

    try {

        if (!client) {

            return res.status(500).json({
                success: false,
                error: "OPENAI_API_KEY est absente."
            });

        }


        const message =
            typeof req.body?.message === "string"
                ? req.body.message.trim()
                : "";


        const history =
            Array.isArray(req.body?.history)
                ? req.body.history
                : [];


        if (!message) {

            return res.status(400).json({
                success: false,
                error: "Message manquant."
            });

        }


        /*
         * On limite l'historique pour éviter
         * d'envoyer une conversation gigantesque
         * à chaque requête.
         */

        const safeHistory =
            history
                .filter(item =>
                    item &&
                    (
                        item.role === "user" ||
                        item.role === "assistant"
                    ) &&
                    typeof item.content === "string"
                )
                .slice(-20);


        /*
         * Construction du contexte
         */

        const conversation = [

            ...safeHistory,

            {
                role: "user",
                content: message
            }

        ];


        console.log(
            "📩 Message :",
            message
        );


        const response =
            await client.responses.create({

                model: "gpt-5-mini",

                instructions: `
Tu es Asdrick AI, l'assistant personnel d'Asdrick.

Tu réponds en français par défaut.

PERSONNALITÉ :
- naturel
- intelligent
- direct
- chaleureux
- parfois drôle
- jamais inutilement compliqué
- tu peux utiliser quelques emojis quand ils sont naturels

COMPORTEMENT :
- comprends le contexte de la conversation
- ne répète pas inutilement les informations déjà données
- réponds précisément à la question
- si tu ne sais pas quelque chose, dis-le clairement
- ne prétends jamais avoir effectué une action que tu n'as pas réellement effectuée
- ne prétends pas contrôler l'iPhone si aucune fonction de contrôle n'est réellement disponible
- respecte les demandes de l'utilisateur

IMPORTANT :
La conversation précédente fournie dans "input" fait partie du contexte.
Utilise-la pour comprendre les messages suivants.
`,

                input: conversation

            });


        const reply =
            response.output_text ||
            "Je n'ai pas réussi à générer une réponse.";


        console.log(
            "🤖 Réponse générée"
        );


        return res.json({

            success: true,

            reply: reply

        });


    } catch (error) {

        console.error(
            "❌ Erreur OpenAI :",
            error
        );


        return res.status(500).json({

            success: false,

            error:
                "Erreur lors de la communication avec l'IA."

        });

    }

});


/* =====================================================
   START
===================================================== */

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `🚀 Asdrick AI V2 lancé sur le port ${PORT}`
        );

    }
);