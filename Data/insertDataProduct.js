const fs = require('fs');
const { MongoClient} = require('mongodb');
const { ObjectId } = require('mongodb');


const uri = "mongodb+srv://user:user@bda.qql4yxr.mongodb.net/";
const dbName = "bda"; // Altere para o nome do seu banco de dados

function processProductData(sqlData, categoryMap) {
    const lines = sqlData.split('\n');
    const dataObjects = [];

    const pattern = /insert into product \(description, stock, price, iva, discount, category_id\) values \('(.*)', ([0-9]+), ([0-9.]+), ([0-9]+), ([0-9]+), ([0-9]+)\);/;

    lines.forEach((line) => {
        const match = line.match(pattern);
        if (match) {
            const description = match[1];
            const stock = parseInt(match[2]);
            const price = parseFloat(match[3]);
            const iva = parseInt(match[4]);
            const discount = parseInt(match[5]);
            const category_id = parseInt(match[6]);

            if (categoryMap[category_id]) {
                const data = {
                    description,
                    stock,
                    price,
                    iva,
                    discount,
                    category_id: categoryMap[category_id], // Use o ID de categoria correspondente
                };
                dataObjects.push(data);
            } else {
                console.error(`Invalid category_id (${category_id}) for description "${description}"`);
                // Você pode optar por ignorar ou lidar com esses casos inválidos de outra forma
            }
        }
    });

    return dataObjects;
}

async function insertDataProd() {
    try {
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        console.log("Connected to MongoDB");

        const database = client.db(dbName);

        // Mapeamento de category_id para ObjectIDs correspondentes
        const categoryMap = {
            1: ObjectId.createFromHexString("659d6a693f094445c476f129"),
            2: ObjectId.createFromHexString("659d6a693f094445c476f12a"),
            3: ObjectId.createFromHexString("659d6a693f094445c476f12b"),
            4: ObjectId.createFromHexString("659d6a693f094445c476f12c"),
            5: ObjectId.createFromHexString("659d6a693f094445c476f12d"),
            6: ObjectId.createFromHexString("659d6a693f094445c476f12e"),
            7: ObjectId.createFromHexString("659d6a693f094445c476f12f"),
            8: ObjectId.createFromHexString("659d6a693f094445c476f130"),
            9: ObjectId.createFromHexString("659d6a693f094445c476f131"),
            10: ObjectId.createFromHexString("659d6a693f094445c476f132"),
            11: ObjectId.createFromHexString("659d6a693f094445c476f133"),
            12: ObjectId.createFromHexString("659d6a693f094445c476f134"),
            13: ObjectId.createFromHexString("659d6a693f094445c476f135"),
            14: ObjectId.createFromHexString("659d6a693f094445c476f136"),
            15: ObjectId.createFromHexString("659d6a693f094445c476f137"),
            16: ObjectId.createFromHexString("659d6a693f094445c476f138")
        };

        // Ler o arquivo SQL com os dados para a tabela products
        const sqlData = fs.readFileSync('../SQLDATA/product.sql', 'utf8');
        const productData = processProductData(sqlData, categoryMap);

        // Inserir os dados na coleção products
        const productCollection = database.collection('products');
        const insertResult = await productCollection.insertMany(productData);
        console.log(`${insertResult.insertedCount} documents inserted into products collection`);

        // Fechar a conexão com o MongoDB
        await client.close();
        console.log("Disconnected from MongoDB");
    } catch (error) {
        console.error("Error:", error);
    }
}

insertDataProd();
