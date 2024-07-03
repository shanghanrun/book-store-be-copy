const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookSchema = Schema(
  {
    isbn: { type: String, required: true },
    title: { type: String, required: true },
    author: { type: String },
    description: { type: String },
    pubDate: { type: Date },
    cover: { type: String, required: true },
    stockStatus: { type: String },
    categoryId: { type: String },
    mileage: { type: Number },
    categoryName: { type: String },
    publisher: { type: String },
    adult: { type: Boolean, default: false },
    fixedPrice: { type: Boolean, default: false },
    priceStandard: { type: Number, required: true },
    priceSales: { type: Number },
    customerReviewRank: { type: Number },
    queryType: { type: String },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

bookSchema.methods.toJSON = function () {
  const obj = this._doc;
  delete obj.updatedAt;
  delete obj.__v;
  return obj;
};

const Book = mongoose.model('Book', bookSchema);
module.exports = Book;
