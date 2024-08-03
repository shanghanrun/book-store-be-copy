const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller'); // 로그인 확인
const reviewController = require('../controllers/review.controller');

// 댓글 추가
router.post('/', authController.authenticate, reviewController.addReview);

// 특정 제품의 댓글 조회
router.get('/book/:bookId', reviewController.getReviewsByBook);

// 댓글 삭제
router.delete('/:id', authController.authenticate, reviewController.deleteReview);

router.get('/', authController.authenticate, reviewController.getMyReviews);

module.exports = router;
