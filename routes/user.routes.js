import { Router } from "express";
import {getAllUsers,registerNewAdmin} from "../controllers/user.controller.js";
import {isAuthenticated,isAuthorized} from "../middlewares/authMiddleware.js";

const router=Router();

router.get("/all",isAuthenticated,isAuthorized("Admin"),getAllUsers);
router.post("/add/new-admin",isAuthenticated,isAuthorized("Admin"),registerNewAdmin);

export default router;