const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./User');
const Book = require('./Book');
const Cart = require('./Cart');

const orderSchema = Schema(
  {
    userId: { type: mongoose.ObjectId, ref: 'User' },
    contact: { type: Object, required: true },
    shipTo: { type: Object, required: true },
    totalPrice: { type: Number, default: 0, required: true },
    status: { type: String, default: '준비 중' },
    items: [
      {
        bookId: { type: mongoose.ObjectId, ref: 'Book' },
        qty: { type: Number, default: 1, required: true },
        price: { type: Number, required: true },
      },
    ],
    orderNum: { type: String },
    request: {
      type: {
        requestType: { type: String, enum: ['반품', '교환', '취소'], default: null },
        status: { type: String, enum: ['대기 중', '승인', '거부'], default: '대기 중' },
        reason: { type: String, default: '' },
      },
      default: {},
    },
  },
  { timestamps: true },
);
orderSchema.methods.toJSON = function () {
  const obj = this._doc;
  delete obj.__v;
  return obj;
};

orderSchema.post('save', async function () {
  const cart = await Cart.findOne({ userId: this.userId });
  cart.items = [];
  await cart.save();
});
const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
