const Favorite = require('../models/Favorite');
const favController = {};

favController.getFavorite = async (req, res) => {
  try {
    const { userId } = req;
    let favorite = await Favorite.findOne({ userId }).populate({
      path: 'favorite',
      model: 'Book',
    });
    if (!favorite) {
      favorite = new Favorite({
        userId,
        favorite: [],
      });
      await favorite.save();
    }
    res.status(200).json({ status: 'success', favorite });
  } catch (err) {
    res.status(400).json({ status: 'fail', error: err.message });
  }
};

favController.addFavorite = async (req, res) => {
  try {
    const { userId } = req;
    const bookID = req.params.id;
    const favorite = await Favorite.findOneAndUpdate(
      { userId },
      { $push: { favorite: bookID } },
      { new: true, upsert: true },
    );
    res.status(200).json({ status: 'success', favorite });
  } catch (err) {
    res.status(400).json({ status: 'fail', error: err.message });
  }
};

favController.deleteFavorite = async (req, res) => {
  try {
    const { userId } = req;
    const bookID = req.params.id;
    const favorite = await Favorite.findOneAndUpdate({ userId }, { $pull: { favorite: bookID } }, { new: true });
    res.status(200).json({ status: 'success' });
  } catch (err) {
    res.status(400).json({ status: 'fail', error: err.message });
  }
};

module.exports = favController;
