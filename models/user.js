const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    // trim removes any accidental white space
    trim: true
    },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  favouriteBook: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  }
});

// Authenticate login input against database - call method on schema
// args are email and pass submitted in login form

// we're defining the authenticate method here to be called in route
UserSchema.statics.authenticate = function(email, password, callback) {
  // Mongo query to find document with email address submitted
  User.findOne({ email: email})
  //exec method to perform the search, callback to process the results
  .exec(function (error, user) {
    if (error) {
      return callback(error);
    } else if ( !user ) {
      // if email address not found in database
      var err = new Error('User not found.')
      err.status = 401;
      return callback(err);
    }
    // compare supplied password with hashed version
    bcrypt.compare(password, user.password, function(error, result) {
      if (result === true) {
        // null represents potential error so here we say no error and pass pack the user object
        return callback(null, user);
      } else {
        return callback(null);
      }
    })
  })
}



// Can't use arrow functions with bcrypt???

// pre save hook - hash password
// call pre method on our schema. 2 arg, hook name (mongoose keyword) and anon function. next arg is for the middleware.
UserSchema.pre('save', function(next) {
  // this in this context refers to the obj created when user entered form data
  var user = this;

  // pass in password, number of times to run the function and callback
  bcrypt.hash(user.password, 10, function(err, hash) {
    if (err) {
      // pass error along if has fails
      return next(err);
    }
    // put hashed password back into form data object
    user.password = hash;
    next();
  });
});

// Create variable, model method, creates the schema
let User = mongoose.model('User', UserSchema)

module.exports = User;
