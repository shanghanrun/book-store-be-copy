const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: function () {
        return this.role !== 'admin';
      },
      unique: true,
    },
    password: {
      type: String,
      required: function () {
        return this.role !== 'admin';
      },
    },
    userName: { type: String, required: true },
    role: { type: String, default: 'customer' }, //2types: customer, admin
    level: { type: String, default: 'bronze' }, //4types: bronze, silver, gold, platinum
    address: { type: Object },
    deliveryAddress:{type:String, default:''},
    phone: { type: String },
  },
  { timestamps: true },
);

userSchema.methods.toJSON = function () {
  const obj = this._doc;
  delete obj.password;
  delete obj.__v;
  delete obj.updatedAt;
  return obj;
};

userSchema.methods.generateToken = function () {
  const token = jwt.sign({ _id: this._id }, JWT_SECRET_KEY, { expiresIn: '1d' });
  return token;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
