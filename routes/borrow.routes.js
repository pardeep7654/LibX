import { Router } from "express";
import {
  borrowedBooks,
  recordBorrowedBook,
  returnBorrowBook,
  getBorrowedBooksForAdmin,
} from "../controllers/borrow.controller.js";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/record-borrow-book/:id",isAuthenticated,isAuthorized("Admin"), recordBorrowedBook);
router.get("/borrowed-books-by-users",isAuthenticated,isAuthorized("Admin"), getBorrowedBooksForAdmin);
router.get("/borrowed-books",isAuthenticated,borrowedBooks);
router.put("/return-borrowed-book/:bookId",isAuthenticated,isAuthorized("Admin"), returnBorrowBook);

export default router;