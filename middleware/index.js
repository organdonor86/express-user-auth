// prevents logged in users accessing a particular route
function loggedOut(req, res, next) {
  // if logged in send to profile page
  if (req.session && req.session.userId) {
    return res.redirect('/profile');
  }
  // if not logged in go to next piece of middleware
  return next();
}


function requiresLogin(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  } else {
    var err = new Error('You must be logged in to view this page');
    err.status = 403;
    return next(err);
  }
}

module.exports.requiresLogin = requiresLogin;
module.exports.loggedOut = loggedOut;
