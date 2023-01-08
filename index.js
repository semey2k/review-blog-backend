import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import {
  registerValidation,
  loginValidation,
  postCreateValidation,
} from './validations/validation.js';
import dotenv from 'dotenv'

import { handleValidationErrors, checkAuth } from './utils/index.js';

import { UserController, PostController } from './controllers/index.js';

import cloudinary from 'cloudinary'

dotenv.config()

mongoose
  .connect(process.env.MONGODB_URI,)
  .then(() => console.log('DB ok'))
  .catch((err) => console.log('DB error', err));

const app = express();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
})

app.use(express.json());
app.use(cors());

app.post('/auth/login', loginValidation, handleValidationErrors, UserController.login);
app.post('/auth/login/google', UserController.loginGoogle);

app.post('/auth/register', registerValidation, handleValidationErrors, UserController.register);

app.get('/auth/me', checkAuth, UserController.getMe);
app.get('/users', checkAuth, UserController.getAllUsers);
app.delete('/users/:id',  UserController.removeUser);
app.patch('/register/:id', UserController.updateUser);


app.patch('/statusAdmin/:id', UserController.statusAdmin);

app.patch('/statusUser/:id', UserController.statusUser);


app.get('/posts/:id', PostController.getOne);
app.get('/posts/categories/:id', PostController.getAllByCategory);
app.get('/posts/tags/:tagsId', PostController.getPostsByTags);
app.get('/posts/:id/showComments',  PostController.showComments);
app.get('/posts/search/:query',  PostController.searchPost);
app.post('/posts', checkAuth, postCreateValidation, PostController.createPost);
app.patch('/posts/:id', checkAuth, postCreateValidation, PostController.updatePost);
app.patch('/posts/:id/comments', checkAuth, PostController.comments);
app.delete('/posts/:id', checkAuth, PostController.removePost);
app.get('/profile/:userId',  PostController.profilePosts);
app.get('/tags/:cat', PostController.getLastTags);
app.get('/tags/', PostController.getAllTags);
app.patch('/rating/:id', checkAuth, PostController.ratingPost);
app.patch('/likes/:id', checkAuth, PostController.likes);

app.delete('/:public_id', async(req, res) => {
  const {public_id} = req.params;
  try{
    await cloudinary.uploader.destroy(public_id);
    res.status(200).send();
  }catch(error){
    res.status(400).send();
  }
});



app.listen(process.env.PORT || 4444, (err) => {
  if (err) {
    return console.log(err);
  }
  console.log('Server OK');
});
