const express = require("express");
const router =  express.Router();
const db = require('./mongo-connection.js');

db.connectToServer(function (err) {
  if (err) {
    console.error(err);
    process.exit();
  }
});

//GET all users username?
router.get("/", function(req, res){
    const dbConnect = db.getDb();
    dbConnect.collection('users')
    .find()
    .toArray(function (err, result) {
        if (err) {
            console.log("Something went wrong with DB call", err)
        } else {
            res.status(200).send(result);
        }
    });
})

//GET specific user of name
router.get("/:name", function(req, res){
    let sql = "select * from user where name=?";
    const dbConnect = db.getDb();
    dbConnect.collection('users')
    .find({['username']: req.params.name}, {projection: {username:1}})
    .toArray(function (err, result) {
        if (err) {
            console.log("Something went wrong with DB call", err)
        } else {
            res.status(200).send(result);
        }
    });
})

//Update specific user
router.put("/:id", express.json(), function(req, res){
    let sql = "update user set username = ?, email = ? where ?";
    const dbConnect = db.getDb();
    var id = parseInt(req.params.id);
    var myquery = {['id']:id};
    var newvalues = { $set: {['username']: req.body.username, ['email']: req.body.email} };
    dbConnect.collection("users").updateOne(myquery, newvalues, function(err, result) {
    if (err) throw err;
        console.log("1 document updated");
        res.status(200).send({msg: result});
  });
})

//POST new user
router.post("/", express.json(), function(req, res){
    let sql = "insert into user(id, username, email) values(?,?,?)";
    const dbConnect = db.getDb();
    var myobj = { ['id']: req.body.id, ['username']: req.body.username, ['email']:req.body.email};
    dbConnect.collection("users").insertOne(myobj, function(err, result) {
        if (err) throw err;
        console.log("1 document inserted");
        res.status(201).send({msg: "OK"});
    })
})

//DELETE specific user of name
router.delete("/:name", function(req, res){
    let sql = "delete from user where username = ?";
    const dbConnect = db.getDb();
    var myobj = { ['username']: req.params.name};
    dbConnect.collection("users").deleteOne(myobj, function(err, result) {
        if (err) throw err;
        console.log("1 document deleted");
        res.status(201).send({msg: result});
    })
})

module.exports = router;