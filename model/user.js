//jshint esversion:6

const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const userSchema = new mongoose.Schema({
  local: {
    password: String,
  },
  google: {
    id: String,
    token: String,
  },
  username: String,
  FirstName: String,
  LastName: String,
  image: String,
  Email: String,
  loginType: {
    type: String
  },
  isVerified: {
    default: false,
    type: Boolean
  },
  managing: {
    type: [mongoose.Types.ObjectId],
    ref: 'Project',
    default: []
  },
  asmember: {
    type: [{
      project_id: {
        type: mongoose.Types.ObjectId,
        ref: 'Project',
      },
      status: {
        type: Boolean,
        default: false
      }
    }],
    default: []
  },
  // company_name: String
});

userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model("User", userSchema);
