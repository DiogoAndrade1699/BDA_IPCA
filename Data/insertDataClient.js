const fs = require('fs');
const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://user:user@bda.qql4yxr.mongodb.net/";
const dbName = "bda"; // Altere para o nome do seu banco de dados

function processClientData(sqlData) {
    const lines = sqlData.split('\n');
    const dataObjects = [];

    const pattern = /insert into client \(user_id, name, address, birthdate, nif, phone_number\) values \(([0-9]+), '(.*)', '([^']*)', '([^']*)', ([0-9]+), '([^']*)'\);/;

    lines.forEach((line) => {
        const match = line.match(pattern);
        if (match) {
            const user_id = parseInt(match[1]); // Parse para número inteiro
            const name = match[2];
            const address = match[3];
            const birthdate = match[4];
            const nif = parseInt(match[5]); // Parse para número inteiro
            const phone_number = match[6];

            const data = {
                user_id,
                name,
                address,
                birthdate,
                nif,
                phone_number
            };
            dataObjects.push(data);
        }
    });

    return dataObjects;
}




async function insertDataClient() {
    try {
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        console.log("Connected to MongoDB");

        const database = client.db(dbName);

        // Ler o arquivo SQL com os dados para a tabela user
        const sqlData = fs.readFileSync('../SQLDATA/client.sql', 'utf8');
        const clientData = processClientData(sqlData); // Função para parsear os dados do SQL

        // Inserir os dados na coleção users
        const clientCollection = database.collection('clients');
        const insertLoginResult = await clientCollection.insertMany(clientData);
        console.log(`${insertLoginResult.insertedCount} documents inserted into clients collection`);

        // Repita esse processo para outras tabelas que você deseja migrar

        await client.close();
        console.log("Disconnected from MongoDB");
    } catch (error) {
        console.error("Error:", error);
    }
}

insertDataClient();
