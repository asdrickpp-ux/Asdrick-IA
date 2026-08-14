const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        status: "online",
        assistant: "Asdrick AI",
        version: "0.1"
    });
});

app.post("/api/chat", async (req, res) => {

    try {

        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                error: "Message manquant"
            });
        }

        /*
         * C'est ici que nous connecterons
         * le véritable modèle IA.
         *
         * La clé secrète ne sera JAMAIS
         * écrite dans ce fichier.
         */

        res.json({
            reply:
                "J'ai reçu : " + message
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Erreur serveur"
        });

    }

});


const PORT =
    process.env.PORT || 3000;


app.listen(PORT, () => {

    console.log(
        `Asdrick AI backend lancé sur le port ${PORT}`
    );

});