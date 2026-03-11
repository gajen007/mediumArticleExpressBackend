var express = require('express');
var router = express.Router();
const { MongoClient, ServerApiVersion } = require('mongodb');

const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

router.get('/', async (req, res, next) => {
  try {
    if (!req.query.userEmail) {
      return res.json(null);
    }
    await client.connect();
    const database = client.db("meanDB");
    const users = database.collection("users");
    const selected = await users.findOne({ useremail: req.query.userEmail });
    res.json(selected);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message, result: false });
  }
});

module.exports = router;