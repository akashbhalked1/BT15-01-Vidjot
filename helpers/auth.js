let ensureAuth = (req, res, next) => {
  if(req.isAuthenticated()) return next();
  req.flash('error', 'Not authorized!');
  res.redirect('/users/login');
};

module.exports = {ensureAuth};