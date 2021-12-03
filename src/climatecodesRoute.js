const express = require("express");
const router =  express.Router();
const db = require('./mongo-connection.js');

db.connectToServer(function (err) {
  if (err) {
    console.error(err);
    process.exit();
  }

  // Do stuff ... for example
  // start the Express server
});

router.get("/", (req, res)=>{
  const dbConnect = db.getDb();
  dbConnect.collection('climatecodes')
  .find()
  .toArray(function (err, result) {
    if (err) {
      console.log("Something went wrong with DB call", err)
    } else {
      res.status(200).send(result);
    }
  });
})

module.exports = router;