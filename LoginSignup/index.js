const express = require("express");

const port = 3000;

const app = express();

// importing body parser
app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.set("view engine","ejs");

const route = require("./routes/route");

app.use(route);

app.use(express.static("views"));

app.get("/",(req,res)=>{
    res.render("home",{msg:""});
})

app.listen(port,(err)=>{
    if(err){
        console.log("Error in starting server"+err);
    }else{
        console.log("Server started successfully");
    }
})