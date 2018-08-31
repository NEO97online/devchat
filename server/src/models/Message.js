import mongoose from 'mongoose'

const Message = new mongoose.Schema({
  content: {type: String, required: true},
  displayName: {type: String, required: true},
  time: {type: Date, required: true}
})

export default mongoose.model('Message', Message)