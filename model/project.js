//jshint esversion:6

const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const projectSchema = new mongoose.Schema({
  project_name: String,
  leader: {
    type: mongoose.Types.ObjectId,
    ref: 'User'
  },
  teammates: [{
    user_id: {
      type: mongoose.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: Boolean,
      default: false
    }
  }],
  uploads: {
    type: [{
      uploaded_by: {
        type: String,
        ref: 'User'
      },
      images: [Object],
      upload_description: String
    }],
    default: []
  },
  tasks: {
    type: [{
      task_name: String,
      task_description: String,
      assigned_to: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
      },
      isDone: {
        type: Number,
        enum: [0, 1, 2]
      },
      start_time: Date,
      end_time: Date,
      review: String
    }],
    default: []
  }
});

module.exports = mongoose.model("Project", projectSchema);
