const express = require('express');
const router = express.Router();
const tr = require('transliter');
const models = require('../models');
const fse = require('fs-extra');
const config = require('../config');

// GET for edit
router.get('/edit/:id', (req, res, next) => {
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;
  const id = req.params.id.trim().replace(/ +(?= )/g, '');

  if (!userLogin || !userId) {
    res.redirect('/');
  } else {
    models.Post.findById(id).populate('uploads', 'path').then((post) => {
      if (!post) {
        const err = new Error('Post not found');
        err.status = 404;
        next(err);
      } else {
        res.render('post/edit', {
          post,
          user: {
            id: userId,
            login: userLogin
          }
        })
      }
    }).catch((error => {
      console.log(error);
    }));
  }
});

// GET for add
router.get('/add', (req, res) => {
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;

  if (!userLogin || !userId) {
    res.redirect('/');
  } else {
    models.Post.findOne({
      owner: userId,
      status: 'draft'
    }).then((post) => {
      if (post) {
        res.redirect(`/post/edit/${post.id}`);
      } else {
        models.Post.create({
          owner: userId,
          status: 'draft'
        }).then((post) => {
          res.redirect(`/post/edit/${post.id}`);
        });
      }
    })
    // res.render('post/edit', {
    //   user: {
    //     id: userId,
    //     login: userLogin
    //   }
    // });
  }

});

// POST is add
router.post('/add', (req, res) => {
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;
  if (!userLogin || !userId) {
    res.redirect('/');
  } else {
    const title = req.body.title.trim().replace(/ +(?= )/g, '');
    const body = req.body.body.trim();
    const isDraft = !!req.body.isDraft;
    const postId = req.body.postId;
    const url = `${tr.slugify(title)}-${Date.now().toString(36)}`;


    if (!title || !body) {
      const fields = [];
      if (!title) fields.push('title');
      if (!body) fields.push('body');
      res.json({
        ok: false,
        error: 'Все поля должны быть заполнены!',
        fields
      });
    } else if (title.length < 3 || title.length > 64)
      res.json({
        ok: false,
        error: 'Длина заголовка от 3 до 64 символов!',
        fields: ['title']
      });
    else if (body.length < 3)
      res.json({
        ok: false,
        error: 'Текст не менее 3х символов',
        fields: ['body']
      });
    else if (!postId)
      res.json({
        ok: false
      });
    else {
      models.Post.findOneAndUpdate({
          _id: postId,
          owner: userId
        },
        {
          title,
          body,
          url,
          owner: userId,
          status: isDraft ? 'draft' : 'published'
        },
        {new: true}).then((post) => {
        if (!post) {
          res.json({
            ok: false,
            error: 'Пост не твой'
          });
        } else {
          res.json({
            ok: true,
            post
          });
        }
      })
    }
  }
});

router.delete('/remove', (req, res) => {
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;
  const postId = req.body.postId;
  if (!userLogin || !userId) {
    res.redirect('/');
  } else {
    models.Post.findByIdAndRemove(postId).then((post) => {
      console.log(`post - ${post}`);
      post.uploads.forEach((upload) => {
        models.Upload.findByIdAndRemove(upload).then((deletedUpload) => {
          let pathToDelete = deletedUpload.path.split('/');
          console.log(`pathToDelete - ${pathToDelete}`);
          pathToDelete = pathToDelete[1];
          fse.remove(config.UPLOADS_ROUTE + '/' + pathToDelete);
        });
      });
      models.Comment.deleteMany({post: post.id});
      res.json({
        ok: true
      })
    }).catch(error => console.log(error))
  }
});


module.exports = router;
