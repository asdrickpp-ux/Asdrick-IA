const express = require("express");
const OpenAI = require("openai");

const app = express();

const PORT = process.env.PORT || 3000;
const apiKey = process.env.OPENAI_API_KEY;

const client = apiKey
    ? new OpenAI({ apiKey })
    : null;


/* =====================================================
   CORS
===================================================== */

app.use((req, res, next) => {

    res.header("Access-Control-Allow-Origin", "*");
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
        version: "3.1",
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


        const receivedHistory =
            Array.isArray(req.body?.history)
                ? req.body.history
                : [];


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
                        item.content.trim()
                    );

                })
                .slice(-20);


        const conversation = [
            ...history,
            {
                role: "user",
                content: message
            }
        ];


        const response =
            await client.responses.create({

                model: "gpt-5-mini",

                instructions: `

Tu es Asdrick AI, l'assistant personnel
d'Asdrick.

Tu réponds en français par défaut.

Tu es naturel, intelligent, direct,
chaleureux et parfois humoristique.

Tu utilises l'historique fourni pour
comprendre le contexte.

==================================================
ACTIONS DISPONIBLES
==================================================

Tu peux demander UNE SEULE action
par réponse.

Actions disponibles :

open_youtube
open_tiktok
open_messages
open_amazon
open_netflix
open_revolut

==================================================
RÈGLES DES ACTIONS
==================================================

Si l'utilisateur demande clairement
d'ouvrir YouTube :

ACTION:open_youtube

Si l'utilisateur demande clairement
d'ouvrir TikTok :

ACTION:open_tiktok

Si l'utilisateur demande clairement
d'ouvrir Messages :

ACTION:open_messages

Si l'utilisateur demande clairement
d'ouvrir Amazon :

ACTION:open_amazon

Si l'utilisateur demande clairement
d'ouvrir Netflix :

ACTION:open_netflix

Si l'utilisateur demande clairement
d'ouvrir Revolut :

ACTION:open_revolut

==================================================
IMPORTANT
==================================================

Si aucune action n'est nécessaire,
réponds normalement.

Si une action est nécessaire,
tu peux expliquer brièvement ce que
tu vas faire puis termine exactement
par la commande d'action.

Exemple :

Je t'ouvre TikTok.

ACTION:open_tiktok

Ne crée jamais une action qui n'existe
pas dans la liste.

Ne prétends jamais avoir exécuté une
action si aucune action n'a été déclenchée.

==================================================
SÉCURITÉ
==================================================

L'action Revolut ne permet ici que
d'ouvrir l'application.

Tu ne dois jamais prétendre pouvoir
effectuer un paiement, un virement,
modifier un compte bancaire ou lire
des informations privées.

`,

                input: conversation

            });


        let reply =
            typeof response.output_text === "string"
                ? response.output_text.trim()
                : "";


        if (!reply) {

            reply =
                "Je n'ai pas réussi à générer une réponse.";

        }


        let action = null;


        const actionMatch =
            reply.match(
                /ACTION:(open_youtube|open_tiktok|open_messages|open_amazon|open_netflix|open_revolut)/
            );


        if (actionMatch) {

            action =
                actionMatch[1];

        }


        /*
         * Supprime la commande technique
         * de la réponse affichée à l'utilisateur.
         */

        reply =
            reply
                .replace(
                    /ACTION:(open_youtube|open_tiktok|open_messages|open_amazon|open_netflix|open_revolut)/g,
                    ""
                )
                .trim();


        return res.json({

            success: true,

            reply,

            action

        });


    } catch (error) {

        console.error(
            "❌ ERREUR IA :",
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
            `🚀 Asdrick AI V3.1 lancé sur le port ${PORT}`
        );

    }
);