require('dotenv').config;
const axios = require('axios');
const qs = require('qs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { GoogleAuth, OAuth2Client } = require('google-auth-library');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const KAKAO_API_KEY = process.env.KAKAO_API_KEY;
const REDIRECT_KAKAO_CALLBACK = process.env.REDIRECT_KAKAO_CALLBACK;
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET_ID = process.env.GITHUB_CLIENT_SECRET_ID;

const authController = {};

authController.checkAdminPermission = async (req, res, next) => {
  try {
    const { userId } = req;
    const user = await User.findById(userId);
    if (user.level !== 'admin') throw new Error('no permission');
    next();
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

authController.loginWithEmail = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(403).json({ status: 'fail', message: '가입되지 않은 이메일입니다.' });
    }
    const isMatched = await bcrypt.compareSync(password, user.password);
    if (!isMatched) {
      return res.status(403).json({ status: 'fail', message: '비밀번호가 일치하지 않습니다.' });
    }
    const token = await user.generateToken();
    return res.status(200).json({ status: 'success', user, token });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

authController.loginWithGoogle = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      throw new Error('Token is missing');
    }
    const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
    const { data: ticket } = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const { email, name } = ticket;
    let user = await User.findOne({ email });

    if (!user) {
      const randomPassword = '' + Math.floor(Math.random() * 100000000);
      const salt = await bcrypt.genSalt(10);

      const newPassword = await bcrypt.hash(randomPassword, salt);
      user = new User({
        userName: name,
        email,
        password: newPassword,
      });
      await user.save();
    }
    const sessionToken = jwt.sign({ _id: user._id }, JWT_SECRET_KEY, { expiresIn: '1h' });
    return res.status(200).json({ status: 'success', user, token: sessionToken });
  } catch (error) {
    console.log('Error during Google login:', error);
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

authController.loginWithKakao = async (req, res, next) => {
  try {
    const kakaoToken = await axios({
      method: 'POST',
      url: 'https://kauth.kakao.com/oauth/token',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      data: qs.stringify({
        grant_type: 'authorization_code',
        client_id: KAKAO_API_KEY,
        redirectUri: REDIRECT_KAKAO_CALLBACK,
        code: req.query.code,
      }),
    });
    const kakaoUser = await axios({
      method: 'GET',
      url: 'https://kapi.kakao.com/v2/user/me',
      headers: {
        Authorization: `Bearer ${kakaoToken.data.access_token}`,
      },
    });

    const email = 'kakao' + kakaoUser.data.id;
    const user = await User.findOne({ email });

    req.user = user;
    req.email = email;
    req.kakaoAccessToken = kakaoToken.data.access_token;
    req.kakaoId = kakaoUser.data.id;
    req.userName = kakaoUser.data.properties.nickname;
    req.connectedAt = kakaoUser.data.connected_at;
  } catch (e) {
    req.statusCode = 400;
    req.error = e.message;
  }
  next();
};

// 깃허브 로그인 callback
authController.loginWithGithub = async (req, res, next) => {
  try {
    const { code } = req.query;
    const finalUrl = 'https://github.com/login/oauth/access_token';
    const body = {
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET_ID,
      code,
    };

    const { data: requestToken } = await axios.post(finalUrl, body, {
      headers: { Accept: 'application/json' },
    });
    const { access_token } = requestToken;

    // github api 서버로 요청보낼 주소
    const apiUrl = 'https://api.github.com';
    // 깃허브 유저 정보 받아오기
    const { data: userdata } = await axios.get(`${apiUrl}/user`, {
      headers: { Authorization: `token ${access_token}` },
    });

    // 깃허브 유저 이메일 정보 받아오기
    // const { data: emailDataArr } = await axios.get(`${apiUrl}/user/emails`, {
    //   headers: { Authorization: `token ${access_token}` },
    // });

    const { email, name } = userdata;
    const user = await User.findOne({ email });

    req.user = user;
    req.email = email;
    req.userName = name;
  } catch (e) {
    req.statusCode = 400;
    req.error = e.message;
  }
  next();
};

// 카카오 로그인
authController.loginWithKakao = async (req, res, next) => {
  try {
    const kakaoToken = await axios({
      method: 'POST',
      url: 'https://kauth.kakao.com/oauth/token',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      data: qs.stringify({
        grant_type: 'authorization_code',
        client_id: KAKAO_API_KEY,
        redirectUri: REDIRECT_KAKAO_CALLBACK,
        code: req.query.code,
      }),
    });
    const kakaoUser = await axios({
      method: 'GET',
      url: 'https://kapi.kakao.com/v2/user/me',
      headers: {
        Authorization: `Bearer ${kakaoToken.data.access_token}`,
      },
    });

    const email = 'kakao' + kakaoUser.data.id;
    const user = await User.findOne({ email });

    req.user = user;
    req.email = email;
    req.kakaoAccessToken = kakaoToken.data.access_token;
    req.kakaoId = kakaoUser.data.id;
    req.userName = kakaoUser.data.properties.nickname;
    req.connectedAt = kakaoUser.data.connected_at;
  } catch (e) {
    req.statusCode = 400;
    req.error = e.message;
  }
  next();
};

// 깃허브 로그인 callback
authController.loginWithGithub = async (req, res, next) => {
  try {
    const { code } = req.query;
    const finalUrl = 'https://github.com/login/oauth/access_token';
    const body = {
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET_ID,
      code,
    };

    const { data: requestToken } = await axios.post(finalUrl, body, {
      headers: { Accept: 'application/json' },
    });
    const { access_token } = requestToken;

    // github api 서버로 요청보낼 주소
    const apiUrl = 'https://api.github.com';
    // 깃허브 유저 정보 받아오기
    const { data: userdata } = await axios.get(`${apiUrl}/user`, {
      headers: { Authorization: `token ${access_token}` },
    });

    // 깃허브 유저 이메일 정보 받아오기
    // const { data: emailDataArr } = await axios.get(`${apiUrl}/user/emails`, {
    //   headers: { Authorization: `token ${access_token}` },
    // });

    const { email, name } = userdata;
    const user = await User.findOne({ email });

    req.user = user;
    req.email = email;
    req.userName = name;
  } catch (e) {
    req.statusCode = 400;
    req.error = e.message;
  }
  next();
};

authController.authenticate = async (req, res, next) => {
  try {
    const tokenString = req.headers.authorization;
    if (!tokenString) {
      throw new Error('Authentication token does not exist!');
    }
    const token = tokenString.replace('Bearer ', '');
    jwt.verify(token, JWT_SECRET_KEY, (error, payload) => {
      if (error) {
        return res.status(401).json({ status: 'fail', message: '로그인이 필요합니다!' });
      }
      req.userId = payload._id;
      next();
    });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

authController.checkAdminPermission = async (req, res, next) => {
  try {
    const { userId } = req;
    const user = await User.findById(userId);
    if (user.role !== 'admin') throw new Error('no permission');
    next();
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

authController.checkAdminPermission = async (req, res, next) => {
  try {
    const { userId } = req;
    const user = await User.findById(userId);
    if (user.role !== 'admin') throw new Error('no permission');
    next();
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

module.exports = authController;
