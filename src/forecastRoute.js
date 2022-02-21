const express = require("express");
const router =  express.Router();
const db = require('./mongo-connection.js');

db.connectToServer(function (err) {
  if (err) {
    console.error(err);
    process.exit();
  }
})

router.get("/", function(req, res){
    console.log("Hämtade ut väderprognoser!");
})

// GET latest forecast from date and city. G
router.get("/:city/:date", function(req, res, next){
    let number  = 1;
    if(req.query.number){
        number = parseInt(req.query.number);
    }else{
        number = 1;
    }
    var totime = new Date(req.params.date);
    totime.setDate(totime.getDate() + number);
    var days = totime.toISOString().substring(0, 10);
    const dbConnect = db.getDb();
    var query = {fromtime:{$gte:req.params.date},totime:{$lte: days}};
    dbConnect.collection('forecasts')
        .find(query)
        .toArray(function (err, result) {
        if (err) {
            console.log("Something went wrong with DB call", err)
        } else {
            if(result.length > 0){
                res.status(200).send(result);
            }else{
                res.status(404).json({msg: "Didnt find any"});
            }
        }
    });
})

//Get last forecast from specific city! Getting last 4 from forecast and adding to array with reverse order.
router.get("/:name", function(req, res, next){
    let sql = "select * from forecast where name=? order by fromtime DESC limit 4";
    const dbConnect = db.getDb();
    var query = {['name']: req.params.name};
    dbConnect.collection('forecasts')
    .find(query)
    .sort({fromtime: -1})
    .limit(1)
    .toArray(function(err, result){
        if(err){
            throw err;
        }
        if(result.length > 0){
            res.status(200).send(result);
        }else{
            next();
        }
    });
})

//GET last forecast of specific date done. Returns the last forecast of a specific date.!
router.get("/:date", function(req, res){
    const dbConnect = db.getDb();
    var query = {['date']: req.params.date};
    dbConnect.collection('forecasts')
    .find(query)
    .sort(-1)
    .toArray(function(err, result){
        if(err){
            throw err;
        }
        if(result.length > 0){
            res.status(200).send(result);
        }else{
            res.status(200).send([]);
        }
    });
})

module.exports = router;