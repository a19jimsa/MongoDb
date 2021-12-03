const { parse } = require("dotenv");
const express = require("express");
const router =  express.Router();
const db = require('./mongo-connection.js');

db.connectToServer(function (err) {
  if (err) {
    console.error(err);
    process.exit();
  }
});



//GET all comments
router.get("/", (req, res)=>{
    const dbConnect = db.getDb();
    dbConnect.collection('comments')
    .find()
    .toArray(function (err, result) {
        if (err) {
        console.log("Something went wrong with DB call", err)
        } else {
        res.status(200).send(result);
        }
  });
})

//GET all comments on a city
router.get("/:location", function(req, res){
    const dbConnect = db.getDb();
    //var citycomments = comments.filter(comment=>comment.location==req.params.location).reverse();
    if(req.query.id == "null"){
        dbConnect.collection('comments')
            .find({['replyto']: null, ['location']: req.params.location})
            .toArray(function (err, result) {
                if (err) {
                console.log("Something went wrong with DB call", err)
                } else {
                res.status(200).send(result);
            }
        });
    }else if(req.query.id){
        let sql = "select * from comment where location=? and replyto=?";
        var id = parseInt(req.query.id);
        dbConnect.collection('comments')
            .find({['replyto']: id, ['location']: req.params.location})
            .toArray(function (err, result) {
                if (err) {
                console.log("Something went wrong with DB call", err)
                } else {
                res.status(200).send(result);
            }
        });
    }else{
        let sql = "select * from comment where location=? Order by id DESC";
        var value = req.params.location;
        dbConnect.collection('comments')
            .find({['location']:value})
            .sort({id:-1})
            .toArray(function (err, result) {
                if (err) {
                console.log("Something went wrong with DB call", err)
                } else {
                res.status(200).send(result);
            }
        });
    }
})

//GET specific comment on specific location
router.get("/:location/comment/:id", function(req, res){
    const dbConnect = db.getDb();
    let sql = "select * from comment where location=? and id=?";
    var id = parseInt(req.params.id);
    dbConnect.collection('comments')
        .findOne({['location']:req.params.location, ['id']:id})
        .toArray(function (err, result) {
            if (err) {
            console.log("Something went wrong with DB call", err)
            } else {
            res.status(200).send(result);
        }
    });
})

//PUT change specific comment
router.put("/:location/comment/:id", express.json(), function(req, res){
    const dbConnect = db.getDb();
    let sql = "update comment set content=? where location=? and id=?";
    var id = parseInt(req.params.id);
    var myquery = {['id']:id};
    var newvalues = { $set: {['content']: req.body.content} };
    dbConnect.collection("comments").updateOne(myquery, newvalues, function(err, result) {
    if (err) throw err;
        console.log("1 document updated");
        res.status(200).send({msg: "OK"});
  });
})

//POST Add comment to specific city
router.post("/:location", express.json(), function(req, res){
    let sql = "insert into comment(id, location, replyto, author, content, posted) values(?,?,?,?,?,?)";
    const dbConnect = db.getDb();
    var id = parseInt(req.body.id);
    var replyto;
    if(req.body.replyto != null){
        replyto = parseInt(req.body.replyto);
    }else{
        replyto = req.body.replyto;
    }
    var author = parseInt(req.body.author);
    var myobj = { ['id']: id, ['location']: req.body.location, ['replyto']:replyto, ['author']:author, ['content']:req.body.content, ['posted']:req.body.posted };
    dbConnect.collection("comments").insertOne(myobj, function(err, result) {
        if (err) throw err;
        console.log("1 document inserted");
        res.status(201).send({msg: "OK"});
    })
})

// POST Add answer on specific comment on a city
router.post("/:location/comment/:commentid", express.json(), function(req, res){
    let sql = "insert into comment(id, location, replyto, author, content, posted) values(?,?,?,?,?,?)";
    const dbConnect = db.getDb();
    var id = parseInt(req.body.id);
    var replyto;
    if(req.body.replyto != null){
        replyto = parseInt(req.body.replyto);
    }else{
        replyto = req.body.replyto;
    }
    var author = parseInt(req.body.author);
    var myobj = { ['id']: id, ['location']: req.body.location, ['replyto']:replyto, ['author']:author, ['content']:req.body.content, ['posted']:req.body.posted };
    dbConnect.collection("comments").insertOne(myobj, function(err, result) {
        if (err) throw err;
        console.log("1 document inserted");
        res.status(201).send({msg: "OK"});
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