var sqlite3 = require('sqlite3').verbose();
const express = require("express");
const router =  express.Router();

let db = new sqlite3.Database("./weather.db", (err)=>{
    if(err){
        console.log(err.message);
    }else{
        console.log("connected to db");
    }
})

router.get("/", (req, res)=>{
    let sql = "select * from climatecodes";
    db.all(sql, [], (err, rows)=>{
        if(err){
            throw err;
        }
        res.send(rows);
    });
})

module.exports = router;