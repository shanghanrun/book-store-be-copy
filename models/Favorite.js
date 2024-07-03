const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const favoriteSchema = Schema(
  {
    userId: { type: mongoose.ObjectId, ref: 'User' },
    favorite: [{ type: mongoose.ObjectId, ref: 'Book' }],
  },
  { timestamps: true },
);

favoriteSchema.methods.toJSON = function () {
  const obj = this._doc;
  delete obj.__v;
  return obj;
};

const Favorite = mongoose.model('Favorite', favoriteSchema);
module.exports = Favorite;
