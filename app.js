const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const dotenv = require('dotenv');
const nochache = require('nocache');
dotenv.config();
const app = express();

// Database connection
mongoose.connect('mongodb://127.0.0.1:27017/ecommerse');

// Configure express-session
app.use(session({
  secret: 'uuuivd4',
  resave: false,
  saveUninitialized: true
}));

app.use(nochache());
// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// Other middleware and routes
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


// Routes
const user = require('./routes/userRoute');
const admin = require('./routes/adminRoute');
app.use('/', user);
app.use('/admin', admin);

// Start the server
app.listen(3001, () => {
  console.log(`Server is running on http://localhost:3001`);
});

module.exports = app;
