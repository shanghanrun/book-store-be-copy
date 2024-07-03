const express = require('express');
const Category = require('../models/Category');
const categoryController = {};

categoryController.getAllCategories = async (req, res) => {
  try {
    // 실제 데이터를 가져오기 위해 await 키워드를 추가
    const categories = await Category.find({});

    if (!categories || categories.length === 0) {
      return res.status(404).json({ message: 'No categories are found!' });
    }
    return res.status(200).json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error by getting category', err });
  }
};

module.exports = categoryController;
