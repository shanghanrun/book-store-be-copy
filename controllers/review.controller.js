const Review = require('../models/Review');
const User = require('../models/User');
const reviewController = {};
const mongoose = require('mongoose');

// 댓글 추가
reviewController.addReview = async (req, res) => {
  try {
    if (!req.userId) {
      throw new Error('User not authenticated');
    }

    const { content, bookId } = req.body;
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const review = new Review({ userId, bookId, content });

    await review.save();
    res.status(201).json({ statue: 'success', review });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ status: 'fail', error: error.message });
  }
};

// 특정 제품의 댓글 조회
reviewController.getReviewsByBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const bookIdObject = new mongoose.Types.ObjectId(bookId)
    const reviews = await Review.find({ bookId: bookIdObject, isDeleted: false })
      .populate('userId')
      .sort({ createdAt: -1 }); // 생성날짜 내림차순(최신순)
    res.status(200).json({ status: 'success', reviews });
  } catch (error) {
    res.status(500).json({ status: 'fail', error: error.message });
  }
};

// 댓글 삭제
reviewController.deleteReview = async (req, res) => {
  try {
    if (!req.userId) {
      throw new Error('User not authenticated');
    }

    const { id } = req.params;
    const userId = req.userId;

    const review = await Review.findOne({ _id: id, userId });

    if (!review) {
      return res.status(404).json({ status: 'fail', message: 'Review not found or not authorized' });
    }

    review.isDeleted = true;
    await review.save();
    res.status(200).json({ status: 'success', message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ status: 'fail', error: error.message });
  }
};

reviewController.getMyReviews = async (req, res) => {
  try {
    const { userId } = req;
    const condition = { userId, isDeleted: false };
    const reviews = await Review.find(condition).populate('bookId');
    res.status(200).json({ status: 'success', reviews });
  } catch (err) {
    res.status(400).json({ status: 'fail', error: err.message });
  }
};

module.exports = reviewController;
