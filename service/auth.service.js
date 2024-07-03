const User = require('../models/User');
const bcrypt = require('bcryptjs');

const authService = {};

// 이메일 로그인
authService.loginWithEmail = async (req, res, next) => {
  try {
    if (req.statusCode === 400) return next();

    const { user } = req;
    const token = await user.generateToken();

    req.statusCode = 200;
    req.token = token;
    req.data = user;
  } catch (e) {
    req.statusCode = 400;
    req.error = e.message;
  }
  next();
};

// 구글 로그인
authService.loginWithGoogle = async (req, res, next) => {
  try {
    if (req.statusCode === 400) return next();

    const { name, email } = req;
    let { user } = req;

    if (!user) {
      const randomPassword = '' + new Date();
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(randomPassword, salt);

      user = new User({
        email,
        password: hash,
        name,
        kind: 'google',
      });

      await user.save();
    }

    const token = await user.generateToken();

    req.statusCode = 200;
    req.token = token;
    req.data = user;
  } catch (e) {
    req.statusCode = 400;
    req.error = e.message;
  }
  next();
};

// 카카오 로그인
authService.loginWithKakao = async (req, res, next) => {
  try {
    if (req.statusCode === 400) return next();

    const { email, kakaoAccessToken, kakaoId, userName, connectedAt } = req;
    let { user } = req;

    if (!user) {
      const randomPassword = '' + new Date();
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(randomPassword, salt);
      user = new User({
        email,
        password: hash,
        userName,
        kakaoAccessToken,
        kakaoId,
        connectedAt,
        kind: 'kakao',
      });

      await user.save();
    }
    const token = await user.generateToken();

    req.statusCode = 200;
    req.token = token;
    req.data = user;
    req.social = true;
  } catch (e) {
    req.statusCode = 400;
    req.error = e.message;
  }
  next();
};

// 깃허브 로그인
authService.loginWithGithub = async (req, res, next) => {
  try {
    if (req.statusCode === 400) return next();

    const { email, userName } = req;
    let { user } = req;

    if (!user) {
      const randomPassword = '' + new Date();
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(randomPassword, salt);

      user = new User({
        email,
        password: hash,
        userName,
        kind: 'github',
      });

      await user.save();
    }

    const token = await user.generateToken();

    req.statusCode = 200;
    req.token = token;
    req.data = user;
    req.social = true;
  } catch (e) {
    req.statusCode = 400;
    req.error = e.message;
  }
  next();
};

// 로그아웃
authService.logout = async (req, res, next) => {
  try {
    if (req.statusCode === 400) return next();

    res.clearCookie('token', {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });

    req.statusCode = 200;
    req.data = 'success';
  } catch (e) {
    req.statusCode = 400;
    req.error = e.message;
  }
  next();
};

module.exports = authService;
