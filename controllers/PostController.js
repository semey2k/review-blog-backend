import PostModel from '../models/Post.js';
import UserModel from '../models/User.js';

export const getLastTags = async (req, res) => {
  try {
    const cat = req.params.cat;

    if (cat === 'New') {
      const posts = await PostModel.find().sort({ createdAt: -1 }).limit(5).exec();

      const tags = posts
        .map((obj) => obj.tags)
        .flat()
        .filter((el) => el)
        .slice(0, 5);

      return res.json(tags);
    } else if (cat === 'Popular') {
      const posts = await PostModel.find().sort({ viewsCount: -1 }).limit(5).exec();
      const tags = posts
        .map((obj) => obj.tags)
        .flat()
        .filter((el) => el)
        .slice(0, 5);

      return res.json(tags);
    }

    const posts = await PostModel.find({
      genres: cat,
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .exec();

    const tags = posts
      .map((obj) => obj.tags)
      .flat()
      .filter((el) => el)
      .slice(0, 5);
    return res.json(tags);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить статьи',
    });
  }
};

export const getAllTags = async (req, res) => {
  try {
    const posts = await PostModel.find();

    const tags = posts
      .map((obj) => obj.tags)
      .flat()
      .filter((el) => el);
    return res.json(tags);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить статьи',
    });
  }
};

export const getOne = async (req, res) => {
  try {
    const postId = req.params.id;

    PostModel.findOne(
      {
        _id: postId,
      },
      (err, doc) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            message: 'Не удалось вернуть статью',
          });
        }

        if (!doc) {
          return res.status(404).json({
            message: 'Статья не найдена',
          });
        }

        res.json(doc);
      },
    )
      .populate({ path: 'user', populate: { path: 'post', model: 'Post', select: ['likes'] } })
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
          model: 'User',
          select: ['fullName', 'avatarUrl'],
        },
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить статьи',
    });
  }
};

export const getPostsByTags = async (req, res) => {
  try {
    const postsPerPage = 10;
    const skip = req.query.skip;

    const total = await PostModel.countDocuments({});
    const tagsId = req.params.tagsId;

    const posts = await PostModel.find({
      tags: { $in: [tagsId] },
    })
      .sort({ createdAt: -1 })
      .skip((skip - 1) * postsPerPage)
      .limit(postsPerPage)
      .populate({ path: 'user', populate: { path: 'post', model: 'Post', select: ['likes'] } })
      .exec();

      res.json({ posts, total: Math.ceil(total / postsPerPage) });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить статьи',
    });
  }
};

export const getAllByCategory = async (req, res) => {
  try {
    const cat = req.params.id;
    const postsPerPage = 10;
    const skip = req.query.skip;

    const total = await PostModel.countDocuments({});

    if (cat === 'New') {
      const posts = await PostModel.find()
        .sort({ createdAt: -1 })
        .skip((skip - 1) * postsPerPage)
        .limit(postsPerPage)
        .populate({ path: 'user', populate: { path: 'post', model: 'Post', select: ['likes'] } })
        .exec();
      return res.json({ posts, total: Math.ceil(total / postsPerPage) });
    } else if (cat === 'Popular') {
      const posts = await PostModel.find()
        .sort({ userRating: -1 })
        .skip((skip - 1) * postsPerPage)
        .limit(postsPerPage)
        .populate({ path: 'user', populate: { path: 'post', model: 'Post', select: ['likes'] } })
        .exec();
      return res.json({ posts, total: Math.ceil(total / postsPerPage) });
    }

    const posts = await PostModel.find({
      genres: cat,
    })
      .sort({ createdAt: -1 })
      .skip((skip - 1) * postsPerPage)
      .limit(postsPerPage)
      .populate({ path: 'user', populate: { path: 'post', model: 'Post', select: ['likes'] } })
      .exec();
    res.json({ posts, total: Math.ceil(total / postsPerPage) });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить статьи',
    });
  }
};

