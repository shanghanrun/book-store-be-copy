const express = require('express');
const {
  getAllBooks,
  getBooksByCategory,
  deleteBook,
  updateBook,
  addBook,
  getBookDetailById,
  getBooksByGroup,
} = require('../controllers/book.controller');
const { authenticate, checkAdminPermission } = require('../controllers/auth.controller');

const router = express.Router();

router.get('/', getAllBooks);
router.delete('/:id', authenticate, checkAdminPermission, deleteBook); // 어드민 권한 추가
router.put('/:id', authenticate, checkAdminPermission, updateBook); // 어드민 권한 추가
router.post('/', authenticate, checkAdminPermission, addBook); // 어드민 권한 추가
router.get('/category/:categoryId', getBooksByCategory);
router.get('/group/:queryType', getBooksByGroup);

router.get('/detail/:id', getBookDetailById);

module.exports = router;
