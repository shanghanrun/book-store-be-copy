const mongoose = require('mongoose');
const Book = require('../models/Book');
const Category = require('../models/Category');
const bookController = {};

// bookController.getBookList = async(req,res)=>{
//   try {
//     const { query } = req.query;
//     console.log('getBookList query', query)
//     const condition = { deleted: { $ne: true } };

//     if (query) {
//       // 쿼리 매개변수로 필터링 조건을 설정합니다.
//       condition.title = new RegExp(query, 'i'); // 예를 들어 제목으로 검색
//     }

//     const books = await Book.find(condition);
//     res.json({ books });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// }

bookController.getAllBooks = async (req, res) => {
  try {
    const { total, isbn, title, author, publisher, queryType, categoryId } = req.query;
    // console.log('getAllBooks total', total)
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

    // const books = await Book.aggregate([
    //   { $match: condition },
    //   {
    //     $group: {
    //       _id: '$isbn',
    //       docs: { $first: '$$ROOT' },
    //       count: { $sum: 1 },
    //     },
    //   },
    //   { $match: { count: { $eq: 1 } } },
    //   { $unwind: '$docs' },
    //   { $replaceRoot: { newRoot: '$docs' } },
    // ]);
    // res.status(200).json({ status: 'success', books });

    //! 위의 복잡한 내용대신에 set을 이용한다.
    // 모든 도서 목록을 가져옵니다
    const books = await Book.find(condition);

    // ISBN을 기준으로 중복을 제거합니다
    const seenIsbn = new Set();
    const uniqueBooks = books.filter(book => {
      if (seenIsbn.has(book.isbn)) {
        return false; // 중복된 ISBN은 제외. 해당 book은 uniqueBooks에 담지 않음
      } else {
        seenIsbn.add(book.isbn);
        return true; // 새로 추가된 ISBN은 포함
      }
    });

    res.status(200).json({ status: 'success', books: uniqueBooks });
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
    const idObject = new mongoose.Types.ObjectId(id)
    const book = await Book.findById(idObject);

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

    console.log('bookDetail response', response)

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