export const removePost = async (req, res) => {
  try {
    const postId = req.params.id;

    PostModel.findOneAndDelete(
      {
        _id: postId,
      },
      (err, doc) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            message: 'Не удалось удалить статью',
          });
        }
        if (!doc) {
          return res.status(500).json({
            message: 'Статья не найдена',
          });
        }

        res.json({
          success: true,
        });
      },
    );
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить статьи',
    });
  }
};

export const createPost = async (req, res) => {
  try {
    const id = req.body.el;
    if (id) {
      const doc = new PostModel({
        title: req.body.title,
        text: req.body.text,
        imageUrl: req.body.imageUrl,
        tags: req.body.tags.join().split(','),
        genres: req.body.genres,
        user: id,
        art: req.body.art,
        userRating: req.body.userRating,
        createdAt: new Date().toLocaleString(),
      });
      const post = await doc.save();

      return res.json(post);
    }

    const doc = new PostModel({
      title: req.body.title,
      text: req.body.text,
      imageUrl: req.body.imageUrl,
      tags: req.body.tags.join().split(','),
      genres: req.body.genres,
      art: req.body.art,
      user: req.userId,
      userRating: req.body.userRating,
      createdAt: new Date().toLocaleString(),
    });
    const post = await doc.save();

    await UserModel.updateOne({ _id: req.userId }, { $push: { post: post._id } });

    res.json(post);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось создать пост',
    });
  }
};

export const updatePost = async (req, res) => {
  try {
    const postId = req.params.id;

    await PostModel.updateOne(
      {
        _id: postId,
      },
      {
        title: req.body.title,
        text: req.body.text,
        imageUrl: req.body.imageUrl,
        tags: req.body.tags,
        genres: req.body.genres,
        userRating: req.body.userRating,
      },
    );

    res.json({
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось обновить статью',
    });
  }
};

export const comments = async (req, res) => {
  try {
    const postId = req.params.id;

    await PostModel.updateOne(
      {
        _id: postId,
      },
      {
        $push: {
          comments: {
            user: req.userId,
            commentsText: req.body.text,
            createdAt: new Date().toLocaleString(),
          },
        },
      },
    );

    res.json({
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось обновить статью',
    });
  }
};

export const showComments = async (req, res) => {
  try {
    const postId = req.params.id;

    const post = await PostModel.find({
      _id: postId,
    }).populate({
      path: 'comments',
      populate: {
        path: 'user',
        model: 'User',
        select: ['fullName', 'avatarUrl', 'post'],
        populate: {
          path: 'post',
          model: 'Post',
          select: ['likes'],
        },
      },
    });
    const comments = post.map((obj) => obj.comments);

    res.json(comments);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось обновить статью',
    });
  }
};

export const searchPost = async (req, res) => {
  try {
    const total = await PostModel.countDocuments({});
    const postsPerPage = 10;
    const skip = req.query.skip;
    const query = req.params.query;
    const posts = await PostModel.find({ $text: { $search: query } })
      .sort({ createdAt: -1 })
      .skip((skip - 1) * postsPerPage)
      .limit(postsPerPage)
      .populate({ path: 'user', populate: { path: 'post', model: 'Post', select: ['likes'] } })
      .exec();

    res.json({ posts, total: Math.ceil(total / postsPerPage) });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      message: 'Не удалось найти статью',
    });
  }
};

export const ratingPost = async (req, res) => {
  try {
    const postId = req.params.id;

    await PostModel.updateOne(
      {
        _id: postId,
      },
      {
        $push: {
          rate: { user: req.userId, rate: req.body.rating },
        },
      },
    );

    res.json({
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось обновить статью',
    });
  }
};

export const profilePosts = async (req, res) => {
  try {
    const id = req.params.userId;

    const posts = await PostModel.find({
      user: id,
    }).sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось обновить статью',
    });
  }
};

export const likes = async (req, res) => {
  try {
    const postId = req.params.id;

    await PostModel.updateOne(
      {
        _id: postId,
      },
      {
        $push: {
          likes: { user: req.userId },
        },
      },
    );
    res.json({
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось обновить статью',
    });
  }
};
