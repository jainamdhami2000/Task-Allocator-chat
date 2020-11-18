//jshint esversion:6
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const sanitize = require('mongo-sanitize');
const User = require('../model/user');
const configAuth = require('./auth');
const multer = require('multer');

//MULTER IMPLEMENTATION

module.exports = function(passport) {

  //PASSPORT SERIALIZATION AND DESERIALIZATION
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  passport.use('local-signup', new localStrategy({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
    },
    function(req, email, password, done) {
      process.nextTick(function() {
        User.findOne({
          'Email': email,
        }, function(err, user) {
          if (err)
            return done(err);
          if (user) {
            return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
          } else {
            var newUser = new User();
            newUser.Email = email;
            newUser.FirstName = sanitize(req.body.fname);
            newUser.LastName = sanitize(req.body.lname);
            newUser.username = sanitize(req.body.username);
            newUser.local.password = newUser.generateHash(password);
            newUser.loginType = 'local';
            newUser.image = null;
            newUser.isVerified = false;
            newUser.save(function(err) {
              if (err)
                throw err;
              return done(null, newUser);
            });
          }
        });
      });
    }));


  //PASSPORT LOCAL
  passport.use('local-login', new localStrategy({
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true
    },
    function(req, username, password, done) {
      User.findOne({
        username: username
      }, function(err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, req.flash('loginMessage', 'No user found.'));
        }
        if (!user.validPassword(password)) {
          return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
        }
        return done(null, user);
      });
    }
  ));

  //PASSPORT GOOGLE STRATEGY
  passport.use(new GoogleStrategy({
      clientID: configAuth.googleAuth.clientID,
      clientSecret: configAuth.googleAuth.clientSecret,
      callbackURL: configAuth.googleAuth.callbackURL,
      passReqToCallback: true
    },
    function(req, token, refreshToken, profile, done) {
      // make the code asynchronous
      // User.findOne won't fire until we have all our data back from Google
      process.nextTick(function() {
        // try to find the user based on their google id
        User.findOne({
          'google.id': profile.id
        }, function(err, user) {
          if (err)
            return done(err);
          if (user) {
            // if a user is found, log them in
            return done(null, user, req.flash('message', 'Login'));
          } else {
            // if the user isnt in our database, create a new user
            var newUser = new User();
            // set all of the relevant information
            newUser.google.id = profile.id;
            newUser.google.token = token;
            newUser.FirstName = profile.name.givenName;
            newUser.LastName = profile.name.familyName;
            newUser.isVerified = true;
            newUser.Email = profile.emails[0].value; // pull the first email
            newUser.username = profile.emails[0].value.substr(0, profile.emails[0].value.indexOf('@'));
            newUser.loginType = 'google';
            newUser.image = profile.photos[0].value;
            newUser.isVerified = true;
            // save the user
            newUser.save(function(err) {
              if (err)
                throw err;
              return done(null, newUser, req.flash('message', 'Signup'));
            });
          }
        });
      });
    }));
};
