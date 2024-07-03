const mongoose = require('mongoose');
const Book = require('../models/Book');
const Category = require('../models/Category');
const bookController = {};

bookController.getAllBooks = async (req, res) => {
  try {
    const { total, isbn, title, author, publisher, queryType, categoryId } = req.query;
    let condition = { deleted: { $ne: true } };

    if (total)
      condition = {
        $and: [
          condition,
          {
            $or: [
              { isbn: { $regex: total, $options: 'i' } },
              { title: { $regex: total, $options: 'i' } },
              { author: { $regex: total, $options: 'i' } },
              { publisher: { $regex: total, $options: 'i' } },
              { queryType: { $regex: total, $options: 'i' } },
              { categoryId: { $regex: total, $options: 'i' } },
            ],
          },
        ],
      };
    if (isbn) condition.isbn = { $regex: isbn, $options: 'i' };
    if (title) condition.title = { $regex: title, $options: 'i' };
    if (author) condition.author = { $regex: author, $options: 'i' };
    if (publisher) condition.publisher = { $regex: publisher, $options: 'i' };
    if (queryType) condition.queryType = { $regex: queryType, $options: 'i' };
    if (categoryId) condition.categoryId = { $regex: categoryId, $options: 'i' };
    const books = await Book.aggregate([
      { $match: condition },
      {
        $group: {
          _id: '$isbn',
          docs: { $first: '$$ROOT' },
          count: { $sum: 1 },
        },
      },
      { $match: { count: { $eq: 1 } } },
      { $unwind: '$docs' },
      { $replaceRoot: { newRoot: '$docs' } },
    ]);
    res.status(200).json({ status: 'success', books });
  } catch (err) {
    res.status(400).json({ status: 'fail', error: err.message });
  }
};

bookController.deleteBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    const book = await Book.findByIdAndUpdate(bookId, { deleted: true }, { new: true });
    if (!book) throw new Error('도서 상품을 찾을 수 없습니다.');
    res.status(200).json({ status: 'success' });
  } catch (err) {
    res.status(400).json({ status: 'fail', error: err.message });
  }
};

bookController.addBook = async (req, res) => {
  try {
    const { isbn, title, author, categoryName, publisher, cover, description, priceStandard, priceSales, stockStatus } =
      req.body;
    const book = new Book({
      isbn,
      title,
      author,
      categoryName,
      publisher,
      cover,
      description,
      priceStandard,
      priceSales,
      stockStatus,
    });
    await book.save();
    res.status(200).json({ status: 'success', book });
  } catch (err) {
    res.status(400).json({ status: 'fail', error: err.message });
  }
};

bookController.updateBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    const { isbn, title, author, categoryName, publisher, cover, description, priceStandard, priceSales, stockStatus } =
      req.body;
    const book = await Book.findByIdAndUpdate(
      bookId,
      { isbn, title, author, categoryName, publisher, cover, description, priceStandard, priceSales, stockStatus },
      { new: true },
    );
    if (!book) throw new Error('도서 상품을 찾을 수 없습니다.');
    res.status(200).json({ status: 'success' });
  } catch (err) {
    res.status(400).json({ status: 'fail', error: err.message });
  }
};

bookController.getBooksByCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const category = await Category.findOne({ categoryId }).populate({
      path: 'books',
      model: 'Book',
    });

    if (!category) {
      return res.status(404).json({ message: 'No books are found!' });
    }

    let response = {
      status: 'success',
      data: category.books,
    };
    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error by getting book by Category', err });
  }
};
bookController.getBookDetailById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid ID format');
    }
    const book = await Book.findById(id);

    // 작가 이름을 기반으로 작가를 찾고, 작가의 다른 책들을 가져옴
    const authorNames = book.author;
    const bookIsbn = book.isbn;
    const authorBooks = await Book.find({
      author: { $in: authorNames },
      isbn: { $ne: bookIsbn },
      _id: { $ne: id },
    });

    let response = {
      status: 'success',
      data: {
        book: book,
        otherBooksByAuthor: authorBooks,
      },
    };

    if (!book) throw new Error('No item found');
    res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({ status: 'fail', error: error.message });
  }
};
bookController.getBooksByGroup = async (req, res) => {
  try {
    const queryType = req.params.queryType;
    const categoryQuery = req.query.query.categoryQuery;

    let query = { queryType: queryType };

    // categoryQuery가 존재하면 카테고리 경로를 쿼리에 추가
    if (categoryQuery) {
      // categoryName 필드가 categoryPath 배열의 요소들을 포함하는 문서들을 찾음
      query.categoryName = { $regex: categoryQuery, $options: 'i' };
    }
    // MongoDB에서 책들을 찾음
    const books = await Book.find(query);

    return res.status(200).json({ status: 'success', books });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error by getting book', err });
  }
};

module.exports = bookController;
