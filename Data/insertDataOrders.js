const fs = require('fs');
const { MongoClient, ObjectId } = require('mongodb');

const uri = "mongodb+srv://user:user@bda.qql4yxr.mongodb.net/";
const dbName = "bda"; // Nome do seu banco de dados

async function processOrderData(sqlData, clientsCollection, deliveryGuysCollection, pharmaciesCollection) {
    const lines = sqlData.split('\n');
    const dataObjects = [];

    const pattern = /insert into "order" \(client_id, delivery_guy_id, pharmacy_id, payment_id, total, delivery_tax, order_date\) values \(([0-9]+), ([0-9]+), ([0-9]+), ([0-9]+), ([0-9.]+), ([0-9.]+), '([^']*)'\);/;

    let pharmacyCount = 0;

    for (const line of lines) {
        const match = line.match(pattern);
        if (match) {
            const client_id = parseInt(match[1]);
            const delivery_guy_id = parseInt(match[2]);
            const pharmacy_id = parseInt(match[3]);
            const payment_id = parseInt(match[4]);
            const total = parseFloat(match[5]);
            const delivery_tax = parseFloat(match[6]);
            const order_date = match[7];

            const client = await clientsCollection.findOne({ user_id: client_id });
            const pharm = await pharmaciesCollection.findOne({ pharmid: pharmacy_id });

            const data = {
                client: client ? client._id : null,
                delivery_guy: delivery_guy_id, // Aqui você pode implementar a lógica para delivery_guy_id
                pharmacy: pharm ? pharm._id : null , // Usar o _id do pharmacy correspondente
                payment_id,
                total,
                delivery_tax,
                order_date
            };

            console.log(data);

            dataObjects.push(data);
        }
        pharmacyCount++; 
        console.log(pharmacyCount);
    }

    return dataObjects;
}

async function insertDataOrders() {
    try {
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        console.log("Conectado ao MongoDB");

        const database = client.db(dbName);

        const sqlData = fs.readFileSync('../SQLDATA/order.sql', 'utf8');

        const clientsCollection = database.collection('clients');
        const deliveryGuysCollection = database.collection('delivery_guys');
        const pharmaciesCollection = database.collection('pharmacies');

        const orderData = await processOrderData(sqlData, clientsCollection, deliveryGuysCollection, pharmaciesCollection);

        if(orderData.length === 0) {
            console.log("Nenhum dado de ordem encontrado ou processado.");
            return;
        }

        const orderCollection = database.collection('orders');
        const insertResult = await orderCollection.insertMany(orderData);
        console.log(`${insertResult.insertedCount} documentos inseridos na coleção orders`);

        await client.close();
        console.log("Desconectado do MongoDB");
    } catch (error) {
        console.error("Erro:", error);
    }
}

insertDataOrders();
