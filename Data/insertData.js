const fs = require('fs');
const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://user:user@bda.qql4yxr.mongodb.net/";
const dbName = "bda"; // Altere para o nome do seu banco de dados

function processSQLData(sqlData) {
    const lines = sqlData.split('\n');
    const dataObjects = [];

    const pattern = /insert into login \(email, password\) values \('([^']*)', '([^']*)'\)/;

    lines.forEach((line) => {
        const match = line.match(pattern);
        if (match) {
            const email = match[1];
            const password = match[2];

            const data = {
                email,
                password
            };
            dataObjects.push(data);
        }
    });

    return dataObjects;
}


async function insertData() {
    try {
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        console.log("Connected to MongoDB");

        const database = client.db(dbName);

        // Ler o arquivo SQL com os dados para a tabela login
        const sqlData = fs.readFileSync('../SQLDATA/login.sql', 'utf8');
        const loginData = processSQLData(sqlData); // Função para parsear os dados do SQL

        // Inserir os dados na coleção login
        const loginCollection = database.collection('logins');
        const insertLoginResult = await loginCollection.insertMany(loginData);
        console.log(`${insertLoginResult.insertedCount} documents inserted into logins collection`);

        // Repita esse processo para outras tabelas que você deseja migrar

        await client.close();
        console.log("Disconnected from MongoDB");
    } catch (error) {
        console.error("Error:", error);
    }
}

insertData();
