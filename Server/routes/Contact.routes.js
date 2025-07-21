import express from "express";
import { contactUsController } from "../controllers/ContactUs.controller.js";

const router = express.Router();

router.post("/contact", contactUsController);

export default router;
