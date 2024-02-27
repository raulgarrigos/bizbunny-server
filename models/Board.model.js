const mongoose = require("mongoose");

const boardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  lists: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "List",
    },
  ],
  owner: {
    type: String,
    required: true,
    trim: true,
  },
});

const Board = mongoose.model("Board", boardSchema);

module.exports = Board;
