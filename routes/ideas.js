const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const {ensureAuth} = require('../helpers/auth');

// Load Idea model --------------------------------------------------
require('../models/Idea');
const Idea = mongoose.model('ideas');

// Routes -----------------------------------------------------------
router.get('/add', ensureAuth, (req, res) => res.render('ideas/add'));
router.get('/:id/edit', ensureAuth, async (req, res) => {
  try {
    let idea = await Idea.findById(req.params.id);
    if(idea.user !== req.user.id) {
      req.flash('error', 'Edit: Not authorized!');
      res.redirect('/ideas');
    } else {
      res.render('ideas/edit', {idea, error: req.flash('error')});
    }
  } catch (err) {
    res.redirect('back');
  }
});
router.get('/', ensureAuth, async (req, res) => {
  let ideas = await Idea.find({user: req.user.id})
                        .sort({date: 'desc'});
  res.render('ideas/index', {
    ideas, 
    success: req.flash('success'),
    error: req.flash('error')});
});
router.put('/:id', ensureAuth, async (req, res) => {
  let id = req.params.id;
  let body = req.body;
  try {
    if(body.title && body.details) {
      await Idea.findByIdAndUpdate(id, {$set: body}, {new: true});
      req.flash('success', 'Update: Success!');
      res.redirect('/ideas');
    } else {
      req.flash('error', 'Update: Title and Details can not be blank.');
      res.redirect(`/ideas/${id}/edit`);
    }
  } catch (err) {
    req.flash('error', 'Update: Failed!');
    res.redirect('back');
  }
});
router.delete('/:id', ensureAuth, async (req, res) => {
  let id = req.params.id;
  try {
    await Idea.findByIdAndRemove(id);
    req.flash('success', 'Delete: Success!');
    res.redirect('/ideas');
  } catch (err) {
    req.flash('error', 'Delete: Failed!');
    res.redirect('back');
  }
});
router.post('/', ensureAuth, async (req, res) => {
  let body = req.body;
  try {
    if(!body.title || !body.details) {
      req.flash('error', 'Create: Title and Details can not be blank.');
      res.redirect('back');
    } else {
      let newIdea = {
        title: body.title, 
        details: body.details,
        user: req.user.id
      };
      await new Idea(newIdea).save();
      req.flash('success', 'Create: Success!');
      res.redirect('/ideas');
    }
  } catch (err) {
    req.flash('error', 'Create: Failed!');
    res.redirect('back');
  }
});

module.exports = router;