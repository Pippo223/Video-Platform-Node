require("dotenv").config();//require db details 

const { Pool } = require('pg');// postgres library

const isProduction = process.env.NODE_ENV === 'production'; 

const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;

const pool = new Pool({
   // connectionString: isProduction ? process.env.DATABASE_URL : connectionString,
   // ssl: isProduction ? { rejectUnauthorized: false } : false
   connectionString: process.env.DATABASE_URL,
   ssl: {require:true,
         rejectUnauthorized:false}
}); 

module.exports = { pool };



  