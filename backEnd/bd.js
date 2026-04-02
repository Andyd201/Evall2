/* Récupère le package knex */
const knex = require('knex');

/* Créé une instance de la base de données */
const db = knex({
    client: 'better-sqlite3',
    connection: {
        filename: "./Emprunt.sqlite3"
    },
    useNullAsDefault: true
});

/* Fonction qui créé chaque table */
async function createTables() {

        /*---------- Création de la table clients ----------*/
        const cataloge = await db.schema.hasTable("cataloge")
        /* Si la table n'existe pas, on la créé */
        if (!cataloge) {
            await db.schema.createTable("cataloge", (table) => {
                table.increments("idfilms");
                table.string("nomfilm").notNullable();
            });
            console.log("Table 'cataloge' créée. ")
        }


        /*---------- Création de la table employés ----------*/
    const utlisateurs = await db.schema.hasTable("utilisateurs")
    /* Si la table n'existe pas, on la créé */
    if (!utlisateurs) {
        await db.schema.createTable("utilisateurs", (table) => {
            table.increments("idutilisateurs");
            table.string("nom").notNullable();
            table.string("prenom").notNullable();
            table.string("email").notNullable().unique();
            table.string("motdepasse").notNullable();
        });
        console.log("Table 'utilisateurs' créée. ")
    }
}


/* Exporte l'instance db et la fonction createTables */
module.exports = {
    db,
    createTables
};