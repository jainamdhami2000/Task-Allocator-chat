//jshint esversion:6

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const router = express.Router();
var User = require('../model/user');
var sanitize = require('mongo-sanitize');

router.use(express.static(path.join(__dirname + 'public')));

router.post('/:project/:userid', function(req, res) {
  User.findOne({
    _id: sanitize(req.params.userid)
  }, (err, user) => {
    res.render('index2.ejs', {
      user: user,
      userid: req.params.userid,
      projectid: req.params.project.split("|")[0],
      projectname: req.params.project.split("|")[1],
      project: req.params.project
    });
  });
});

module.exports = router;
