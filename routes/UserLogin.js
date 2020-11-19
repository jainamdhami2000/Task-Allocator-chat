//jshint esversion:6
require("dotenv").config();
const sanitize = require('mongo-sanitize');
const User = require('../model/user');
const multer = require('multer');
const Project = require('../model/project');

module.exports = function(app, passport) {
  app.get('/', (req, res) => {
    res.redirect('/login');
  });

  app.get('/dashboard', isLoggedIn, (req, res) => {
    var memberof = req.user.asmember;
    var mid = [];
    memberof.forEach(m => {
      if (m.status == true) {
        mid.push(String(m.project_id));
      }
    });
    var leaderof = req.user.managing;
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
          if (String(req.user._id) == String(task.assigned_to) && task.isDone == 0) {
            pending.push({_id: project._id, project_name: project.project_name, task: task});
          }
        });
      });
      req.app.locals.managing = managing;
      req.app.locals.asmember = asmember;
      res.render('dashboard', {
        user: req.user,
        managing: managing,
        asmember: asmember,
        pending: pending,
        userid:req.user._id
      });
    });
  });

  app.get('/about_us', (req, res) => {
    res.render('aboutus', {user: req.user})
  });

  app.get('/signup', (req, res) => {
    res.render('register', {message: req.flash('signupMessage')});
  });

  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/verify', // redirect to the secure profile section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  app.get('/login', (req, res) => {
    res.render('login', {message: req.flash('loginMessage')});
  });

  app.get('/profile_page', isLoggedIn, (req, res) => {
    var memberof = req.user.asmember;
    var mid = [];
    memberof.forEach(m => {
      if (m.status == true) {
        mid.push(String(m.project_id));
      }
    });
    var leaderof = req.user.managing;
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
          if (String(req.user._id) == String(task.assigned_to) && task.isDone == 0) {
            pending.push({_id: project._id, project_name: project.project_name, task: task});
          }
        });
      });
      req.app.locals.managing = managing;
      req.app.locals.asmember = asmember;
      res.render('profile-page', {
        user: req.user,
        managing: managing,
        asmember: asmember
      });
    });
  });

  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/verify', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  app.get('/verify', function(req, res) {
    User.findOne({
      Email: req.user.Email
    }, function(err, user) {
      if (user.isVerified) {
        res.redirect('/dashboard');
      } else {
        res.render('verify', {
          user: req.user // get the user out of session and pass to template
        });
      }
    });
  });

  app.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
  }));

  app.get('/google/callback', passport.authenticate('google', {
    successRedirect: '/verify', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });
};

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    req.isLogged = true;
    return next();
  }
  res.redirect('/');
}
