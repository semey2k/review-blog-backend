import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import jwt_decode from 'jwt-decode';

import UserModel from '../models/User.js';

export const register = async (req, res) => {
  try {
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const doc = new UserModel({
      email: req.body.email,
      fullName: req.body.fullName,
      avatarUrl: req.body.avatarUrl,
      passwordHash: hash,
      post: req.postId,
      createdAt: new Date().toLocaleString(),
    });

    const user = await doc.save();

    const token = jwt.sign(
      {
        _id: user._id,
      },
      'secret123',
      {
        expiresIn: '30d',
      },
    );

    const { passwordHash, ...userData } = user._doc;

    res.json({ ...userData, token });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось зарегистрироваться',
    });
  }
};

export const registerGoogle = async (req, res) => {
  try {
    const doc = new UserModel({
      email: req.body.email,
      fullName: req.body.fullName,
      avatarUrl: req.body.avatarUrl,
      post: req.postId,
      createdAt: new Date().toLocaleString(),
    });

    const user = await doc.save();

    const token = jwt.sign(
      {
        _id: user._id,
      },
      'secret123',
      {
        expiresIn: '30d',
      },
    );

    res.json({ user, token });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось зарегистрироваться',
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;



    const user = await UserModel.findOneAndUpdate(
      {
        _id: userId,
      },
      {
        email: req.body.email,
        fullName: req.body.fullName,
        avatarUrl: req.body.avatarUrl,
      },
    );

    const token = jwt.sign(
      {
        _id: userId,
      },
      'secret123',
      {
        expiresIn: '30d',
      },
    );

    const { passwordHash, ...userData } = user._doc

    res.json({ ...userData, token });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось зарегистрироваться',
    });
  }
};

export const login = async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        message: 'Пользователь не найден',
      });
    }

    const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash);

    if (!isValidPass) {
      return res.status(404).json({
        message: 'Неверный логин или пароль',
      });
    }

    const token = jwt.sign(
      {
        _id: user._id,
      },
      'secret123',
      {
        expiresIn: '30d',
      },
    );

    const { passwordHash, ...userData } = user._doc;

    res.json({ ...userData, token });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось авторизоваться',
    });
  }
};

export const loginGoogle = async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });

    if (!user) {
      const doc = new UserModel({
        email: req.body.email,
        fullName: req.body.fullName,
        avatarUrl: req.body.avatarUrl,
        post: req.postId,
        createdAt: new Date().toLocaleString(),
      });

      const user = await doc.save();

      const token = jwt.sign(
        {
          _id: user._id,
        },
        'secret123',
        {
          expiresIn: '30d',
        },
      );

      return res.json({ user, token });
    }

    const token = jwt.sign(
      {
        _id: user._id,
      },
      'secret123',
      {
        expiresIn: '30d',
      },
    );

    res.json({ user, token });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось авторизоваться',
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId).populate({
      path: 'post',
      model: 'Post',
      select: ['likes'],
    });

    if (!user) {
      return res.status(404).json({
        message: 'Пользователь не найден',
      });
    }
    const { passwordHash, ...userData } = user._doc;

    res.json({ ...userData });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Нет доступа',
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find();

    res.json(users);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Нет доступа',
    });
  }
};

export const removeUser = async (req, res) => {
  try {
    const userId = req.params.id;

    UserModel.findOneAndRemove(
      {
        _id: userId,
      },
      (err, doc) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            message: 'Не удалось удалить пользователя',
          });
        }

        if (!doc) {
          return res.status(404).json({
            message: 'Пользователь не найден',
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
      message: 'Не удалось создать статью',
    });
  }
};

export const statusAdmin = async (req, res) => {
  try {
    const userId = req.params.id;

    await UserModel.updateOne(
      {
        _id: userId,
      },
      {
        $set: {
          status: 'admin',
        },
      },
    );

    const user = await UserModel.find();
    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось заблокировать пользователя',
    });
  }
};

export const statusUser = async (req, res) => {
  try {
    const userId = req.params.id;

    await UserModel.updateOne(
      {
        _id: userId,
      },
      {
        $set: {
          status: 'user',
        },
      },
    );

    const user = await UserModel.find();
    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось заблокировать пользователя',
    });
  }
};
