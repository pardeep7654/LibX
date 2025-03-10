import { isAuthenticated ,isAuthorized} from "../middlewares/authMiddleware.js";
import { Router } from "express";
import { addBook, getAllBooks, deleteBook } from "../controllers/book.controller.js";

const router = Router();

router.post("/add",isAuthenticated,isAuthorized("Admin"),addBook);
router.get("/all",isAuthenticated,getAllBooks);
router.delete("/delete/:id",isAuthenticated,isAuthorized("Admin"),deleteBook);

export default router;

