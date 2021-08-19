const express = require('express'); //use express library
const app = express(); //instance of express
const session = require('express-session');//called to create session for user 
//const flash = require('express-flash');//called to flash error or success messages
const passport = require('passport');

const initializePassport = require('./config/PassportConfig');
const pg = require('pg');
const pgSession = require('connect-pg-simple')(session);


require("dotenv").config(); //use a an environment variiable (from the '.env' file)
const { pool } = require('./config/dbConfig');


const port = process.env.PORT || 5000;
const HOST = '0.0.0.0' || process.env.DB_HOST;

app.use(express.urlencoded({extended: true}));//use qs library(querystring with added security) to parse data

//ejs middleware
app.set('view engine', 'ejs');

//use files from this directory (css, logos, etc.)
app.use(express.static(__dirname + '/public/'))


const user = require('./routes/user');//calling the user
const adminRoute = require('./routes/admin'); //calling the admin route 
const apiRoute = require('./routes/api'); //calling the api route 
//const { pool } = require('./config/dbConfig');

//Setup the various routes
app.use('/users', user)
app.use('/admin', adminRoute);
app.use('/api', apiRoute);

initializePassport(passport);

//create sessions for users
app.set('trust proxy', 1)//unleaks memory


app.use(session({
  cookie:{
    secure:true,
    maxAge:60000
  },
  secret: process.env.SESSION_SECRET,
  store: new pgSession({
    pool : pool,                
    tableName : 'user_session'   
  }),
  resave: false,
  saveUninitialized: true
})); 

app.use(function(req,res,next){
  if(!req.session){
      return next(new Error('Oh no')) //handle error
  }
  next()
})

//use the passport middleware for authentication
app.use(passport.initialize());

//use the session middleware to create session
//app.use(passport.session());

//app.use(flash());

app.listen(port, HOST, function () {
  console.log('Listening on port ' + port + ' at host '+ HOST);
});