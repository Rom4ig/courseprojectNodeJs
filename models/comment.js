const mongoose = require('mongoose');
const autopopulate = require('mongoose-autopopulate');
const Schema = mongoose.Schema;

const Post = require('./post');

const schema = new Schema({
    body: {
      type: String,
      required: true
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post'
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'Comment'
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      autopopulate: true
    },
    children: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
        autopopulate: true
      }
    ],
  },
  {
    timestamps: true
  }
);

schema.pre('save', async function (next) {

  if (this.isNew) {
    await Post.incCommentCount(this.post)
  }
  next();
});


schema.plugin(autopopulate);

schema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('Comment', schema);