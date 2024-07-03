const mongoose = require('mongoose');
const Book = require('./Book');

const authorSchema = new mongoose.Schema(
  {
    authorName: {
      type: String,
    },
    books: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
      },
    ],
  },
  { timestamps: true },
);

authorSchema.methods.toJSON = function () {
  const obj = this._doc;
  delete obj.updatedAt;
  delete obj.__v;

  return obj;
};

const Author = mongoose.model('Author', authorSchema);

module.exports = Author;
