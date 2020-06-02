const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    title: {
      type: String
    },
    body: {
      type: String,
    },
    url: {
      type: String
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['published', 'draft'],
      required: true,
      default: 'published'
    },
    commentCount: {
      type: Number,
      default: 0
    },
    uploads: [{
      type: Schema.Types.ObjectId,
      ref: 'Upload'
    }]
  },
  {
    timestamps: true
  }
);

schema.statics = {
  incCommentCount(postId) {
    return this.findByIdAndUpdate(
      postId,
      {$inc: {commentCount: 1}},
      {new: true});
  },
  deincCommentCount(postId) {
    console.log(postId);
    return this.findByIdAndUpdate(
      postId,
      {$inc: {commentCount: -1}},
      {new: true});
  }
};

// schema.pre('save', function (next) {
//   this.url = `${tr.slugify(this.title)}-${Date.now().toString(36)}`;
//   next();
// });

schema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('Post', schema);