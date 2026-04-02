// Importation des modules nécessaires
const express = require("express");
const app = express();

/* Importe la base de données de creationBd.js */
const { db, createTables } = require("./bd");











createTables()
    .then(() => {
        const PORT = 3000;
        app.listen(PORT, () => {
            console.log(`Serveur démarré sur le port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Erreur lors de l'initialisation de la base de données:", err);
    });