const express = require('express');
const router = express.Router();

const { pool } = require('../config/dbConfig'); //called to query the database
const bcrypt = require('bcrypt'); //called to hash/encrypt password
const session = require('express-session');//called to create session for user 
const flash = require('express-flash');
const passport = require('passport');
const initializePassport = require('../config/UserPassportConfig');

initializePassport(passport);

router.use(express.urlencoded({extended: false}));
router.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}));

router.use(passport.initialize());
router.use(passport.session());

router.use(flash());

router.get("/", function (req, res) {
    res.render("index");
  });
  
  router.get("/signup", checkAuthenticated, function (req, res) {
    res.render("users/signup");
  });
  
  router.get("/login", checkAuthenticated, function (req, res) {
    res.render("users/login");
  });
  
  router.get('/dashboard', checkNotAuthenticated, function (req, res) {
    res.render('users/dashboard', { user: req.user.fname });
  });
  
  router.get('/logout', function(req, res) {
    req.logOut();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
  }) 

//USER SIGNUP
  router.post("/signup", async function (req, res) {
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
    res.render('users/signup', { errors })
  }

  else {
    //validation passed
    let hashedPassword = await bcrypt.hash(pwd, 10);
    console.log(hashedPassword);
  
  pool.query(
    `SELECT * FROM users WHERE email = $1`, [email], (err, results)  => {
     if(err) {
       throw err;
     }
  
    if (results.rows.length > 0) {
        errors.push({message: 'Email already registered'});
        res.render('users/signup', { errors });
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
  })
  
  
        }
  });

//User Login
  router.post('/login', passport.authenticate('local', 
{
  successRedirect: '/users/dashboard',
  failureRedirect: '/users/login',
  failureFlash: true
})
);





  function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect("/admin/dashboard");
    }
    next();
  }
  
  function checkNotAuthenticated(req, res, next) {
      if (req.isAuthenticated()) {
        return next();
      }
      res.redirect("/admin/login");
    }

  module.exports = router;