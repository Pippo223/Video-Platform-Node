const express = require('express');
const user = express.Router();

const { pool } = require('../config/dbConfig'); //called to query the database
const bcrypt = require('bcrypt'); //called to hash/encrypt password
const session = require('express-session');//called to create session for user 
const flash = require('express-flash'); //called to flash error or success messages
const passport = require('passport'); //For authentication of credentials
const initializePassport = require('../config/PassportConfig'); //the passport configuration file
require("dotenv").config(); //use a an environment variiable (from the '.env' file)
const pgSession = require('connect-pg-simple')(session);

//user.use(express.static(__dirname + '/public/'))

initializePassport(passport);

user.use(express.urlencoded({extended: true}));

//create sessions for users
//user.set('trust proxy', 1)//unleaks memory
 user.use(session({
   cookie:{
    secure:true,
    maxAge:60000
   },
  secret: process.env.SESSION_SECRET || 'secret',
  store: new pgSession({
    pool : pool,                
    tableName : 'user_session'   
  }),
  resave: false,
  saveUninitialized: true
})); 

user.use(passport.initialize());
//user.use(passport.session());

user.use(flash());

let name = ''; //A login name will be passed to it
let counter = 1;//videos will start playing from the first 

//get index page
user.get("/", function (req, res) {
    res.render("index");
  });
  
  //get signup page
  user.get("/signup", checkAuthenticated, function (req, res) {
    res.render("users/signup");
  });
  
  //get login page
  user.get("/login", checkAuthenticated, function (req, res) {
    res.render("users/login");
  });
  
  //get user dashboard
  user.get('/dashboard', checkNotAuthenticated, async function (req, res) {
    
    console.log(name)
    
     try{
     let data = await pool.query(`SELECT * FROM videos WHERE id = $1`, [counter])
     data = data.rows
     let count = await pool.query(`SELECT * FROM videos`)
     count = count.rows
     res.render('users/dashboard', { user: name, files: data, count: count, counter: counter  } );
      
     }

     catch(err) {
       console.log(err)
     }
  });

  //increment of counter value goes to this route to be used
  user.post('/increment', async(req,res)=>{
    counter++;    
    console.log(counter)
     try{
        let data = await pool.query(`SELECT * FROM videos WHERE id = $1`, [counter])
        data = data.rows;
        let count = await pool.query(`SELECT * FROM videos`)
        count = count.rows
        
        res.render('users/dashboard', { user: name, files: data, count: count, counter: counter } );
      }

     catch(err) {
       console.log(err)
     }
  
  })

   //decrement of counter value goes to this route to be used
  user.post('/decrement', async(req,res)=>{
    counter--
    console.log("prev"+counter)
    try{
      let data = await pool.query(`SELECT * FROM videos WHERE id = $1`, [counter])
        data = data.rows;
        let count = await pool.query(`SELECT * FROM videos`)
        count = count.rows
        
        res.render('users/dashboard', { user: name, files: data, count: count, counter: counter } );
    }

    catch(err) {
      console.log(err)
    }

  })

  // logout route
  user.get('/logout', function(req, res) {
    req.logOut();
    req.flash('success_msg', 'You are logged out');
    res.redirect('login');
  }) 

//USER SIGNUP
  user.post("/signup", async function (req, res) {
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
          res.redirect('login');
        }
      )
    }
  })
  
  
        }
  });

//User Login
  user.post('/login', passport.authenticate('local', {failureRedirect: 'login', failureFlash: true}), 
  async (req, res) => {
 
  const {email} = req.body
  
  let data = await pool.query(`SELECT * FROM users WHERE email = $1`, [email])
  try {
    if(data.rows[0].roles === null || data.rows[0].roles === 'admin')
    {
      console.log(data.rows)
      name = data.rows[0].fname
      return res.redirect('/dashboard')
    }
      
  
  }
  catch (err) {
    console.log(err)
  }

})


//For route protection
  function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('dashboard');
    }
    next();
  }
  
  function checkNotAuthenticated(req, res, next) {
      if (req.isAuthenticated()) {
        next()
        return
      }
      else {
      res.redirect('login');
    }
  }

  module.exports = user;