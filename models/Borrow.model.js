import mongoose from "mongoose";
const Schema = mongoose.Schema;

const BorrowSchema = new Schema(
  {
    user: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
    },
    price: {
      type: Number,
      required: true,
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Books",
      required: true,
    },
    borrowedDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    returnDate: {
      type: Date,
      required: null,
    },
    fine: {
      type: Number,
      default: 0,
    },
    notfied: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Borrow = mongoose.model("Borrow", BorrowSchema);
