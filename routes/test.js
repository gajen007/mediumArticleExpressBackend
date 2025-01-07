var express = require('express');
var router = express.Router();

router.get('/', async(req, res, next) =>{
      res.send({message:"Works from Container !",result:true});
});

module.exports = router;
