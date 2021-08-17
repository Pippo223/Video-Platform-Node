const express = require('express');
const admin = express.Router();
const session = require('express-session');//called to create session for admin 
const flash = require('express-flash');
const passport = require('passport'); //for passport authentication
const { pool } = require('../config/dbConfig');
const path = require('path')

const multer  = require('multer') //require multer library for file uploads

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

 admin.get('/login', checkAuthenticated, function(req, res) {
     res.render('admin/adminLogin')
 })

admin.get('/dashboard', checkNotAuthenticated, async function(req, res) {
  //let datas = []
  try{ 
    let data = await pool.query(`SELECT * FROM videos`)
    console.log(data.rows)
    // for (let i=0; i<data.rows.length;i++) {
    //   datas.push(data.rows[i])
    // }
    data = data.rows
   
   // res.sendFile(__dirname + '/admin')
    res.render('admin/adminDashboard', { files: data  })
  }
  catch(err) {
    // res.json({
    //   status: 'Error',
    //   err
    // })
    console.log(err.message)
  }
 })

  admin.post('/login', passport.authenticate('local'), async (req, res) => {

    const {email} = req.body
    let errors = []

    let data = await pool.query(`SELECT * FROM users WHERE email = $1`, [email])
    try {
      if(data.rows[0].role === 'admin')
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

admin.post('/dashboard', upload.single('myFile'), async function(req, res) {
  
  try{
    const fileName = req.file.path
    const { title, desc } = req.body

    const data = await pool.query(`INSERT INTO videos (filename, title, description) VALUES ($1, $2, $3)
    RETURNING *`, [fileName.replace('public\\uploads\\', '/uploads/'), title, desc])
    
    console.log(data.rows)
    
    return res.json({status: 'Success', message: 'File details sent to database'})
  }

  catch(err) {
    console.log(err.message)
    return res.json({ 
      status: 'Fail',
      err })
  }
 
  })
 




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