const fs = require('fs');
const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://user:user@bda.qql4yxr.mongodb.net/";
const dbName = "bda"; // Altere para o nome do seu banco de dados

function processPharmacyData(sqlData) {
    const lines = sqlData.split('\n');
    const dataObjects = [];

    const pattern = /insert into pharmacy \(name, address, lat, lon, phone_number, open_time, close_time\) values \('(.*)', '([^']*)', ([0-9.-]+), ([0-9.-]+), '([^']*)', '([^']*)', '([^']*)'\);/;

    for (let index = 0; index < lines.length; index++) {
        const match = lines[index].match(pattern);
        if (match) {
            const name = match[1];
            const address = match[2];
            const lat = parseFloat(match[3]); // Parse para número decimal
            const lon = parseFloat(match[4]); // Parse para número decimal
            const phone_number = match[5];
            const open_time = match[6];
            const close_time = match[7];

            const data = {
                pharmid: index + 1, // Incrementando um contador sequencial para pharmid
                name,
                address,
                lat,
                lon,
                phone_number,
                open_time,
                close_time
            };
            dataObjects.push(data);
        }
    }

    return dataObjects;
}


async function insertDataPharmacy() {
    try {
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        console.log("Connected to MongoDB");

        const database = client.db(dbName);

        // Ler o arquivo SQL com os dados para a tabela pharmacy
        const sqlData = fs.readFileSync('../SQLDATA/pharmacy.sql', 'utf8');
        const clientData = processPharmacyData(sqlData); // Função para parsear os dados do SQL

        // Inserir os dados na coleção pharmacies
        const clientCollection = database.collection('pharmacies');
        const insertLoginResult = await clientCollection.insertMany(clientData);
        console.log(`${insertLoginResult.insertedCount} documents inserted into pharmacies collection`);

        // Repita esse processo para outras tabelas que você deseja migrar

        await client.close();
        console.log("Disconnected from MongoDB");
    } catch (error) {
        console.error("Error:", error);
    }
}

insertDataPharmacy();
