const express = require('express'); //use express library
const app = express(); //instance of express
const session = require('express-session');//called to create session for user 
//const flash = require('express-flash');//called to flash error or success messages
const passport = require('passport');
const initializePassport = require('./config/PassportConfig');
require("dotenv").config(); //use a an environment variiable (from the '.env' file)
const PORT = process.env.PORT || 3000;
const HOST = process.env.DB_HOST || '0.0.0.0';

app.use(express.urlencoded({extended: true}));//use qs library(querystring with added security) to parse data

//ejs middleware
app.set('view engine', 'ejs');

//use files from this directory (css, logos, etc.)
app.use(express.static(__dirname + '/public/'))


const user = require('./routes/user');//calling the user
const adminRoute = require('./routes/admin'); //calling the admin route 
const apiRoute = require('./routes/api'); //calling the api route 

//Setup the various routes
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

//use the passport middleware for authentication
app.use(passport.initialize());

//use the session middleware to create session
app.use(passport.session());

//app.use(flash());

app.listen(PORT, HOST, function () {
  console.log(`Listening on port ${PORT}`);
});