const express = require("express");
const mysql = require("mysql");
const ejs = require("ejs");
const bodyParser = require("body-parser");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

const connection = mysql.createConnection({
  host: "localhost",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
connection.connect();
//---------------------------------------------------
//---------------------------------------------------
// CONSTANTS
let LOGGEDIN = false;
let USERID;
//---------------------------------------------------

// ROUTES HANDLING

app.get("/", (req, res) => {
  connection.query(
    "SELECT * FROM users INNER JOIN posts ON users.uid = posts.uid",
    (err, data) => {
      if (err) throw err;
      res.render("index", {
        postsData: data,
      });
    }
  );
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.post("/signup", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const confirmPassword = req.body.cpassword;
  if (password === confirmPassword) {
    connection.query(
      `INSERT INTO users(uname, password) VALUES('${username}', '${password}')`,
      (err, data) => {
        if (err) {
          res.send("Signup Failed! " + err.sqlMessage);
          return;
        }
        res.send(
          "signup successfull\n Now you can login <a href='/login'>Login</a>"
        );
      }
    );
  } else {
    console.log("password should match!");
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});
app.post("/login", (req, res) => {
  const uname = req.body.uname;
  const pass = req.body.pass;
  connection.query(
    `SELECT * FROM users WHERE uname='${uname}' AND password='${pass}'`,
    (err, data) => {
      if (err) throw err;
      if (data.length > 0) {
        LOGGEDIN = true;
        USERID = data[0].uid;
        res.redirect("/compose");
      } else {
        res.send("Invalid Credentials!");
      }
    }
  );
});

app.get("/compose", (req, res) => {
  if (!LOGGEDIN) {
    res.redirect("/login");
  } else {
    res.render("compose");
  }
});
app.post("/compose", (req, res) => {
  const title = req.body.title;
  const body = req.body.body;
  connection.query(
    `INSERT INTO posts(title, body, uid) VALUES('${title}','${body}', '${USERID}')`,
    (err, data) => {
      if (err) throw err;
      console.log("successfully posted!");
      res.redirect("/");
    }
  );
});

app.get("/post/:pid", (req, res) => {
  connection.query(
    `SELECT * FROM posts WHERE pid='${req.params.pid}'`,
    (err, data) => {
      if (err) throw err;
      console.log(data);
      res.render("post", {
        postData: data,
      });
    }
  );
});
//---------------------------------------------------
app.listen(3000, () => {
  console.log("server is up and running");
});
