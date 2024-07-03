const express = require('express');
const Order = require('../models/Order');
const bookController = require('../controllers/book.controller');
const { randomOrderNumGen } = require('../utils/randomOrderNumGen');

const orderController = {};

orderController.createOrder = async (req, res) => {
  try {
    const { userId } = req;
    const { totalPrice, shipTo, contact, orderList } = req.body;

    const newOrder = new Order({
      userId,
      totalPrice,
      shipTo,
      contact,
      items: orderList,
      orderNum: randomOrderNumGen(),
    });

    await newOrder.save();

    res.status(200).json({ status: 'success', newOrder, orderNum: newOrder.orderNum });
  } catch (error) {
    return res.status(400).json({ status: 'fail', error: error.message });
  }
};

orderController.getMyOrder = async (req, res) => {
  try {
    const { userId } = req;
    const orders = await Order.find({ userId }).populate({
      path: 'items.bookId',
      model: 'Book',
      select: 'title',
    });
    res.status(200).json({ status: 'success', orders });
  } catch (err) {
    return res.status(400).json({ status: 'fail', error: err.message });
  }
};

orderController.getOrderList = async (req, res) => {
  try {
    const { orderNum, userName, startDate, endDate } = req.query;
    const condition = {};
    if (orderNum) condition.orderNum = { $regex: orderNum, $options: 'i' };
    if (userName) condition['contact.name'] = { $regex: userName, $options: 'i' };
    if (startDate && endDate) {
      condition.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    const orders = await Order.find(condition)
      .populate('userId')
      .populate({
        path: 'items',
        populate: {
          path: 'bookId',
          model: 'Book',
          select: 'title',
        },
      });
    res.status(200).json({ status: 'Success', orders });
  } catch (err) {
    res.status(400).json({ status: 'fail', error: err.message });
  }
};

orderController.updateOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
    if (!order) throw new Error('주문을 찾을 수 없습니다.');
    res.status(200).json({ status: 'success' });
  } catch (err) {
    res.status(400).json({ status: 'fail', error: err.message });
  }
};

orderController.requestOrder = async (req, res) => {
  try {
    const { orderNum, requestType, reason } = req.body;
    console.log('req.body', req.body);
    const order = await Order.findOne({ orderNum });
    if (!order) throw new Error('주문을 찾을 수 없습니다.');
    order.request = { requestType, status: '대기 중', reason };
    await order.save();
    res.status(200).json({ status: 'success', order });
  } catch (err) {
    res.status(400).json({ status: 'fail', error: err.message });
  }
};

orderController.getRequestList = async (req, res) => {
  try {
    const { orderNum, userName, startDate, endDate } = req.query;
    const condition = {};
    if (orderNum) condition.orderNum = { $regex: orderNum, $options: 'i' };
    if (userName) condition['contact.name'] = { $regex: userName, $options: 'i' };
    if (startDate && endDate) {
      condition.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    const requests = await Order.find(condition)
      .populate('userId')
      .populate({
        path: 'items',
        populate: {
          path: 'bookId',
          model: 'Book',
          select: 'title',
        },
      });
    // const requests = await Order.find(condition);
    res.status(200).json({ status: 'success', requests });
  } catch (err) {
    res.status(400).json({ status: 'fail', error: err.message });
  }
};

orderController.getMyRequest = async (req, res) => {
  try {
    const { userId } = req;
    const requests = await Order.find({ userId });
    res.status(200).json({ status: 'success', requests });
  } catch (err) {
    return res.status(400).json({ status: 'fail', error: err.message });
  }
};

orderController.updateRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const { status } = req.body;
    const request = await Order.findByIdAndUpdate(requestId, { 'request.status': status }, { new: true });
    if (!request) throw new Error('주문문의를 찾을 수 없습니다.');
    res.status(200).json({ status: 'success' });
  } catch (err) {
    res.status(400).json({ status: 'fail', error: err.message });
  }
};

module.exports = orderController;
