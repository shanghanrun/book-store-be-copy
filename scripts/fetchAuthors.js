const Book = require('../models/Book');
const Author = require('../models/Author');

async function fetchAuthors() {
  try {
    // 모든 저자 데이터를 조회합니다
    const authors = await Author.find({});
    const books = await Book.find({});

    // 중복을 제거하고 유니크한 authorId를 가진 저자 데이터를 담을 Set을 생성합니다
    const uniqueAuthorNames = new Set();

    // 중복 제거된 저자 데이터를 담을 배열을 초기화합니다
    const uniqueAuthors = [];

    // 모든 저자 데이터를 순회하며 중복을 제거합니다

    authors.forEach((author) => {
      if (!uniqueAuthorNames.has(author.authorName)) {
        uniqueAuthorNames.add(author.authorName);

        const booksByAuthor = books
          .filter((book) => book.author.toString() === author.authorName)
          .map((book) => book._id); // 책의 ObjectId만 추가

        author.books = booksByAuthor;
        uniqueAuthors.push(author);
      }
    });

    // 기존 데이터를 모두 삭제합니다
    await Author.deleteMany({});

    // 중복 제거된 카테고리 데이터를 다시 저장합니다
    await Author.insertMany(uniqueAuthors);

    console.log('중복 제거된 저자 데이터가 성공적으로 저장되었습니다.');
  } catch (error) {
    console.error('중복 제거된 저자 데이터 저장 중 오류:', error);
  }
}

module.exports = fetchAuthors;
