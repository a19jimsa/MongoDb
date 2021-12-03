var sqlite3 = require('sqlite3').verbose();
const express = require("express");
const router =  express.Router();

let db = new sqlite3.Database("./weather.db", (err)=>{
    if(err){
        console.log(err.message);
    }else{
        console.log("Connected to db");
    }
})

router.get("/", function(req, res){
    let sql = "select * from user";
    db.all(sql, [], (err, rows)=>{
        if(err){
            throw err;
        }
        res.status(200).send(rows);
    });
})

//GET specific user of name
router.get("/:name", function(req, res){
    let sql = "select * from user where name=?";
    db.all(sql, [req.param.name], (err, rows)=>{
        if(err){
            throw err;
        }
        res.status(200).send(rows);
    });
})

//Update specific user
router.put("/:id", express.json(), function(req, res){
    let sql = "update user set username = ?, email = ? where ?";
    db.all(sql, [req.body.username, req.body.email, req.params.id], (err, rows)=>{
        if(err){
            throw err;
        }
        res.status(200).send(rows);
    });
})

//POST new user
router.post("/", express.json(), function(req, res){
    let sql = "insert into user(id, username, email) values(?,?,?)";
    db.run(sql, [req.body.id, req.body.username, req.body.email], (err, rows)=>{
        if(err){
            throw err;
        }
        res.status(201).send({msg: "Created comment"+rows});
        console.log("Skapade användare");
    });
})

//DELETE specific user of name
router.delete("/:name", function(req, res){
    let sql = "delete from user where username = ?";
    db.all(sql, [req.params.name], (err, rows)=>{
        if(err){
            throw err;
        }
        res.status(200).send(rows);
    });
})

module.exports = router;