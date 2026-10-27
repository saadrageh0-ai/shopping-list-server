const express = require("express");
const path = require("path");
const fs = require("fs");
const { MongoClient } = require("mongodb");
const cors = require("cors");

const app = express();
app.use(cors({ origin: "https://saadrageh0-ai.github.io" }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const client = new MongoClient(process.env.MONGODB_URI);
let collection;

// GET: send the list
app.get("/api/shopping-list", async function (req, res) {
    let items = await collection.find({}, { projection: { _id: 0 } }).toArray();
    res.json(items);
});

// POST: add one item
app.post("/api/shopping-list", async function (req, res) {
    let newItem = req.body;

    let alreadyHave = await collection.findOne({
        task: newItem.task
    });

    if (alreadyHave) {
        return res.status(400).json({
            error: "Item already exists"
        });
    }

    await collection.insertOne(newItem);

    res.status(201).json(newItem);
});

// PUT: replace the whole list
app.put("/api/shopping-list", async function (req, res) {
    await collection.deleteMany({});
    if (req.body.length > 0) {
        await collection.insertMany(req.body);
    }
    res.json(req.body);
})

// Connect to MongoDB first, THEN start the server
async function start () {
    await client.connect();
    collection = client.db("shopping-list").collection("items");

    if (await collection.countDocuments() === 0 && fs.existsSync("items.json")) {
        let fileItems = JSON.parse(fs.readFileSync("items.json", "utf8"));
        if (fileItems.length > 0) await collection.insertMany(fileItems);
    }
     
    const PORT = process.env.PORT || 3000;

    app.listen(PORT, function () {
        console.log("Server running on http://localhost:" + PORT);
    });
}

start();
