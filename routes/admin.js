const express = require('express');
const admin = express.Router();
const session = require('express-session');//called to create session for admin 
const flash = require('express-flash');
const passport2 = require('passport'); //for passport authentication
const initializePassport = require('../config/AdminPassportConfig'); //require passport configuration code for admin
//const { pool } = require('../config/dbConfig');

initializePassport(passport2);  

admin.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}));

admin.use(passport2.initialize());
admin.use(passport2.session());

admin.use(flash());


admin.get('/', function(req, res) {
    res.json({message: `You are in the admin route. Append '/login' to the URL to login as admin`})
})

 admin.get('/login', checkAuthenticated, function(req, res) {
     res.render('admin/adminLogin')
 })

//admin.get('/dashboard', checkNotAuthenticated, function(req, res) {
  //  res.render('admin/adminDashboard')
//})

admin.get('/logout', function(req, res) {
  req.logOut();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/admin/login');
}) 

//  admin.post('/login', passport2.authenticate('local', 
//  {
//    successRedirect: '/admin/dashboard',
//    failureRedirect: '/admin/login',
//    failureFlash: true
//  })
//  );


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