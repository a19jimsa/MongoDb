const express = require("express");
const router =  express.Router();
var sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database("./weather.db", (err)=>{
    if(err){
        console.log(err.message);
    }else{
        console.log("Connected to db");
    }
})

//GET all comments
router.get("/", (req, res)=>{
    let sql = "select * from comment";
    db.all(sql, [], (err, rows)=>{
        if(err){
            throw err;
        }
        res.send(rows);
    });
})

//GET all comments on a city
router.get("/:location", function(req, res){
    //var citycomments = comments.filter(comment=>comment.location==req.params.location).reverse();
    if(req.query.id == "null"){
        //citycomments = citycomments.filter(comment=>comment.replyto==req.query.id);
        let sql = "select * from comment where location=? and replyto IS NULL";
        db.all(sql, [req.params.location], (err, rows)=>{
        if(err){
            throw err;
        }
        res.status(200).send(rows);
        });
    }else if(req.query.id){
        let sql = "select * from comment where location=? and replyto=?";
        db.all(sql, [req.params.location,req.query.id], (err, rows)=>{
        if(err){
            throw err;
        }
        res.status(200).send(rows);
        });
    }else{
        let sql = "select * from comment where location=? Order by id DESC";
        db.all(sql, [req.params.location], (err, rows)=>{
        if(err){
            throw err;
        }
        res.status(200).send(rows);
        });
    }
})

//GET specific comment on specific location
router.get("/:location/comment/:id", function(req, res){
    let sql = "select * from comment where location=? and id=?";
    db.all(sql, [req.params.location, req.params.id], (err, rows)=>{
        if(err){
            throw err;
        }
        res.status(200).send(rows);
    });
})

//PUT change specific comment
router.put("/:location/comment/:id", express.json(), function(req, res){
    let sql = "update comment set content=? where location=? and id=?";
    db.all(sql, [req.body.content, req.params.location, req.params.id], (err, rows)=>{
        if(err){
            throw err;
        }
        res.status(200).send(rows);
    });
})

//POST Add comment to specific city
router.post("/:location", express.json(), function(req, res){
    let sql = "insert into comment(id, location, replyto, author, content, posted) values(?,?,?,?,?,?)";
    db.run(sql, [req.body.id, req.body.location, req.body.replyto, req.body.author, req.body.content, req.body.posted], (err, rows)=>{
        if(err){
            throw err;
        }
        res.status(201).send({msg: "Created comment"+rows});
        console.log("Skapade kommentar");
    });
})

// POST Add answer on specific comment on a city
router.post("/:location/comment/:commentid", express.json(), function(req, res){
    let sql = "insert into comment(id, location, replyto, author, content, posted) values(?,?,?,?,?,?)";
    db.run(sql, [req.body.id, req.body.location, req.body.replyto, req.body.author, req.body.content, req.body.posted], (err, rows)=>{
        if(err){
            throw err;
        }
        res.status(201).send({msg: "Created comment"+rows});
        console.log("Skapade svar");
    });
})

//DELETE remove comment from specific city
router.delete("/:commentid", express.json(), function(req, res){
    let sql = "delete from comment where id=?";
    db.all(sql, [req.params.commentid], (err, rows)=>{
        if(err){
            throw err;
        }
        res.status(200).send(rows);
    });
})

module.exports = router;