const mongoose = require("mongoose");

// Sua string de conexão
const uri = "mongodb+srv://user:user@bda.qql4yxr.mongodb.net/";

const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

mongoose
    .connect(uri, connectionParams)
    .then(() => {
        console.info("Connected");
    })
    .catch((e) => {
        console.log("Error:", e);
    });
