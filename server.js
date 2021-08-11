const express = require('express');
const app = express();
const PORT = process.env.port || 3000;

const fs = require("fs");
const { pool } = require('./config/dbConfig');
const bcrypt = require('bcrypt');
const session = require('express-session');
const flash = require('express-flash');

app.use(express.urlencoded({extended: false}));
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}));

app.use(flash());

//ejs middleware
app.set('view engine', 'ejs')

//import authentication route
const authRoute = require('./routes/auth')

//route middleware
app.use('/api/user', authRoute);

app.get("/", function (req, res) {
  res.render("index");
});

app.get("/users/signup", function (req, res) {
  res.render("signup");
});

app.get("/users/login", function (req, res) {
  res.render("login");
});

app.get("/users/dashboard", function (req, res) {
  res.render("dashboard", { user: 'Phil' });
});

app.post("/users/signup", async function (req, res) {
  let { fname, lname, email, pwd, pwd2 } = req.body;

  console.log({fname, lname, email, pwd, pwd2});

  let errors = [];

  if(!fname || !lname || !email || !pwd || !pwd2) {
    errors.push({message: "Please enter all fields"})
  }
  if(pwd.length < 4) {
    errors.push({message: "Password length should be at least 4 characters"});
  }
if(pwd != pwd2) {
  errors.push({message: "Passwords do not match"});
}
if(errors.length > 0) {
  res.render('signup', { errors })
}
else {
  //validation passed
  let hashedPassword = await bcrypt.hash(pwd, 10);
  console.log(hashedPassword);

pool.query(
  `SELECT * FROM users 
  WHERE email = $1`, 
  [email], 
  (err, results)  => {
   if(err) {
     throw err;
   }

  //console.log(results.rows);

  if (results.rows.length > 0) {
      errors.push({message: 'Email already registered'});
      res.render('signup', { errors });
  } else {
    pool.query(
      `INSERT INTO users (fname, lname, email, password) 
      VALUES ($1, $2, $3, $4) RETURNING id, fname, password`, 
      [fname, lname, email, hashedPassword], (err, results) => {
        if(err) {
          throw err;
        }
        console.log(results.rows);
        req.flash('success_msg', 'Sign up successful, please login ');
        res.redirect('/users/login');
      }
    )
  }
});


}



});


//video upload
 app.get("/", function (req, res) {  
  res.sendFile(__dirname + "index");
});


app.get("/video", function (req, res) {
    // Ensure there is a range given for the video
    const range = req.headers.range;
    if (!range) {
      res.status(400).send("Requires Range header");
    }

 // get video stats
 const videoPath = "assets/rollies-and-cigars.mp4";
 const videoSize = fs.statSync(videoPath).size;

 const chunkSize = 10 ** 6; // 1MB
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + chunkSize, videoSize - 1);

// Create headers
const contentLength = end - start + 1;
const headers = {
  "Content-Range": `bytes ${start}-${end}/${videoSize}`,
  "Accept-Ranges": "bytes",
  "Content-Length": contentLength,
  "Content-Type": "video/mp4",
};

// HTTP Status 206 for Partial Content
res.writeHead(206, headers);

// create video read stream for this particular chunk
const videoStream = fs.createReadStream(videoPath, { start, end });

// Stream the video chunk to the client
videoStream.pipe(res);

}); 

app.listen(PORT, function () {
  console.log(`Listening on port ${PORT}`);
});