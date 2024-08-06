const express = require('express');
const {
  getAllBooks,
  getBookList,
  getBooksByCategory,
  deleteBook,
  updateBook,
  addBook,
  getBookDetailById,
  getBooksByGroup,
} = require('../controllers/book.controller');
const { authenticate, checkAdminPermission } = require('../controllers/auth.controller');

const router = express.Router();

router.get('/', getAllBooks); // 모든 책
// router.get('/search', getBookList); // getBookList(query)인 경우
router.delete('/:id', authenticate, checkAdminPermission, deleteBook); // 어드민 권한 추가
router.put('/:id', authenticate, checkAdminPermission, updateBook); // 어드민 권한 추가
router.post('/', authenticate, checkAdminPermission, addBook); // 어드민 권한 추가
router.get('/category/:categoryId', getBooksByCategory);
router.get('/group/:queryType', getBooksByGroup);

router.get('/detail/:id', getBookDetailById);

module.exports = router;
