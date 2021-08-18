const express = require('express');
const app = express();
const PORT = process.env.port || 3000;
//const { pool } = require('./config/dbConfig'); //called to query the database
//const bcrypt = require('bcrypt'); //called to hash/encrypt password
const session = require('express-session');//called to create session for user 
const flash = require('express-flash');//called to flash error or success messages
const passport = require('passport');
const initializePassport = require('./config/PassportConfig');
require("dotenv").config(); //use a an environment variiable (from the '.env' file)


app.use(express.urlencoded({extended: false}));

//ejs middleware
app.set('view engine', 'ejs');
//app.use(express.static(__dirname + '/public/uploads/'))
app.use(express.static(__dirname + '/public/'))//


const user = require('./routes/user');
const adminRoute = require('./routes/admin'); //the admin route 
const apiRoute = require('./routes/api'); //the api route 

//call the various routes
app.use('/users', user)
app.use('/admin', adminRoute);
app.use('/api', apiRoute);

initializePassport(passport);

//create sessions for users
app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: false
})); 

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.listen(PORT, function () {
  console.log(`Listening on port ${PORT}`);
});