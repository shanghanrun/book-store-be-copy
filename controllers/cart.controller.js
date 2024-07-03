const Book = require('../models/Book');
const Cart = require('../models/Cart');
const User = require('../models/User');
const cartController = {};

cartController.addItemToCart = async (req, res) => {
  try {
    // 1. 정보 가져오기
    const { userId } = req;
    const { bookId, qty } = req.body;
    // 1.5 유저를 가지고 카트 찾기 카트가 없으면 새로 만들어 주기
    let cart = await Cart.findOne({ userId });
    // 카트가 없으면 새로 만들어 주기
    if (!cart) {
      cart = new Cart({ userId });
      await cart.save();
    }
    // 중복 항목 있으면 에러
    const existItem = cart.items.find((item) => item.bookId === bookId);

    if (existItem) {
      throw new Error('Item already exist.');
    }
    // 2. 새로운 아이템을 카트에 추가
    cart.items = [...cart.items, { bookId, qty }];
    await cart.save();
    res.status(200).json({ status: 'Success', data: cart, cartItemQty: cart.items.length });
  } catch (error) {
    return res.status(400).json({ status: 'Fail..', message: error.message });
  }
};

cartController.getCartList = async (req, res) => {
  try {
    const { userId } = req;

    // 사용자 정보 가져오기
    const user = await User.findById(userId);

    // 장바구니 항목 가져오기
    const cartList = await Cart.findOne({ userId }).populate({
      path: 'items',
      populate: {
        path: 'bookId',
        model: Book,
      },
    });

    if (!user || !cartList) {
      return res.status(404).json({ status: 'Fail', message: '사용자 또는 카트 정보를 불러올 수 없습니다.' });
    }

    // 사용자 정보와 장바구니 항목을 배열 형태로 응답해야 됨
    res.status(200).json({ status: 'Success', data: { user, items: cartList.items } });
  } catch (error) {
    return res.status(400).json({ status: 'Fail..', message: error.message });
  }
};

cartController.deleteCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;
    const cart = await Cart.findOne({ userId });
    cart.items = cart.items.filter((item) => !item._id.equals(id));

    await cart.save();
    res.status(200).json({ status: 'Success', cartItemQty: cart.items.length });
  } catch (error) {
    return res.status(400).json({ status: 'fail', error: error.message });
  }
};

cartController.editCartItem = async (req, res) => {
  try {
    const { userId } = req;
    const { id } = req.params;

    const { qty } = req.body;
    const cart = await Cart.findOne({ userId }).populate({
      path: 'items',
      populate: {
        path: 'bookId',
        model: Book,
      },
    });
    if (!cart) throw new Error('사용자와 해당되는 카트가 존재하지 않습니다.');
    const index = cart.items.findIndex((item) => item._id.equals(id));
    if (index === -1) throw new Error('해당되는 도서를 불러올 수 없습니다.');
    cart.items[index].qty = qty;
    await cart.save();
    res.status(200).json({ status: 'Success', data: cart.items });
  } catch (error) {
    return res.status(400).json({ status: 'fail', error: error.message });
  }
};

cartController.getCartQty = async (req, res) => {
  try {
    const { userId } = req;
    const cart = await Cart.findOne({ userId: userId });
    if (!cart) throw new Error('카트가 존재하지 않습니다.');
    res.status(200).json({ status: 'Success', qty: cart.items.length });
  } catch (error) {
    return res.status(400).json({ status: 'Fail', error: error.message });
  }
};

module.exports = cartController;
