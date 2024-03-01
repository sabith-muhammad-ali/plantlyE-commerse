const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const dotenv = require("dotenv");
const nochache = require("nocache");
dotenv.config();
const app = express();
const User = require('./models/userModel');
const bcrypt = require("bcrypt");




// Database connection
mongoose.connect("mongodb://127.0.0.1:27017/ecommerse");

// Configure express-session
app.use(
  session({
    secret: "uuuivd4",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(nochache());
// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Other middleware and routes
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// Routes
const user = require("./routes/userRoute");
const admin = require("./routes/adminRoute");
app.use("/", user);
app.use("/admin", admin);

/////////////////////////////////////////////////////////////////
const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error);
  }
};
const passport = require('passport');
const facebookStrategy = require('passport-facebook'). Strategy

app.use(passport.initialize());
app.use(passport.session());

//make our facebook strategy 
passport.use(new facebookStrategy({
  // Pull in our app id and secret from our auth.js file
  clientID: '372802575524203',
  clientSecret: 'd821e311e4c03f5d6a76f06613da0689',
  callbackURL: 'http://localhost:3001/facebook/callback',
  profileFields: ['id', 'displayName', 'name', 'email']
}, (req,token, refreshToken, profile, done) => {
  process.nextTick(async () => {
    try {
      let user = await User.findOne({ facebookId: profile.id })
      if (user){
        return done(null, user);   // User found, return that user

      }else {
        const hash = await bcrypt.hash(profile.id,10);
      
        const newUser = new User({
          name: profile.displayName,
          email: profile.emails[0].value,
          mobile: 0,
          verified: true,
          password: hash,
          is_admin: false,
          is_block: false,
          google: false,
          facebook: true,
          facebookId:profile.id 
        });
        user = await newUser.save();
        return done(null,user);
      }
    } catch (error) {
      return done(err)
    }
  });
}))

app.get('/auth/facebook',passport.authenticate('facebook',{scope:'email'}))

app.get('/facebook/callback', passport.authenticate('facebook', {
  successRedirect: '/profile',
  failureRedirect: '/failed'
}));

app.get('/profile',isLoggedIn,async(req,res) => {
  console.log(req.user);
  const userData = await User.findOne({ _id: req.user._id });
  console.log(userData);
  res.render("user/home", { userData });

})

app.get('/failed',(req,res) => {
  res.send('you are a non valid user ');
})


passport.serializeUser((user,done) => {
  done(null,user.id);
})

passport.deserializeUser((id,done) => {
  User.findById(id,((err,user) => {
    return done(null,user);
  }))
})

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}



app.get('/facebook/login', (req, res) => {
  res.redirect('https://www.facebook.com/v3.2/dialog/oauth?response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Ffacebook%2Fcallback&scope=email&client_id=372802575524203');
});




// Start the server
app.listen(3001, () => {
  console.log(`Server is running on http://localhost:3001`);
});

module.exports = app;
