const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const mongoStore = require('connect-mongo')(session);
var app = express();



// mongoose connection
mongoose.connect("mongodb://localhost:27017/bookworm");
const db = mongoose.connection;
// mongo error
db.on('error', console.error.bind(console, 'connection'));

// Use sessions for tracking logins
// parameters: secret is required, string used to sign the session id cookie. another layer of security
// Resave option forces the sesion to be saved in the session store whether anything changed during the session nor Not
// forces an uninitialised session to be saved in the session store (new and unmodified session, sent to false as we don't want to save it)

// This middleware makes sessions available anywhere in the app, known as application level middleware
app.use(session({
  secret: 'Treehouse Loves You',
  resave: true,
  saveUninitialized: false,
  // Store session data in mongo rather than server ram
  store: new mongoStore({
    mongooseConnection: db
  })
}));

// Make user ID available in templates
app.use((req, res, next) => {
  // response object has locals property, allows you to add info to res object - stuffing custon var into the response.
  res.locals.currentUser = req.session.userId; // value is id of whoever is logged in, undefined if nobody logged in
  next();
})


// parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// serve static files from /public
app.use(express.static(__dirname + '/public'));

// view engine setup
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');

// include routes
var routes = require('./routes/index');
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

// error handler
// define as the last app.use callback
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// listen on port 3000
app.listen(3000, function () {
  console.log('Express app listening on port 3000');
});
