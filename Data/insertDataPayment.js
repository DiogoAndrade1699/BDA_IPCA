const fs = require('fs');
const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://user:user@bda.qql4yxr.mongodb.net/";
const dbName = "bda"; // Altere para o nome do seu banco de dados

function processClientData(sqlData) {
    const lines = sqlData.split('\n');
    const dataObjects = [];

    const pattern = /insert into payment \(payment_type\) values \('([^']*)'\);/;

    lines.forEach((line) => {
        const match = line.match(pattern);
        if (match) {
            const payment_type = match[1];
            
            const data = {
                payment_type
            };
            dataObjects.push(data);
        }
    });

    return dataObjects;
}


async function insertDataPayment() {
    try {
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        console.log("Connected to MongoDB");

        const database = client.db(dbName);

        // Ler o arquivo SQL com os dados para a tabela user
        const sqlData = fs.readFileSync('../SQLDATA/payment.sql', 'utf8');
        const paymentData = processClientData(sqlData); // Função para parsear os dados do SQL

        // Inserir os dados na coleção users
        const clientCollection = database.collection('payments');
        const insertLoginResult = await clientCollection.insertMany(paymentData);
        console.log(`${insertLoginResult.insertedCount} documents inserted into payments collection`);

        // Repita esse processo para outras tabelas que você deseja migrar

        await client.close();
        console.log("Disconnected from MongoDB");
    } catch (error) {
        console.error("Error:", error);
    }
}

insertDataPayment();
