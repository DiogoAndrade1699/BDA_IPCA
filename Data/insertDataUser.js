const fs = require('fs');
const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://user:user@bda.qql4yxr.mongodb.net/";
const dbName = "bda"; // Altere para o nome do seu banco de dados

function processSQLData(sqlData) {
    const lines = sqlData.split('\n');
    const dataObjects = [];

    const pattern = /insert into "user" \(username, user_type, login_id\) values \('([^']*)', '([^']*)', ([0-9]*)\);/;

    lines.forEach((line) => {
        const match = line.match(pattern);
        if (match) {
            const username = match[1];
            const userType = match[2];
            const loginId = parseInt(match[3]); // Parse para número inteiro

            const data = {
                username,
                user_type: userType,
                login_id: loginId
            };
            dataObjects.push(data);
        }
    });

    return dataObjects;
}


async function insertDataUser() {
    try {
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        console.log("Connected to MongoDB");

        const database = client.db(dbName);

        // Ler o arquivo SQL com os dados para a tabela user
        const sqlData = fs.readFileSync('../SQLDATA/user.sql', 'utf8');
        const userData = processSQLData(sqlData); // Função para parsear os dados do SQL

        // Inserir os dados na coleção users
        const userCollection = database.collection('users');
        const insertLoginResult = await userCollection.insertMany(userData);
        console.log(`${insertLoginResult.insertedCount} documents inserted into users collection`);

        // Repita esse processo para outras tabelas que você deseja migrar

        await client.close();
        console.log("Disconnected from MongoDB");
    } catch (error) {
        console.error("Error:", error);
    }
}

insertDataUser();
