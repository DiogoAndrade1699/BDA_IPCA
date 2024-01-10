const fs = require('fs');
const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://user:user@bda.qql4yxr.mongodb.net/";
const dbName = "bda"; // Altere para o nome do seu banco de dados

function processCategoryProdData(sqlData) {
    const lines = sqlData.split('\n');
    const dataObjects = [];

    const pattern = /insert into category_product \(description\) values \('(.*)'\);/;

    lines.forEach((line) => {
        const match = line.match(pattern);
        if (match) {
            const description = match[1];

            const data = {
                description
            };
            dataObjects.push(data);
        }
    });

    return dataObjects;
}

async function insertDataCatProd() {
    try {
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        console.log("Connected to MongoDB");

        const database = client.db(dbName);

        // Ler o arquivo SQL com os dados para a tabela category_product
        const sqlData = fs.readFileSync('../SQLDATA/category_product.sql', 'utf8');
        const categoryMap = processCategoryProdData(sqlData);

        // Inserir os dados na coleção MongoDB
        const clientCollection = database.collection('category_products');
        const insertResult = await clientCollection.insertMany(categoryMap);
        console.log(`${insertResult.insertedCount} documents inserted into category_products collection`);

        await client.close();
        console.log("Disconnected from MongoDB");
    } catch (error) {
        console.error("Error:", error);
    }
}

insertDataCatProd();


