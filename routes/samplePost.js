var express = require('express');
var router = express.Router();
const MongoClient = require('mongodb').MongoClient;

const client = new MongoClient('mongodb://localhost:27017/');

const objID = require('mongodb').ObjectId;


router.post('/', async (req, res, next) =>{
  const reqBody = req.body;
  try{
    const database = client.db("meanDB");
    const users = database.collection("users");
    const result = await users.insertOne({username:reqBody.uname, useremail:reqBody.uemail});
    res.json(result);
  } finally {
    //await client.close();
  }
});

module.exports = router;

