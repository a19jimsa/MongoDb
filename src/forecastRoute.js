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
            let obj = [];
            let auxdata = [];
            var j = 0;
            for(var i = 0; i < result.length; i++){
                auxdata.push({"name": result[i].name, "fromtime": result[i].fromtime, "totime": result[i].totime, "auxdata":JSON.parse(result[i].auxdata)});
                if((i+1) % 4 == 0){
                    var feed = {"name": result[j].name, "fromtime": result[j].fromtime, "totime": result[j].totime, "auxdata":auxdata};
                    obj.push(feed);
                    auxdata = [];
                    j+=4;
                }
            }
            res.status(200).send(obj);
            }else{
                next();
            }
        }
    });
})

//GET Name and code from climatecodes and forecast and info with climatecode and date. VG
router.get("/:code/:date", function(req, res){
    let sql = "select info.name as name, climatecodes.code as code, info.country as country, info.about as about from climatecodes inner join info on info.climatecode=climatecodes.code where code=?";
    console.log(req.params.code);
    dbo.all(sql, [req.params.code], (err, rows)=>{
        if(err){
            throw err;
        }
        res.status(200).send(rows);
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
    .limit(4)
    .toArray(function(err, result){
        if(err){
            throw err;
        }
        if(result.length > 0){
            let obj = [];
            let auxdata = [];
            
            for(var i = result.length-1; i >= 0; i--){
                auxdata.push({"name": result[i].name, "fromtime": result[i].fromtime, "totime": result[i].totime, "auxdata":JSON.parse(result[i].auxdata)});
            }
            for(var i = 0; i < 1; i++){
                var feed = {"name": result[i].name, "fromtime": result[i].fromtime, "totime": result[i].totime, "auxdata":auxdata};
                obj.push(feed);
            }
            res.status(200).send(obj);
        }else{
            next();
        }
    });
})

//GET last forecast of specific date done. Returns the last forecast of a specific date.!
router.get("/:date", function(req, res){
    console.log(req.params.date);
    let sql = 'SELECT * FROM forecast where fromtime like "%'+req.params.date+'%"';
    const dbConnect = db.getDb();
    var query = {['name']: req.params.name};
    dbConnect.collection('forecasts')
    .find(query)
    .sort(-1)
    .toArray(function(err, result){
        if(err){
            throw err;
        }
        if(result.length > 0){
            let obj = [];
            let auxdata = [];
            for(var i = result.length-1; i >= 0; i--){
                auxdata.push({"name": result[i].name, "fromtime": result[i].fromtime, "totime": result[i].totime, "auxdata":JSON.parse(result[i].auxdata)});
            }
            for(var i = 0; i < 1; i++){
                var feed = {"name": result[i].name, "fromtime": result[i].fromtime, "totime": result[i].totime, "auxdata":auxdata};
                obj.push(feed);
            }
            res.status(200).send(obj);
        }else{
            res.status(200).send([]);
        }
    });
    
})

module.exports = router;