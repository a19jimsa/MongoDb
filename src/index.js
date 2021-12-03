const { application } = require("express");
const express = require("express");

const app = express();

app.use('/', express.static('src'))
app.use('/components', express.static('components'))

const usersRoute = require("./usersRoute")
app.use("/users", usersRoute)

const climatecodesRoute = require("./climatecodesRoute")
app.use("/climatecodes", climatecodesRoute)

const commentsRoute = require("./commentsRoute")
app.use("/comments", commentsRoute);

const forecastRoute = require("./forecastRoute")
app.use("/forecast", forecastRoute);

//Hämtar ut startup.html när localhost:3000 körs.
app.get('/', function(req, res){
    res.sendFile('src/startup.html',{root: '.'})
    console.log("Start");
})

app.listen(3000, function (){
    console.log("Server started")
})
