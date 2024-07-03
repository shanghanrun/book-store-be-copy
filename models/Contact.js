const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contactSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    inquiryType: {
      type: String,
      enum: ['상품 문의', '재고 문의', '기타 유형'],
      required: true,
    },
    inquiryContent: {
      type: String,
      maxlength: 1000,
      required: true,
    },
    image: { type: String },
    emailReply: { type: Boolean, default: false },
    smsReply: { type: Boolean, default: false },
    privacyAgreement: { type: Boolean, required: true },
  },
  {
    timestamps: true,
  },
);

contactSchema.methods.toJSON = function () {
  const obj = this._doc;
  delete obj.__v;
  return obj;
};

const Contact = mongoose.model('Contact', contactSchema);
module.exports = Contact;
