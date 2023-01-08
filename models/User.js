import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  passwordHash: {
    type: String,
  },
  avatarUrl: {},
  status: {
    type: String,
    default: 'user',
  },
  post: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    },
  ],
  createdAt: {
    type: String,
  },
});

export default mongoose.model('User', UserSchema);
