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

const dbConnect = db.getDb();

router.get("/", (req, res)=>{
    dbConnect
    .collection('forecasts')
    .find({
      code:{$regex:/^A.*/}
    })
    .limit(50)
    .toArray(function (err, result) {
      if (err) {
        console.log("Something went wrong with DB call", err)
      } else {
        console.log(result);
      }
    });

})

module.exports = router;