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

router.post('/', async (req, res, next) => {
  const reqBody = req.body;
  try {
    await client.connect();
    const database = client.db("meanDB");
    const users = database.collection("users");
    const result = await users.insertOne({
      username: reqBody.uname,
      useremail: reqBody.uemail
    });
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message, result: false });
  }
});

module.exports = router;