const express = require("express");
const OpenAI = require("openai");

const app = express();

const PORT = process.env.PORT || 3000;

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
   TEST DU SERVEUR
===================================================== */

app.get("/", (req, res) => {

    res.json({
        status: "online",
        assistant: "Asdrick AI",
        version: "2.0",
        ai: client
            ? "connected"
            : "missing_api_key"
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
                error:
                    "OPENAI_API_KEY est absente de Render."
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


        /*
         * Historique envoyé par l'iPhone
         */

        const receivedHistory =
            Array.isArray(req.body?.history)
                ? req.body.history
                : [];


        /*
         * Nettoyage et limitation
         * de l'historique.
         */

        const history =
            receivedHistory
                .filter(item => {

                    return (
                        item &&
                        (
                            item.role === "user" ||
                            item.role === "assistant"
                        ) &&
                        typeof item.content === "string" &&
                        item.content.trim().length > 0
                    );

                })
                .slice(-20);


        /*
         * Construction de la conversation.
         */

        const conversation = [
            ...history,
            {
                role: "user",
                content: message
            }
        ];


        console.log(
            "📩 Message reçu :",
            message
        );


        /*
         * Appel au modèle IA
         */

        const response =
            await client.responses.create({

                model: "gpt-5-mini",

                instructions: `
Tu es Asdrick AI, l'assistant personnel d'Asdrick.

LANGUE :
Réponds en français par défaut.
Si l'utilisateur parle une autre langue,
réponds dans cette langue.

PERSONNALITÉ :
- naturel
- intelligent
- direct
- chaleureux
- détendu
- parfois humoristique
- jamais inutilement long
- explique clairement les choses complexes

COMPORTEMENT :
- utilise le contexte de la conversation
- ne demande pas à l'utilisateur de répéter
  quelque chose déjà présent dans l'historique
- répond directement aux questions
- reconnais clairement tes limites
- ne mens jamais sur tes capacités
- ne prétends jamais avoir contrôlé l'iPhone
  si aucune fonction de contrôle n'est disponible
- ne prétends jamais avoir effectué une action
  que tu n'as pas réellement effectuée

CONTEXTE :
Les messages précédents fournis dans "input"
font partie de la conversation actuelle.
Utilise-les pour comprendre les messages
suivants.

Tu es l'intelligence conversationnelle
derrière l'application appelée "Asdrick AI".
`,

                input: conversation

            });


        const reply =
            typeof response.output_text === "string" &&
            response.output_text.trim().length > 0
                ? response.output_text.trim()
                : "Je n'ai pas réussi à générer une réponse.";


        console.log(
            "🤖 Réponse générée."
        );


        return res.json({

            success: true,

            reply: reply

        });


    } catch (error) {

        console.error(
            "❌ ERREUR OPENAI :",
            error
        );


        return res.status(500).json({

            success: false,

            error:
                "Une erreur est survenue avec le modèle IA."

        });

    }

});


/* =====================================================
   DÉMARRAGE
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