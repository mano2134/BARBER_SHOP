const mongoose = require("mongoose");

const portfolioSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: false,
    trim: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  beforeImageUrl: {
    type: String,
    required: true,
  },
  afterImageUrl: {
    type: String,
    required: true,
  },
  fileIdBefore: {
    type: String,
    required: true,
  },
  fileIdAfter: {
    type: String,
    required: true,
  }
}, { timestamps: true });

const Portfolio = mongoose.model("Portfolio", portfolioSchema);

module.exports = Portfolio;
