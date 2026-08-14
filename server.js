const express = require("express");
const OpenAI = require("openai");

const app = express();
const PORT = process.env.PORT || 3000;

const client = process.env.OPENAI_API_KEY
    ? new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
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
   STATUS
===================================================== */

app.get("/", (req, res) => {

    res.json({
        status: "online",
        assistant: "Asdrick AI",
        version: "5.0",
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
                error: "OPENAI_API_KEY manquante."
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


        const history =
            Array.isArray(req.body?.history)
                ? req.body.history
                    .filter(item =>
                        item &&
                        (
                            item.role === "user" ||
                            item.role === "assistant"
                        ) &&
                        typeof item.content === "string" &&
                        item.content.trim()
                    )
                    .slice(-20)
                : [];


        const response =
            await client.responses.create({

                model: "gpt-5-mini",

                instructions: `

Tu es Asdrick AI.

Tu es l'assistant personnel d'Asdrick.

Tu réponds en français par défaut.

Tu dois avoir une conversation naturelle,
fluide et humaine.

Ne parle pas comme un robot ou comme une
documentation technique.

À l'oral, privilégie des réponses courtes,
naturelles et faciles à écouter.

Tu peux être drôle lorsque le contexte
s'y prête.

Tu dois tenir compte de l'historique fourni.

==================================================
ACTIONS IPHONE
==================================================

Les seules actions actuellement autorisées sont :

open_youtube
open_tiktok
open_messages
open_amazon
open_netflix
open_revolut
open_timer
open_alarm
open_website

==================================================
APPLICATIONS
==================================================

Pour ouvrir YouTube :

ACTION:open_youtube

Pour ouvrir TikTok :

ACTION:open_tiktok

Pour ouvrir Messages :

ACTION:open_messages

Pour ouvrir Amazon :

ACTION:open_amazon

Pour ouvrir Netflix :

ACTION:open_netflix

Pour ouvrir Revolut :

ACTION:open_revolut

==================================================
TEMPS
==================================================

Pour demander le raccourci minuteur :

ACTION:open_timer

Pour demander le raccourci alarme :

ACTION:open_alarm

==================================================
WEB
==================================================

Pour ouvrir un site web :

ACTION:open_website

Si une URL précise est demandée,
ajoute :

URL:https://exemple.com

==================================================
RÈGLES
==================================================

Une seule action maximum par réponse.

Si aucune action n'est nécessaire,
réponds normalement.

Ne prétends jamais avoir effectué une action
si elle n'a pas réellement été déclenchée.

Ne crée jamais d'action qui n'est pas dans
la liste autorisée.

Pour Revolut, tu peux uniquement ouvrir
l'application.

Tu ne peux pas effectuer de paiement,
virement ou opération bancaire.

==================================================
STYLE VOCAL
==================================================

Évite les longues introductions.

Évite les listes inutiles lorsque
l'utilisateur parle à la voix.

Utilise une ponctuation naturelle.

Si la question est simple,
réponds simplement.

Si la question nécessite une explication,
explique clairement sans être inutilement long.

`,

                input: [
                    ...history,
                    {
                        role: "user",
                        content: message
                    }
                ]

            });


        let reply =
            response.output_text?.trim() ||
            "Je n'ai pas réussi à générer une réponse.";


        let action = null;
        let url = null;


        /* =================================================
           ACTION
        ================================================= */

        const actionMatch =
            reply.match(
                /ACTION:(open_youtube|open_tiktok|open_messages|open_amazon|open_netflix|open_revolut|open_timer|open_alarm|open_website)/
            );


        if (actionMatch) {

            action =
                actionMatch[1];

        }


        /* =================================================
           URL
        ================================================= */

        const urlMatch =
            reply.match(
                /URL:(https?:\/\/[^\s]+)/i
            );


        if (urlMatch) {

            url =
                urlMatch[1];

        }


        /* =================================================
           NETTOYAGE
        ================================================= */

        reply =
            reply

                .replace(
                    /ACTION:(open_youtube|open_tiktok|open_messages|open_amazon|open_netflix|open_revolut|open_timer|open_alarm|open_website)/g,
                    ""
                )

                .replace(
                    /URL:https?:\/\/[^\s]+/gi,
                    ""
                )

                .trim();


        res.json({

            success: true,

            reply,

            action,

            url

        });


    } catch (error) {

        console.error(
            "❌ ERREUR IA :",
            error
        );


        res.status(500).json({

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
            `🚀 Asdrick AI V5 lancé sur le port ${PORT}`
        );

    }
);