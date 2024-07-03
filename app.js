const express = require('express');
const axios = require('axios');
const RandomStringGenerator = require('./scripts/randomStringGenerator');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const session = require('express-session');
const Book = require('./models/Book');
const fetchNewBooks = require('./scripts/fetchNewBooks');
const fetchCategories = require('./scripts/fetchCategories');
const indexRouter = require('./routes/index');
const fetchAuthors = require('./scripts/fetchAuthors');

const app = express();

dotenv.config();
const COOKIE_SECRET = RandomStringGenerator.generateRandomString();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// app.use(cors());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(
  session({
    saveUninitialized: false,
    resave: false,
    secret: COOKIE_SECRET,
    cookie: { secure: true, sameSite: 'none', httpOnly: true },
  }),
);

// 몽고 디비 URI: 프로덕션 환경일 경우 MONGODB_URI_PROD (몽고 아틀라스), 아니면 로컬호스트.
// const MONGODB_URI = process.env.NODE_ENV === 'production' ? process.env.MONGODB_URI_PROD : process.env.CLOUD_DB;
const MONGODB_URI = process.env.CLOUD_DB;
console.log(MONGODB_URI);
mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log('mongoose connected');

    // 데이터베이스에 books Document가 있는 지 확인하고
    const bookCount = await Book.countDocuments();
    if (bookCount === 0) {
      // 없으면 도서를 불러온다
      console.log('No books found in database. Fetching books from external API.');
      await fetchNewBooks();
    } else {
      // 있으면 도서를 불러오지 않는다.
      console.log('Books already exist in the database. Skipping fetch.');
    }

    await fetchCategories();
    await fetchAuthors();

    app.get('/', (req, res) => {
      res.send('Hello BookDo7Stars!');
    });

    app.use('/api', indexRouter);

    // 서버 시작
    app.listen(process.env.PORT || 4000, () => {
      console.log(`Server is running on port 4000`);
    });
  })
  .catch((err) => {
    console.log('mongoose connection failed', err);
  });
