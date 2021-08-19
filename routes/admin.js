const express = require('express');
const admin = express.Router();
const session = require('express-session');//called to create session for admin 
const flash = require('express-flash');
const passport = require('passport'); //for passport authentication
const { pool } = require('../config/dbConfig');
require('dotenv').config();
const multer  = require('multer') //require multer library for file uploads
const pgSession = require('connect-pg-simple')(session);

//Multer configuration
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads');
  },

  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `/${file.fieldname}-${Date.now()}.${ext}`);
  }

})

//Multer Filter
const multerFilter = (req, file, cb) => {
  if (file.mimetype.split("/")[1] === "mp4") {
    cb(null, true);
  } else {
    cb(new Error("Not an MP4 File!!"), false);
  }
};

//Calling the "multer" Function
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

admin.use(express.static(__dirname+'/public'))
admin.use(express.static(__dirname+'/uploads'))


//create sessions for users
//admin.set('trust proxy', 1)//unleaks memory
admin.use(session({
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

admin.use(passport.initialize());
admin.use(passport.session());

admin.use(flash());


// admin.get('/', function(req, res) {
//     res.json({message: `You are in the admin route. Append '/login' to the URL to login as admin`})
// })

 admin.get('/', checkAuthenticated, function(req, res) {
     res.render('admin/adminLogin')
 })

admin.get('/dashboard', checkNotAuthenticated, async function(req, res) {

  try{ 
    let data = await pool.query(`SELECT * FROM videos`)
    console.log(data.rows)

    data = data.rows
   
    res.render('admin/adminDashboard', { files: data  })
  }
  catch(err) {
  
    console.log(err.message)
  }
 })

  admin.post('/login', passport.authenticate('local',{failureRedirect: '/admin/login', failureFlash: true}), async (req, res) => {

    const {email} = req.body
    let errors = []

    let data = await pool.query(`SELECT * FROM users WHERE email = $1`, [email])
    try {
      if(data.rows[0].roles === 'admin')
      {
        return res.redirect('dashboard')
    }
    else {
      errors.push({message: 'Unauthorized Access'})
      res.render('admin/adminLogin', { errors })
    }
        
    }
    catch (err) {
      console.log(err)
    }

  })


admin.get('/logout', function(req, res) {
  req.logOut();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/admin/login');
}) 

//using multer to upload videos in the admin dashboard
admin.post('/dashboard', upload.single('myFile'), async function(req, res) {
  
  try{
    const filePath = req.file.path
    const { title, desc } = req.body

    pool.query(`SELECT * FROM videos WHERE title = $1`, [title], 
    (err, results) => {
      if(err) {
        throw err
      }
      if(results.rows.length > 0) {
        return res.json({message: 'A file with the same title already exists in database'})
      }

      else {
        const data = pool.query(`INSERT INTO videos (title, description, filepath) VALUES ($1, $2, $3)
    RETURNING *`, [ title, desc, filePath.replace('public\\uploads\\', '/uploads/') ],
    (err, results) => {
      if(err) {
        return res.json({status: 'Fail', message: err.message })
      }
    return res.json({status: 'Success', message: 'File details sent to database'})
    })

    
      }

    }) 

  }

  catch(err) {
    console.log(err.message)
    return res.json({ 
      status: 'Fail',
      err })
  }
 
  })
 
//route protection
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/admin/dashboard");
  }
  next();
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
     // return res.redirect("/admin/dashboard");
      next()
    }
    res.redirect("/admin/login");
  }


  module.exports = admin;