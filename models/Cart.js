const mongoose = require('mongoose');
const User = require('./User');
const Book = require('./Book');
const Schema = mongoose.Schema;

const cartSchema = Schema(
  {
    userId: {
      type: mongoose.ObjectId,
      ref: User,
    },
    items: [
      {
        bookId: { type: mongoose.ObjectId, ref: Book },
        qty: { type: Number, default: 1, required: true },
      },
    ],
  },
  {
    timestamps: true,
  },
);
cartSchema.methods.toJSON = function () {
  const obj = this._doc;
  delete obj.__v;
  delete obj.updateAt;

  return obj;
};

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
