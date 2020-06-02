const express = require('express');
const router = express.Router();
const moment = require('moment');
moment.locale('ru');
const showdown = require('showdown');
const converter = new showdown.Converter();

const config = require('../config');
const models = require('../models');

function posts(req, res) {
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;
  const perPage = +config.PER_PAGE;
  const page = req.params.page || 1;


  models.Post.find({
    status: 'published'
  })
    .skip(perPage * page - perPage)
    .limit(perPage)
    .populate('owner', 'login')
    .populate('uploads')
    .sort({updatedAt: -1})
    .then(posts => {
      posts = posts.map(post => {
        let body = post.body;
        if (post.uploads.length) {
          post.uploads.forEach(upload => {
            body = body.replace(`image${upload.id}`, `/${config.UPLOADS_ROUTE}${upload.path}`)
          })
        }

        return Object.assign(post, {
          body: converter.makeHtml(body)
        })
      });
      models.Post.countDocuments().then(count => {
        res.render('archive/index', {
          posts,
          moment,
          current: page,
          pages: Math.ceil(count / perPage),
          user: {
            id: userId,
            login: userLogin
          }
        })
      })
    }).catch(() => {
    throw new Error('Server Error')
  })
}

router.get('/', (req, res) => posts(req, res));

router.get('/archive/:page?', (req, res) => posts(req, res));
router.get('/posts/:post', (req, res, next) => {
  const url = req.params.post.trim().replace(/ +(?= )/g, '');
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;
  if (!url) {
    const err = new Error('Not found');
    err.status = 404;
    next(err);
  } else {
    models.Post.findOne({
      url,
      status: 'published'
    }).populate('owner', 'login')
      .populate('uploads')
      .then(post => {
        if (!post) {
          const err = new Error('Not found');
          err.status = 404;
          next(err);
        } else {
          models.Comment.find({
            post: post.id,
            parent: {$exists: false}
          }).then((comments) => {

              let body = post.body;
              if (post.uploads.length) {
                post.uploads.forEach(upload => {
                  body = body.replace(`image${upload.id}`, `/${config.UPLOADS_ROUTE}${upload.path}`)
                })
              }

              res.render('post/post', {
                post: Object.assign(post, {
                  body: converter.makeHtml(body)
                }),
                comments,
                moment,
                user: {
                  id: userId,
                  login: userLogin
                }
              })
            }
          )
        }
      })
  }
});
router.get('/users/:login/:page*?', (req, res) => {
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;
  const perPage = +config.PER_PAGE;
  const page = req.params.page || 1;
  const login = req.params.login;

  models.User.findOne({login}).then((user) => {
    models.Post.find({owner: user.id})
      .populate('uploads')
      .skip(perPage * page - perPage)
      .limit(perPage)
      .sort({createdAt: -1})
      .then(posts => {
        posts = posts.map(post => {
          let body = post.body;
          if (post.uploads.length) {
            post.uploads.forEach(upload => {
              body = body.replace(`image${upload.id}`, `/${config.UPLOADS_ROUTE}${upload.path}`)
            })
          }

          return Object.assign(post, {
            body: converter.makeHtml(body)
          })
        });
        models.Post.countDocuments({owner: user.id}).then(count => {
          res.render('archive/user', {
            posts,
            _user: user,
            current: page,
            pages: Math.ceil(count / perPage),
            user: {
              id: userId,
              login: userLogin
            }
          })
        })
      }).catch(() => {
      throw new Error('Server Error')
    })
  });

});
module.exports = router;
