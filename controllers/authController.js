const passport = require('passport');
require('dotenv').config();
const User = require('../models/userModel');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const bcrypt = require('bcrypt');

const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password,10);
        return passwordHash;
    } catch (error) {
        console.log(error);        
    }
}


passport.use(new GoogleStrategy({
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3001/auth/google/callback",
    passReqToCallback: true
  },
  function(request, accessToken, refreshToken, profile, done) {
       done(null, profile);
    }
  )
);

passport.serializeUser((user,done) => {
    done(null, user);
})

passport.deserializeUser((user,done) => {
    done(null, user);
})

const success = async (req,res) => {
    try {
        //check if the user already exists in your database based on the email
        const existingUser = await User.findOne({email:req.user.email});

        if (existingUser) {
            req.session.userId = existingUser._id;
            return res.redirect('/');
        } else {
            const sPassword = await securePassword(req.user.id) // await the password hashing
            const newUser = new User({
                name: req.user.displayName, // use displayName insted of name 
                email: req.user.email,
                mobile:0,
                varified: true,
                password: sPassword,
                is_admin: false,
                is_block: false,
                google:true,
            });
            const savedUser = await newUser.save();

            if(savedUser) {
                req.session.userId = savedUser._id;
            }
            return res.redirect('/');
        }
    } catch (error) {
        console.log(error);
    }
}
module.exports = {
    success,
};