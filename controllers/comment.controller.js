const Comment = require('../models/Comment');
const User = require('../models/User');
const commentController = {};
const mongoose = require('mongoose');

// 댓글 추가
commentController.addComment = async (req, res) => {
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

    const comment = new Comment({ userId, bookId, content });

    await comment.save();
    res.status(201).json({ statue: 'success', comment });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ status: 'fail', error: error.message });
  }
};

// 특정 제품의 댓글 조회
commentController.getCommentsByBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const bookIdObject = new mongoose.Types.ObjectId(bookId)
    const comments = await Comment.find({ bookId: bookIdObject, isDeleted: false })
      .populate('userId')
      .sort({ createdAt: -1 }); // 생성날짜 내림차순(최신순)
    res.status(200).json({ status: 'success', comments });
  } catch (error) {
    res.status(500).json({ status: 'fail', error: error.message });
  }
};

// 댓글 삭제
commentController.deleteComment = async (req, res) => {
  try {
    if (!req.userId) {
      throw new Error('User not authenticated');
    }

    const { id } = req.params;
    const userId = req.userId;

    const comment = await Comment.findOne({ _id: id, userId });

    if (!comment) {
      return res.status(404).json({ status: 'fail', message: 'Comment not found or not authorized' });
    }

    comment.isDeleted = true;
    await comment.save();
    res.status(200).json({ status: 'success', message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ status: 'fail', error: error.message });
  }
};

commentController.getMyComments = async (req, res) => {
  try {
    const { userId } = req;
    const condition = { userId, isDeleted: false };
    const comments = await Comment.find(condition).populate('bookId');
    res.status(200).json({ status: 'success', comments });
  } catch (err) {
    res.status(400).json({ status: 'fail', error: err.message });
  }
};

module.exports = commentController;
