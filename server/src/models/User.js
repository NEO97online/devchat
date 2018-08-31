import mongoose from 'mongoose'

const User = new mongoose.Schema({
  displayName: {type: String, required: true},
  tag: {type: String, maxlength: 4, required: true}, // only numbers will be used
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  profilePicture: {type: String},
  timezone: {type: Number}
})

export default mongoose.model('User', User)