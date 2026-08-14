const express = require("express");

const app = express();

const PORT = process.env.PORT || 3000;


/* =========================
   CORS
========================= */

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


/* =========================
   JSON
========================= */

app.use(
    express.json()
);


/* =========================
   TEST SERVEUR
========================= */

app.get("/", (req, res) => {

    res.json({
        status: "online",
        assistant: "Asdrick AI",
        version: "0.2"
    });

});


/* =========================
   CHAT
========================= */

app.post("/api/chat", async (req, res) => {

    try {

        const message =
            typeof req.body?.message === "string"
                ? req.body.message.trim()
                : "";


        if (!message) {

            return res.status(400).json({
                error: "Message manquant"
            });

        }


        console.log(
            "Message reçu :",
            message
        );


        /*
         * POUR L'INSTANT :
         * réponse de test.
         *
         * Le vrai modèle IA sera connecté
         * ici ensuite.
         */

        return res.json({

            success: true,

            reply:
                "J'ai bien reçu ton message : " +
                message

        });


    } catch (error) {

        console.error(
            "Erreur /api/chat :",
            error
        );


        return res.status(500).json({

            success: false,

            error:
                "Erreur interne du serveur"

        });

    }

});


/* =========================
   DÉMARRAGE
========================= */

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `Asdrick AI démarré sur le port ${PORT}`
        );

    }
);
