const express = require('express');
const apiRoute = express.Router();
const jwt = require('jsonwebtoken');
require("dotenv").config();

apiRoute.get('/', function (req, res) {
    res.json({message: 'This is the api route. Recommended test space = ~Postman~'})
});

apiRoute.get('/signup', function (req, res) {
    res.render('signup');
});

apiRoute.post('/post', verifyToken, function (req, res) {
   jwt.verify(req.token, process.env.SECRET_KEY, (err, authData) => {
    if(err) {
        res.sendStatus(403)
    } else {
        res.json({ message: 'Post is successful...',
                    authData 
                })
    }
   })
    
});

apiRoute.post('/login', function (req, res) {
    //mock user
    const user = {
        id: 5,
        email: 'poa@test.com',
        password: '1234'
    }

    jwt.sign({user}, process.env.SECRET_KEY, { expiresIn: '300s' }, (err, token) => {
        res.json({
            token
        })
    })
})

function verifyToken(req, res, next) {
    //Get Auth Header
    const bearerHeader = req.headers['authorization'];
    //check if bearer is undefined
    if(typeof bearerHeader !== 'undefined') {
        //split at the space
        const bearer = bearerHeader.split(' ')
       // Get token from array
       const bearerToken = bearer[1];
       //set token
       req.token = bearerToken;

       next();

    }
    else {
        res.sendStatus(403) //send forbidden status
    }
}

module.exports = apiRoute;