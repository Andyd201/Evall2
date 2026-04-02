// Importation des modules nécessaires
const express = require("express");
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const JWT_SECRET = "DefiDonnermoimon100";

/* Importe la base de données de creationBd.js */
const { db, createTables } = require("./bd");

app.use(cors());
app.use(express.json());

/**
 * Middleware d'authentification
 */

const authentifier = (req, res, next) => {
    // 1. Récupérer le header Authorization
    const authHeader = req.headers['authorization'];
    
    // 2. Extraire le token (Format: "Bearer <token>")
    const token = authHeader && authHeader.split(' ')[1];

    // 3. Si aucun token n'est présent -> Dehors !
    if (!token) {
        return res.status(401).json({ message: "Accès refusé. Badge manquant." });
    }

    try {
        // 4. Vérification de la signature avec notre clé secrète
        const userDecoded = jwt.verify(token, JWT_SECRET);

        // 5. FEU VERT : On attache les infos de l'utilisateur à la requête 
        // pour que la route suivante sache qui parle.
        req.user = userDecoded;

        // 6. On passe à la suite !
        next();

    } catch (err) {
        // 7. Badge falsifié ou expiré -> Erreur
        return res.status(403).json({ message: "Badge invalide ou expiré." });
    }
};

module.exports = authentifier;

app.get("/api", async (req,res) => {
    res.json({ message: "Bienvenue sur l'API du catalogue de films !" });
})

// Routes Publiques


app.get("/api/movies/:id", async (req, res) => {
    try {
        // 1. Récupérer le film avec l'ID spécifié
        const film = await db('cataloge').select('*').where({ id: req.params.id }).first();

        if (!film) {
            return res.status(404).json({ message: "Film non trouvé." });
        }

        res.json(film);
    } catch (err) {
        console.error("Erreur lors de la récupération du film:", err);
        res.status(500).json({ message: "Erreur serveur lors de la récupération du film." });
    }
});


app.get("/api/movies/search", async (req, res) => {
    const { nomfilm } = req.query;

    try {
        // 1. Rechercher les films dont le nom contient la chaîne de recherche
        const films = await db('cataloge')
            .select('*')
            .where('nomfilm', 'like', `%${nomfilm}%`);

        res.json(films);
    } catch (err) {
        console.error("Erreur lors de la recherche de films:", err);
        res.status(500).json({ message: "Erreur serveur lors de la recherche de films." });
    }
});

// Routes Protegee

app.post("/api/films", authentifier, async (req, res) => {
    const { nomfilm } = req.body;

    try {
        // 1. Insérer le nouveau film dans la base de données
        await db('cataloge').insert({ nomfilm });
        
        res.status(201).json({ message: "Film ajouté au catalogue avec succès." });
    } catch (err) {
        console.error("Erreur lors de l'ajout du film:", err);
        res.status(500).json({ message: "Erreur serveur lors de l'ajout du film." });
    }
});

app.put("/api/films/:id", authentifier, async (req, res) => {
    const { nomfilm } = req.body;

    try {
        // 1. Mettre à jour le film avec l'ID spécifié
        const updated = await db('cataloge')
            .where({ id: req.params.id })
            .update({ nomfilm });

        if (!updated) {
            return res.status(404).json({ message: "Film non trouvé." });
        }

        res.json({ message: "Film mis à jour avec succès." });
    } catch (err) {
        console.error("Erreur lors de la mise à jour du film:", err);
        res.status(500).json({ message: "Erreur serveur lors de la mise à jour du film." });
    }
});

app.delete("/api/films/:id", authentifier, async (req, res) => {
    try {
        // 1. Supprimer le film avec l'ID spécifié
        const deleted = await db('cataloge')
            .where({ id: req.params.id })
            .del();

        if (!deleted) {
            return res.status(404).json({ message: "Film non trouvé." });
        }

        res.json({ message: "Film supprimé du catalogue avec succès." });
    } catch (err) {
        console.error("Erreur lors de la suppression du film:", err);
        res.status(500).json({ message: "Erreur serveur lors de la suppression du film." });
    }
});





// Commande pour cree un compte et se connecter :

app.post("/api/register", async (req, res) => {
    const { nom, prenom, email, motdepasse } = req.body;

    try {
        // 1. Vérifier si l'utilisateur existe déjà
        const existingUser = await db('utilisateurs').where({ email }).first();
        if (existingUser) {
            return res.status(400).json({ message: "Un utilisateur avec cet email existe déjà." });
        }

        // 2. Insérer le nouvel utilisateur dans la base de données
        await db('utilisateurs').insert({ nom, prenom, email, motdepasse });

        res.status(201).json({ message: "Utilisateur enregistré avec succès." });

    } catch (err) {
        console.error("Erreur lors de l'enregistrement:", err);
        res.status(500).json({ message: "Erreur serveur lors de l'enregistrement." });
    }
});


app.post("/api/login", async (req, res) => {
    const { email, motdepasse } = req.body;

    try {
        // 1. Vérifier les identifiants de l'utilisateur
        const user = await db('utilisateurs').where({ email, motdepasse }).first();

        if (!user) {
            return res.status(401).json({ message: "Email ou mot de passe incorrect." });
        }

        // 2. Générer un token JWT avec les infos de l'utilisateur
        const token = jwt.sign(
            { idutilisateurs: user.idutilisateurs, email: user.email },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        // 3. Envoyer le token au client
        res.json({ token });

    } catch (err) {
        console.error("Erreur lors de la connexion:", err);
        res.status(500).json({ message: "Erreur serveur lors de la connexion." });
    }
});




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