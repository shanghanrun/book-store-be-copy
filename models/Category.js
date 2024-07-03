const mongoose = require('mongoose');
const { validateModulesOption } = require('@babel/preset-env/lib/normalize-options');
const Book = require('./Book');

const categorySchema = new mongoose.Schema(
  {
    categoryId: {
      type: String,
      required: true,
    },
    categoryName: {
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

categorySchema.methods.toJSON = function () {
  const obj = this._doc;
  delete obj.updatedAt;
  delete obj.__v;

  return obj;
};

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
