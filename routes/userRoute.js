const express = require('express');
const user = express.Router();
const userController = require('../controllers/userController');
const googleauthController = require('../controllers/authController');
const passport = require('passport');
const session = require('express-session');

user.use(
    session({
        secret: process.env.sessionSecret,
        resave:false,
        saveUninitialized:true,
    })
)

user.get('/',userController.homePage);
user.get('/registration',userController.loadRegister);
user.post('/registration',userController.insertUser);
user.get('/userOTP',userController.sendOTP);
user.post('/userOTP',userController.verifyOTP);
user.get('/loginUser',userController.loadsignin);

user.get('/logout',userController.userLogout);

user.use(passport.initialize());
user.use(passport.session()); 

user.get('/auth/google',
  passport.authenticate('google', { scope:
      [ 'email', 'profile' ] }
));

user.get( '/auth/google/callback',
    passport.authenticate( 'google', {
        successRedirect: '/auth/google/success',
        failureRedirect: '/auth/google/failure'
}));

user.get('/auth/google/success',googleauthController.success);

user.get('/auth/google/failure',(req,res) => {
    res.send('something failed');
})

module.exports = user;

