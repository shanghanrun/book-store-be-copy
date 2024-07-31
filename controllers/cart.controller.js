const Book = require('../models/Book');
const Cart = require('../models/Cart');
const User = require('../models/User');
const cartController = {};
const mongoose = require('mongoose');

cartController.addItemToCart = async (req, res) => {
  try {
    // 1. 정보 가져오기
    const { userId } = req;
    const { bookId } = req.body;
    //!통신을 통해 들어오는 bookId는 ObjectId가 아니라 문자열이다.

    // 1.5 유저를 가지고 카트 찾기 카트가 없으면 새로 만들어 주기
    let cart = await Cart.findOne({ userId });
    // 해당 유저의 카트가 없으면 새로 만들어 주기
    if (!cart) {
      cart = new Cart({ userId });
      await cart.save();
    }
    // 중복 항목 있으면 에러
    //! 그런데 bookId를 사용할 때, 비교를 하기 위해서는 item.bookId.toString()
    const existItem = cart.items.find((item) => item.bookId.toString() === bookId);

    if (existItem) {
      throw new Error('Item already exist.');
    }
    // 2. 새로운 아이템을 카트에 추가
    cart.items = [...cart.items, { bookId, qty:1 }];
    await cart.save();
    
    res.status(200).json({ status: 'Success', data: cart, cartItemQty: cart.items.length });
  } catch (error) {
    return res.status(400).json({ status: 'Fail..', message: error.message });
  }
};

cartController.getCart = async (req, res) => {
  try {
    const { userId } = req;

    const cart = await Cart.findOne({userId}).populate('items.bookId').populate('userId')

    if (!cart) {
			return res.status(404).json({ status: 'fail', message: 'Cart not found' });
		}
    res.status(200).json({status:'success', data:cart, cartItemQty:cart?.items.length })
  } catch (error) {
    res.status(400).json({status:'fail', error:e.message})
  }
};
cartController.emptyCart = async(req, res)=>{
	try{
		const userId = req.userId
		const result = await Cart.deleteOne({userId}) //완전 삭제
		// const cart = await Cart.findOne({userId})
		// cart.items =[]
		// await cart.save();
		res.status(200).json({ status: 'ok', message: 'Cart emptied successfully' });
	}catch(e){
		res.status(400).json({ status: 'error', error: e.message });
	}
}

cartController.deleteCartItem = async (req, res) => {
  console.log('deleteCart 실행됨')
  try {
    const { bookId } = req.params;
    const { userId } = req;
    // bookId를 ObjectId로 변환
    const bookIdObject = new mongoose.Types.ObjectId(bookId);

    const cart = await Cart.findOne({ userId });
    cart.items = cart.items.filter((item) => !item.bookId.equals(bookIdObject));

    await cart.save();
    res.status(200).json({ status: 'Success', data:cart, cartItemQty: cart.items.length });
  } catch (error) {
    return res.status(400).json({ status: 'fail', error: error.message });
  }
};

cartController.updateCartItemQty = async (req, res) => {
  try {
    const { userId } = req; //authenticate에서 얻은 거라서 ObjectId
    const { bookId } = req.params; // URL에서 얻은 거라서 문자열
    const { qty } = req.body;// 요청바디에 보존된 객체라서 숫자타입유지됨

    //! 문자열로 들어온 경우 ObjectId로 변환 (bookId)
    const bookIdObject = new mongoose.Types.ObjectId(bookId);

    //! 그리고 아래에서 qty도 통신으로 들어오면 문자열이 되니, 정수로 변환해야 된다.
    const updatedCart = await Cart.findOneAndUpdate(
			{ userId, 'items.bookId': bookIdObject},
			{ $set: { 'items.$.qty': qty } },
			{ new: true }
		).populate('items.bookId').populate('userId');
		
		console.log('업데이트 된 카트:', updatedCart)

		if (!updatedCart) {
			return res.status(404).json({ status: 'fail', error: 'Cart not found or item not found in cart' });
		}
		
		res.status(200).json({status:'ok', data: updatedCart})
  } catch (e) {
    return res.status(400).json({ status: 'fail', error: e.message });
  }
};

cartController.getCartQty = async (req, res) => {
  // try {  이것 내것에 없다. 그래서 주석처리
  //   const { userId } = req;
  //   const cart = await Cart.findOne({ userId: userId });
  //   if (!cart) throw new Error('카트가 존재하지 않습니다.');
  //   res.status(200).json({ status: 'Success', qty: cart.items.length });
  // } catch (error) {
  //   return res.status(400).json({ status: 'Fail', error: error.message });
  // }
};

module.exports = cartController;
