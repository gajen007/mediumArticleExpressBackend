var express = require('express');
var router = express.Router();
const MongoClient = require('mongodb').MongoClient;

const client = new MongoClient('mongodb://dbase:27017/');

router.get('/', async(req, res, next) =>{
  try{
    const database = client.db("meanDB");
    const users = database.collection("users");
    const selected = await users.findOne({useremail:req.query.userEmail});
    res.send(selected);
  } finally {
    
  }
});

module.exports = router;
