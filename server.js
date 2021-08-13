const express = require('express');
const app = express();
const PORT = process.env.port || 3000;

//const fs = require("fs");

const { pool } = require('./config/dbConfig'); //called to query the database
const bcrypt = require('bcrypt'); //called to hash/encrypt password
const session = require('express-session');//called to create session for user 
const flash = require('express-flash');
const passport = require('passport');
const initializePassport = require('./config/AdminPassportConfig');

app.use(express.urlencoded({extended: false}));
//ejs middleware
app.set('view engine', 'ejs');

const adminRoute = require('./routes/admin'); //the admin route 
app.use('/admin', adminRoute);

const main = require('./routes/main');
app.use('/users', main)



const apiRoute = require('./routes/api'); //the api route 
app.use('/api', apiRoute);



initializePassport(passport);


app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());


app.get('/admin/dashboard', checkNotAuthenticated, function(req, res) {
  res.render('admin/adminDashboard')
})

app.post('/admin/login', passport.authenticate('local', 
 {
   successRedirect: '/admin/dashboard',
   failureRedirect: '/admin/login',
   failureFlash: true
 })
 );


// app.get("/", function (req, res) {
//   res.render("index");
// });

// app.get("/users/signup", checkAuthenticated, function (req, res) {
//   res.render("users/signup");
// });

// app.get("/users/login", checkAuthenticated, function (req, res) {
//   res.render("users/login");
// });

// app.get('/users/dashboard', checkNotAuthenticated, function (req, res) {
//   res.render('users/dashboard', { user: req.user.fname });
// });

// app.get('/users/logout', function(req, res) {
//   req.logOut();
//   req.flash('success_msg', 'You are logged out');
//   res.redirect('/users/login');
// }) 

// app.post("/users/signup", async function (req, res) {
//   let { fname, lname, email, pwd, pwd2 } = req.body;

//   console.log({fname, lname, email, pwd, pwd2});

//   let errors = [];

//   if(!fname || !lname || !email || !pwd || !pwd2) {
//     errors.push({message: "Please enter all fields"})
//   }
//   if(pwd.length < 4) {
//     errors.push({message: "Password length should be at least 4 characters"});
//   }
// if(pwd != pwd2) {
//   errors.push({message: "Passwords do not match"});
// }
// if(errors.length > 0) {
//   res.render('users/signup', { errors })
// }
// else {
//   //validation passed
//   let hashedPassword = await bcrypt.hash(pwd, 10);
//   console.log(hashedPassword);

// pool.query(
//   `SELECT * FROM users WHERE email = $1`, [email], (err, results)  => {
//    if(err) {
//      throw err;
//    }

//   //console.log(results.rows);

//   if (results.rows.length > 0) {
//       errors.push({message: 'Email already registered'});
//       res.render('users/signup', { errors });
//   } else {
//     pool.query(
//       `INSERT INTO users (fname, lname, email, password) 
//       VALUES ($1, $2, $3, $4) RETURNING id, fname, password`, 
//       [fname, lname, email, hashedPassword], (err, results) => {
//         if(err) {
//           throw err;
//         }
//         console.log(results.rows);
//         req.flash('success_msg', 'Sign up successful, please login ');
//         res.redirect('/users/login');
//       }
//     )
//   }
// })


//   }
// });

// app.post('/users/login', passport.authenticate('local', 
// {
//   successRedirect: '/users/dashboard',
//   failureRedirect: '/users/login',
//   failureFlash: true
// })
// );

// app.get('/admin/login', checkAuthenticated, function(req, res) {
//   res.render('admin/adminLogin')
// })

//temp
// app.post('/admin/login', function (req, res) {
//   let email = req.body.adEmail
//   let pwd = req.body.adPwd
//   console.log({email, pwd})
// pool.query(`SELECT * FROM users WHERE email = $1`, [email], (err, results) => {
//   if (err) {
//     throw err
//   }
// if(results.rows[0].password === pwd){
//   console.log(result.rows[0])
// }
// })

// })



function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/users/dashboard");
  }
  next();
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/users/login");
}


app.listen(PORT, function () {
  console.log(`Listening on port ${PORT}`);
});