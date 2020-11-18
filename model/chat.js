//jshint esversion:6

const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const chatSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'User'
  },
  name: String,
  message: String,
  project_id: mongoose.Schema.ObjectId,
  msg_time: {
    type: Date,
    default: Date.now()
  }
});

module.exports = mongoose.model("Chat", chatSchema);
