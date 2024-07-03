const Category = require('../models/Category');
const Book = require('../models/Book');

async function fetchCategories() {
  try {
    // 모든 카테고리 데이터를 조회합니다
    const categories = await Category.find({});
    const books = await Book.find({});

    // 중복을 제거하고 유니크한 categoryId를 가진 카테고리 데이터를 담을 Set을 생성합니다
    const uniqueCategoryNames = new Set();

    // 중복 제거된 카테고리 데이터를 담을 배열을 초기화합니다
    const uniqueCategories = [];

    // 모든 카테고리 데이터를 순회하며 중복을 제거합니다

    categories.forEach((category) => {
      if (!uniqueCategoryNames.has(category.categoryName)) {
        uniqueCategoryNames.add(category.categoryName);

        const booksByCategory = books
          .filter((book) => book.categoryId.toString() === category.categoryId)
          .map((book) => book._id); // 책의 ObjectId만 추가

        category.books = booksByCategory;
        uniqueCategories.push(category);
      }
    });

    // 기존 데이터를 모두 삭제합니다
    await Category.deleteMany({});

    // 중복 제거된 카테고리 데이터를 다시 저장합니다
    await Category.insertMany(uniqueCategories);

    console.log('중복 제거된 카테고리 데이터가 성공적으로 저장되었습니다.');
  } catch (error) {
    console.error('중복 제거된 카테고리 데이터 저장 중 오류:', error);
  }
}

module.exports = fetchCategories;
