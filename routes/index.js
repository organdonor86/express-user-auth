var express = require('express');
var router = express.Router();
// require our schema
let User = require('../models/user');
var mid = require('../middleware');


// GET /profile
// requiresLogin middleware added so profile only available if logged in
router.get('/profile', mid.requiresLogin, function(req, res, next) {
  // if user id variable isn't in place
  if (! req.session.userId) {
    var err = new Error('You are not authorised to view this page')
    err.status = 403; // 403 is forbidden
    return next(err);
  }
  User.findById(req.session.userId)
  .exec((error, user) => {
    if (error) {
      return next(error);
    } else {
      // send data from database to template in variables
      return res.render('profile', { title: 'Profile', name: user.name, favourite: user.favouriteBook });
    }
  })
});

// GET /logout
router.get('/logout', function(req, res, next) {
  // If session exists
  if (req.session) {
    // delete session - callback to indicate what to do after session destroyed
    req.session.destroy(function(err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    })
  }
});

// GET /login
router.get('/login', mid.loggedOut, function(req, res, next) {
  return res.render('login', { title: 'Log In' });
});

// POST /login
router.post('/login', function(req, res, next) {
  if (req.body.email && req.body.password) {
    // call authenticate method on our model imported at the top
    // pass in form data
    User.authenticate(req.body.email, req.body.password, (error, user) => {
      // if error or no user
      if (error || !user) {
        var err = new Error('Wrong email or password.')
        err.status = 401;
        return next(err);
      } else {
        // if authentication is successful we create a session
        // just need to add property to the req.session, value assigned in the user._id from database (user here is the database document)
        req.session.userId = user._id;
        return res.redirect('/profile');
      }
    });
  } else {
    // if email and pass aren't both present
    var err = new Error('Email and password are required.');
    err.status = 401;
    return next(err);
  }
});

// GET /
router.get('/', function(req, res, next) {
  return res.render('index', { title: 'Home' });
});

// GET /about
router.get('/about', function(req, res, next) {
  return res.render('about', { title: 'About' });
});

// GET /contact
router.get('/contact', function(req, res, next) {
  return res.render('contact', { title: 'Contact' });
});

// GET /register
router.get('/register', mid.loggedOut, function(req, res, next) {
  return res.render('register', { title: 'Sign Up' });
});

// POST /register
router.post('/register', (req, res, next) => {
  if (req.body.email &&
  req.body.name &&
  req.body.favouriteBook &&
  req.body.password &&
  req.body.confirmPassword) {
    // Confirm passwords match
    if (req.body.password !== req.body.confirmPassword) {
      var err = new Error('Passwords do not match');
      err.status = 400;
      return next(err);
    }

    // create object representing the document we want to send to mongo
    let userData = {
      email: req.body.email,
      name: req.body.name,
      favouriteBook: req.body.favouriteBook,
      password: req.body.password
    }

    // use schema create method to insert document to mongo
    User.create(userData, (error, user) => {
      if (error) {
        return next (error);
      } else {
        // create session on successful sign up so auto logged in
        req.session.user.Id = user._id;
        return res.redirect('/profile');
      }
    })

  } else {var err = new Error('All fields required.');
    err.status = 400;
    return next(err);
  }
})

module.exports = router;
