import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  art: {
    type: String,
    required: true,
  },
  tags: {
    type: Array,
    default: [],
  },
  genres: {
    type: String,
    required: true,
  },
  userRating: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  comments: [{}],
  rate:[{}],
  likes: [{}],
  imageUrl: String,
  createdAt: {
    type: String,
  },
});

export default mongoose.model('Post', PostSchema);
