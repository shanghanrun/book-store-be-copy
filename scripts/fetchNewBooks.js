const axios = require('axios');
const mongoose = require('mongoose');
const Book = require('../models/Book');
const dotenv = require('dotenv');
const Category = require('../models/Category');
const Author = require('../models/Author');
dotenv.config();

async function fetchNewBooks() {
  let page = 1;
  try {
    // 쿼리 별로 도서 불러오기
    await fetchBooks(page, 'ItemNewAll');
    await fetchBooks(page, 'ItemNewSpecial');
    await fetchBooks(page, 'BestSeller');
    await fetchBooks(page, 'BlogBest');

    console.log('Books fetched and saved successfully.');
  } catch (error) {
    console.error('Error fetching books:', error);
  }
}

// 도서 불러오는 함수 axios call
async function fetchBooks(page, queryType) {
  // 어떤 쿼리가 실행되는지 알기 위한 콘솔 로그
  // 페이지당 50개씩 나온다. 전체 도서목록을 불러오기 위해서는 페이지가 변수로 들어가서 현재 페이지가 전체 페이지 수보다 작을 경우 계속 axios콜이 실행된다.
  const TTBKEY = process.env.TTBKEY;
  do {
    const response = await axios.get(
      `http://www.aladin.co.kr/ttb/api/ItemList.aspx?ttbkey=${TTBKEY}&QueryType=${queryType}&Cover=Big&MaxResults=50&start=${page}&SearchTarget=Book&output=js&Version=20131101`,
    );
    const books = response.data.item;
    totalResults = response.data.totalResults;
    itemsPerPage = response.data.itemsPerPage;

    for (const book of books) {
      const newBook = new Book(book);
      newBook.queryType = queryType;
      await newBook.save();

      // 카테고리 데이터 만들어서 저장하기
      const category = {
        categoryId: book.categoryId,
        categoryName: book.categoryName,
        books: [],
      };
      const newCategory = new Category(category);
      await newCategory.save();

      // 저자 데이터 만들어서 저장하기
      const author = {
        authorName: book.author,
        books: [],
      };
      const newAuthor = new Author(author);
      await newAuthor.save();
    }
    page += 1;
  } while (page < Math.ceil(totalResults / itemsPerPage));
}

module.exports = fetchNewBooks;
