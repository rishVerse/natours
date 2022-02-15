const express = require("express");
const bodyParser = require("body-parser");
const md5 = require("md5");
const mongoose = require("mongoose");
const ejs = require("ejs");
const dotenv = require("dotenv");
const app = express();

dotenv.config();


app.set("view engine", "ejs");
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(express.static("files"));

var bool = true;

var conn = mongoose.createConnection(
  process.env.MONGO_URL_users
);

//Presentation Purpose
var conn2 = mongoose.createConnection(
  process.env.MONGO_URL_admin
);



// stored in 'testA' database
var Customer = conn.model(
  "Customer",
  new mongoose.Schema({
    name: String,
    email: String,
    group: String,
    avatar: Number,
  })
);

var Admin = conn2.model(
  "Admin",
  new mongoose.Schema({
    name: String,
    password: String,
  })
);

// const Admin = mongoose.model("Admin", adminSchema);

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/login", function (req, res) {
  res.sendFile(__dirname + "/login.html");
});

app.post("/login", function (req, res) {
  var txt = String(req.body.name);
  var pwd = md5(String(req.body.pwd));
  Admin.find(function (err, admin) {
    if (err) {
      console.log(err);
    } else {
      // console.log(admin[0].name);
      if (
        admin[admin.length - 1].name == txt &&
        admin[admin.length - 1].password == pwd
      ) {
        bool = true;
        res.redirect("destination");
      } else {
        res.sendFile(__dirname + "/err.html");
      }
    }
  });
  // console.log(pwd);
  // console.log(realPwd);
});

app.get("/destination", function (req, res) {
  if (bool === true) {
    // res.sendFile(__dirname + "/Files/destination.html");
    Customer.find(function (err, posts) {
      if (err) {
        console.log(err);
      } else {
        res.render("destination", { posts: posts });
      }
    });
  } else {
    res.redirect("/login");
  }
});

app.get("/admin", function (req, res) {
  if (bool === true) {
    res.sendFile(__dirname + "/signup.html");
  } else {
    res.redirect("/login");
  }
});

app.post("/admin", function (req, res) {
  var name = String(req.body.name);
  var pwd = md5(String(req.body.pwd));

  const admin = new Admin({
    name: name,
    password: pwd,
  });

  admin.save();

  //Testing Purpose
  // console.log(name);
  // console.log(email);
  // console.log(size);
  bool = false;
  res.redirect("/");
});

app.post("/customer", function (req, res) {
  const name = String(req.body.name);
  const email = req.body.email;
  const size = String(req.body.size);

  // Between 1 and max

  const num = Math.floor(Math.random() * 15) + 1;
  const customer = new Customer({
    name: name,
    email: email,
    group: size,
    avatar: num,
  });

  customer.save(function (err) {
    if (!err) {
      res.redirect("/");
    } else {
      res.sendFile(__dirname + "/err.html");
    }
  });

  //Testing Purpose
  // console.log(name);
  // console.log(email);
  // console.log(size);
});

app.post("/logout", function (req, res) {
  bool = false;
  res.redirect("/");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log("Rishabh's server up and running at 3000");
});
