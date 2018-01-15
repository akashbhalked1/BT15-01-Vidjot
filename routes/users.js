const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// Load Idea model --------------------------------------------------
require('../models/User');
const User = mongoose.model('users');

// Routes -----------------------------------------------------------
router.get('/login', (req, res) => {
  res.render('users/login', {
    success: req.flash('success'),
    error: req.flash('error')
  });
});
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/ideas',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success', 'Logout: Success!');
  res.redirect('/users/login');
});
router.get('/register', (req, res) => {
  res.render('users/register', {
    error: req.flash('error'),
    name: req.flash('name'),
    email: req.flash('email')
  });
});
router.post('/register', async (req, res) => {
  let body = req.body;
  try {
    if(body.password !== body.password2) {      
      req.flash('error', 'Register: Passwords do not match.');
      req.flash('name', body.name);
      req.flash('email', body.email);
      res.redirect('/users/register');
    } else if(body.password.length < 6) {
      req.flash('error', 'Register: Password length must at least 6.');
      req.flash('name', body.name);
      req.flash('email', body.email);
      res.redirect('/users/register');
    } else {
      let email = await User.findOne({email: body.email});
      if(email) {
        req.flash('error', 'Register: Email already registered.');
        req.flash('name', body.name);
        res.redirect('/users/register');
      } else {
        let newUser = {name: body.name, email: body.email, password: body.password};
        let salt = bcrypt.genSaltSync(10);
        newUser.password = bcrypt.hashSync(newUser.password, salt);
        
        let user = await new User(newUser).save();
        if(user) {
          req.flash('success', 'Register: Success!');
          res.redirect('/users/login');
        } else {
          throw new Error('Server error!');
        }
      }
    }
  } catch (err) {
    req.flash('error', 'Register: Failed!');
    res.redirect('/users/register');
  }
});

module.exports = router;