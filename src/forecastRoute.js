const { response } = require("express");
const express = require("express");
const router =  express.Router();
var sqlite3 = require('sqlite3').verbose();


let db = new sqlite3.Database("./weather.db", (err)=>{
    if(err){
        console.log(err.message);
    }else{
        console.log("connected to db");
    }
})

router.get("/", function(req, res){
    res.status(200).json(forecasts);
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
    totime = totime.toISOString().substring(0, 10);
    let sql = 'SELECT * FROM forecast where fromtime>=? and totime<=? and name=?';
    db.all(sql, [req.params.date, totime, req.params.city], (err, rows)=>{
        if(err){
            throw err;
        }
        if(rows.length > 0){
            let obj = [];
            let auxdata = [];
            var j = 0;
            for(var i = 0; i < rows.length; i++){
                auxdata.push({"name": rows[i].name, "fromtime": rows[i].fromtime, "totime": rows[i].totime, "auxdata":JSON.parse(rows[i].auxdata)});
                if((i+1) % 4 == 0){
                    var feed = {"name": rows[j].name, "fromtime": rows[j].fromtime, "totime": rows[j].totime, "auxdata":auxdata};
                    obj.push(feed);
                    auxdata = [];
                    j+=4;
                }
            }
            res.status(200).send(obj);
        }else{
            next();
        }
    });
})

//GET Name and code from climatecodes and forecast and info with climatecode and date. VG
router.get("/:code/:date", function(req, res){
    let sql = "select info.name as name, climatecodes.code as code, info.country as country, info.about as about from climatecodes inner join info on info.climatecode=climatecodes.code where code=?";
    console.log(req.params.code);
    db.all(sql, [req.params.code], (err, rows)=>{
        if(err){
            throw err;
        }
        res.status(200).send(rows);
    });
})

//Get last forecast from specific city! Getting last 4 from forecast and adding to array with reverse order.
router.get("/:name", function(req, res, next){
    let sql = "select * from forecast where name=? order by fromtime DESC limit 4";
        db.all(sql, [req.params.name], (err, rows)=>{
            if(err){
                throw err;
            }
            if(rows.length > 0){
                let obj = [];
                let auxdata = [];
                
                for(var i = rows.length-1; i >= 0; i--){
                    auxdata.push({"name": rows[i].name, "fromtime": rows[i].fromtime, "totime": rows[i].totime, "auxdata":JSON.parse(rows[i].auxdata)});
                }
                for(var i = 0; i < 1; i++){
                    var feed = {"name": rows[i].name, "fromtime": rows[i].fromtime, "totime": rows[i].totime, "auxdata":auxdata};
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
    db.all(sql, [], (err, rows)=>{
        if(err){
            throw err;
        }
        let obj = [];
        for(var i = rows.length-1; i >= 0; i--){
            var feed = {"name": rows[i].name, "fromtime": rows[i].fromtime, "totime": rows[i].totime, "auxdata":JSON.parse(rows[i].auxdata)};
            obj.push(feed);
        }
        res.status(200).send(obj);
    });
    
})

module.exports = router;