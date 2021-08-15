const express = require('express');
const app = express();
const PORT = process.env.port || 3000;

//const fs = require("fs");

const { pool } = require('./config/dbConfig'); //called to query the database
const bcrypt = require('bcrypt'); //called to hash/encrypt password
const session = require('express-session');//called to create session for user 
const flash = require('express-flash');
const passport = require('passport');
const initializePassport = require('./config/PassportConfig');
//const initializePassportAdmin = require('./config/PassportConfig');


app.use(express.urlencoded({extended: false}));
//ejs middleware
app.set('view engine', 'ejs');

const user = require('./routes/user');
const adminRoute = require('./routes/admin'); //the admin route 
const apiRoute = require('./routes/api'); //the api route 

app.use('/users', user)
app.use('/admin', adminRoute);
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

app.listen(PORT, function () {
  console.log(`Listening on port ${PORT}`);
});