const express = require('express');
const admin = express.Router();
//const jwt = require('jsonwebtoken');
require("dotenv").config();

const session = require('express-session');//called to create session for admin 
const flash = require('express-flash');
const passport = require('passport'); //for passport authentication
const initializePassport = require('../config/AdminPassportConfig'); //require passport configuration code for admin
const { pool } = require('../config/dbConfig');

initializePassport(passport);  

admin.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}));

admin.use(passport.initialize());
admin.use(passport.session());

admin.use(flash());


admin.get('/', function(req, res) {
    res.json({message: `You are in the admin route. Append '/login' to the URL to login as admin`})
})

// admin.get('/login', checkAuthenticated, function(req, res) {
//     res.render('admin/adminLogin')
// })

admin.get('/dashboard', checkNotAuthenticated, function(req, res) {
    res.render('admin/adminDashboard')
})

admin.get('/logout', function(req, res) {
  req.logOut();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/admin/login');
}) 

// admin.post('/login', passport.authenticate('local', 
// {
//   successRedirect: '/admin/dashboard',
//   failureRedirect: '/admin/login',
//   failureFlash: true
// })
// );

///////////////////////////////////////
// admin.post('/login', function (req, res) {
//   let email = req.body.adEmail
//   let pwd = req.body.pwd
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


  module.exports = admin;