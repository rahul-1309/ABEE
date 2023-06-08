const express = require("express");

const router = express();

// importing body parser
router.use(express.urlencoded({extended:true}));
router.use(express.json());

router.use(express.static("views"));

// importing multer

const multer = require("multer");

//======method to define storage
const mstorage = multer.diskStorage({
    // specify path of file
     destination:(req,file,cb)=>{
         // cb(error,valueofdestination)
         cb(null,"views/files");
 
     },
     // specify name of file
     filename:(req,file,cb)=>{
         console.log(file);
         const ext=file.mimetype.split("/")[1];
         // cb(error,nameoffile)
         //cb(null,"test."+ext);
         console.log("Session created for "+req.session.username);
         cb(null,req.session.username+"."+ext);
     },
 
 })

 // define filter on file stored
const filter =  (req,file,cb)=>{
    const ext = file.mimetype.split("/")[1];
    if(ext=="png")
    {
        // true means to upload file
        cb(null,true);
    }else{
        // false mean not to upload file
        cb(new Error("file not supported"),false);
    }
}

const upload = multer({
    storage:mstorage,
    fileFilter:filter
})

// session

const cookieparser = require("cookie-parser");
const session = require("express-session");

router.use(session({
    secret:"mySecret",
    saveUninitialized:true,
    resave:false,
    cookie:{maxAge:3000000}
}))


// mongoose
const mongoose = require("mongoose");

// mongoose model
const userModel = require("../models/userModel");
const Users = require("../models/userModel");


// your mongodb atlas link
const url =
  "mongodb+srv://rahul1238be20:f1Y7NrA9QCwqWtoY@cluster0.qp9rham.mongodb.net/";

// to specify your database name
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "Authentication" // Specify the database name
  };

mongoose
  .connect(url,options)
  .then((database) => {
    console.log("Connected to database");
  })
  .catch((err) => {
    console.log("Error in connecting to database " + err);
  });


// function to add user

async function insert(obj) {
    let response = await new Users(obj);
    response.save().
    then((res)=>{
        console.log(res);
        console.log("Saved successfully")
    }).catch((err)=>{
        console.log("Error in saving data "+err);
    })
    
}


// function to find is user exist or not
async function check(obj,res){
    Users.findOne({username:obj.username}).
    then((user)=>{
        
        if(user==null)
        {
            insert(obj);
            res.render("home",{msg:"User created"})
        }else{
            console.log("User exist "+user+" username = "+obj.username);
            res.render("signup",{msg:"User exist"});
        }
    }).catch((err)=>{
        console.log("User not exist");
        
        res.render("signup",{msg:"Error"});
    })
}

// finding user
async function search(obj,res,req){
     console.log("Searching..");
    Users.find({username:obj.username,pwd:obj.pwd}).
    then((user)=>{
        if(user==null)
        {
            res.render("login",{msg:"User do not exist"})
        }else{
            console.log(typeof(user)+" user = "+user);
            req.session.username = obj.username;
            res.render("home",{msg:"Login Successfull"});
        }
    }).catch((err)=>{
        console.log("User not exist");
        res.render("login",{msg:"Error"});
    })
}

//======== function to remove user

async function remove(obj,res){
    Users.deleteOne({username:obj.username,pwd:obj.pwd})
  .then(() => {
    console.log('User deleted successfully');
    res.render("home",{msg:"User deleted successfully"})
  })
  .catch((error) => {
    console.error('Error deleting user:', error);
    res.render("delete",{msg:"Error in deleting user"})
  });
}


//======== function to update user

async function update(obj,res){
    Users.updateOne({username:obj.username,pwd:obj.pwd})
  .then(() => {
    console.log('User updated successfully');
    res.render("home",{msg:"User updated successfully"})
  })
  .catch((error) => {
    console.error('Error deleting user:', error);
    res.render("update",{msg:"Error in updating user"})
  });
}

//======== function to find all user

async function userlist(res){
    const arr = [];
    const data = await Users.find()
  .then((res)=>{
    console.log("res "+res);
    arr.push(res);
    console.log(arr);
  })
  .catch((error) => {
    console.error('Error retrieving users:', error);
  });
  res.render("users",{array:arr});
}


// ------------------------------------------------------------------------------

router.get("/login",(req,res)=>{
    res.render("login",{msg:""});
})

router.get("/signup",(req,res)=>{
    res.render("signup",{msg:""});
})

router.get("/dashboard",(req,res)=>{
    if(req.session.username==null)
    {
        res.render("home",{msg:"User is not logged in"})
    }else{
        const name = req.session.username;
        const path = "files/"+""+name+""+".png";
        console.log("name = "+name+" path = "+path);
        res.render("dashboard",{admin:name,imagepath:path});
    }
})

// -------------upload

router.get("/upload",(req,res)=>{
    res.render("upload");
})

// ============= logout

router.get("/logout",(req,res)=>{
    req.session.destroy();
    res.render("home",{msg:"Session destroyed"});
})

//============== delete user

router.get("/delete",(req,res)=>{
    res.render("delete",{msg:""});
})

//============== update user

router.get("/update",(req,res)=>{
    res.render("update",{msg:""});
})

//============== get all user

router.get("/users",(req,res)=>{
    userlist(res);
})


//=========================================================================================================

router.post("/signup",(req,res)=>{
    let obj = {};
    obj.username = req.body.username;
    obj.pwd  = req.body.pwd;
    console.log(obj);
    check(obj,res);

})


router.post("/login",(req,res)=>{
    let obj = {};
    obj.username = req.body.username;
    obj.pwd  = req.body.pwd;
    console.log(obj);
    search(obj,res,req);
})


//============= pic upload


router.post("/uploadfile",upload.single("pic"),(req,res)=>{
    const name = req.session.username;
    const path = "files/"+""+name+""+".png";
    console.log("name = "+name+" path = "+path);
    res.render("dashboard",{admin:name,imagepath:path});
})

// =========== delete method

router.post("/delete",(req,res)=>{
    let obj = {};
    obj.username = req.body.username;
    obj.pwd  = req.body.pwd;
    console.log(obj);
    remove(obj,res);
})

// =========== update method

router.post("/update",(req,res)=>{
    let obj = {};
    obj.username = req.body.username;
    obj.pwd  = req.body.pwd;
    console.log(obj);
    update(obj,res);
})



module.exports = router;