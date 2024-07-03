const User = require('../models/User');
const bcrypt = require('bcryptjs');

const userController = {};

userController.createUser = async (req, res) => {
  try {
    let { userName, email, password, role, level, address, phone } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ status: 'fail', error: '이미 존재하는 이메일입니다.' });
    }
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);

    user = new User({
      userName,
      email,
      password,
      role: role || 'customer',
      level: level || 'bronze',
      address,
      phone,
    });
    await user.save();
    return res.status(200).json({ status: 'success', user });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

userController.getUser = async (req, res) => {
  try {
    const { userId } = req;
    const user = await User.findById(userId);
    if (user) {
      return res.status(200).json({ status: 'success', user });
    } else {
      return res.status(400).json({ status: 'error', error: 'Invalid token 실패!!' });
    }
  } catch (err) {
    res.status(400).json({ status: 'error', error: err.message });
  }
};

userController.getAllAdmin = async (req, res) => {
  try {
    const users = await User.find({ role: 'admin' });
    return res.status(200).json({ status: 'success', users });
  } catch (error) {
    res.status(400).json({ status: 'error', error: error.message });
  }
};

userController.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json({ status: 'success', users });
  } catch (error) {
    res.status(400).json({ status: 'error', error: error.message });
  }
};

userController.updateLevel = async (req, res) => {
  try {
    const { id } = req.params; // URL 경로에서 id를 추출
    const { level } = req.body;

    // 사용자 레벨 업데이트
    const user = await User.findByIdAndUpdate(id, { level }, { new: true });
    if (!user) throw new Error("User doesn't exist");

    res.status(200).json({ status: 'Success', user });
  } catch (error) {
    res.status(400).json({ status: 'error', error: error.message });
  }
};

userController.myPageConfirmPassword = async (req, res) => {
  try {
    const { userId } = req;
    const { password } = req.body;
    const user = await User.findById(userId);
    if (!user) throw new Error('회원을 찾을 수 없습니다.');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('비밀번호가 일치하지 않습니다.');
    res.status(200).json({ status: 'success' });
  } catch (err) {
    res.status(400).json({ status: 'error', error: err.message });
  }
};

userController.changeUserInfo = async (req, res) => {
  try {
    const { userId } = req;
    const { password, zipCode, address1, address2, phone } = req.body;
    const updateFields = {};
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateFields.password = await bcrypt.hash(password, salt);
    }
    if (zipCode || address1 || address2) {
      updateFields.address = {};
      if (zipCode) updateFields.address.zipCode = zipCode;
      if (address1) updateFields.address.address1 = address1;
      if (address2) updateFields.address.address2 = address2;
    }
    if (phone) updateFields.phone = phone;
    const updatedUser = await User.findByIdAndUpdate(userId, updateFields, { new: true });
    if (!updatedUser) throw new Error('회원을 찾을 수 없습니다.');
    res.status(200).json({ status: 'success', updatedUser });
  } catch (err) {
    res.status(400).json({ status: 'error', error: err.message });
  }
};

userController.deleteUser = async (req, res) => {
  try {
    const { userId } = req;
    const { password } = req.body;
    const user = await User.findById(userId);
    if (!user) throw new Error('회원을 찾을 수 없습니다.');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('비밀번호가 일치하지 않습니다.');
    await User.findByIdAndDelete(userId);
    res.status(200).json({ status: 'success' });
  } catch (err) {
    res.status(400).json({ status: 'error', error: err.message });
  }
};

module.exports = userController;
