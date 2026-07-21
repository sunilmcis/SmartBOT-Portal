const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: String,
  profileImage: {
    data: Buffer,
    contentType: String
  }
},{ timestamps: true, collection: 'User'  });

module.exports = mongoose.model('User', UserSchema);



