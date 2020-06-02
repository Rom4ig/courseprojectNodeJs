const express = require('express');
const router = express.Router();
const path = require('path');
const Sharp = require('sharp');
const multer = require('multer');
const mkdirp = require('mkdirp');

const models = require('../models');
const config = require('../config');
const diskStorage = require('../utils/diskstorage');
let uploadDB;
const rs = () => Math.random()
  .toString(36)
  .slice(-3);

const storage = diskStorage({
  destination: (req, file, cb) => {
    const dir = '/' + rs() + '/' + rs();
    req.dir = dir;
    mkdirp(config.DESTINATION + dir, err => cb(err, config.DESTINATION + dir));
    //cb(null, config.DESTINATION + dir)
  },
  filename: async (req, file, cb) => {
    try {
      const userId = req.session.userId;
      const filename = Date.now().toString(36) + path.extname(file.originalname);
      const dir = req.dir;
      const fullPath = dir + '/' + filename;
      const postId = req.body.postId;

      //find  post
      const post = await models.Post.findById(postId);
      if (!post) {
        const err = new Error('No post');
        err.code = 'NOPOST';
        return cb(err);
      }

      //upload
      uploadDB = await models.Upload.create({
        owner: userId,
        path: fullPath,
      });

      //write to post
      await models.Post.updateOne({
        _id: postId
      }, {
        $push: {
          uploads: {
            $each: [uploadDB.id],
            $position: 0
          }
        }
      });

      //
      req.fullPath = fullPath;

      cb(null, filename)
    } catch (e) {
      console.log(e);
    }
  },
  sharp: (req, file, cb) => {
    const resizer =
      Sharp()
        .resize(1024, 768, {fit: 'inside', withoutEnlargement: true})
        .toFormat('jpg')
        .jpeg({
          quality: 40,
          progressive: true
        });
    cb(null, resizer)
  }
});

const upload = multer({
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
      const err = new Error('Extension');
      err.code = 'EXTENSION';
      return cb(err);
    }
    cb(null, true);
  },
  storage,
  limits: {fileSize: 2 * 1024 * 1024},
}).single('file');

router.post('/image', (req, res) => {
  upload(req, res, err => {
    let error = '';
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        error = 'Картинка не более 2МБ';
      }
      if (err.code === 'EXTENSION') {
        error = 'Только jpeg, jpg, png';
      }
      if (err.code === 'NOPOST') {
        error = 'Попробуйте обновить страницу';
      }
    }
    res.json({
      ok: !error,
      error,
      uploadDB
    });

  });

});
module.exports = router;
