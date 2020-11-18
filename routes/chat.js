//jshint esversion:6

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const router = express.Router();
var User = require('../model/user');
var Project = require('../model/project');
var sanitize = require('mongo-sanitize');

router.use(express.static(path.join(__dirname + '/../public')));

router.get('/', isLoggedIn, (req, res) => {
  res.redirect('https://project-hub-chat-2020.herokuapp.com/chat/' + req.user._id);
});

router.get('/:userid', (req, res) => {
  User.findOne({
    _id: sanitize(req.params.userid)
  }, function(err, user) {
    var memberof = user.asmember;
    var mid = [];
    memberof.forEach(m => {
      if (m.status == true) {
        mid.push(String(m.project_id));
      }
    });
    var leaderof = user.managing;
    var merged = [
      ...mid,
      ...leaderof
    ];
    var managing = [];
    var asmember = [];
    var pending = [];
    Project.find({
      _id: {
        $in: merged
      }
    }, (err, projects) => {
      managing = projects.filter(project => {
        return leaderof.includes(project._id);
      });
      asmember = projects.filter(project => {
        return mid.includes(String(project._id));
      });
      projects.forEach(project => {
        project.tasks.forEach(task => {
          if (String(user._id) == String(task.assigned_to) && task.isDone == 0) {
            pending.push({_id: project._id, project_name: project.project_name, task: task});
          }
        });
      });
      req.app.locals.managing = managing;
      req.app.locals.asmember = asmember;
      req.user = user;
      res.render("chatrooms.ejs", {
        userid: user._id,
        user: user,
        managing: managing,
        asmember: asmember,
        pending: pending
      });
    });
  });
});

function isLoggedIn(req, res, next) {
  try {
    if (req.isAuthenticated()) {
      req.isLogged = true;
      return next();
    }
    res.redirect('/login-user');
  } catch (e) {
    console.log(e);
  }
}

module.exports = router;
