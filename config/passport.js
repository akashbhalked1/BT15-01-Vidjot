const localStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = mongoose.model('users');

module.exports = (passport) => {
  passport.use(new localStrategy(
    {usernameField: 'email', passReqToCallback: true, session: false},
    async (req, email, password, done) => {
      let user = await User.findOne({email});
      if(!user) {
        req.flash('error', 'Login: Email not found.');
        return done(null, false);
      }
      if(!bcrypt.compareSync(password, user.password)) {
        req.flash('error', 'Login: Incorrect password.');
        return done(null, false);
      } else {
        req.flash('success', 'Login: Success!');
        return done(null, user);
      }
    }
  ));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => done(err, user));
  });
};