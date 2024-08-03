const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    content: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

reviewSchema.methods.toJson = function () {
  const obj = this._doc;
  delete obj.__v;
  return obj;
};

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
