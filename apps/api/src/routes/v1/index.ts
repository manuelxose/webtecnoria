import { Router } from "express";
import authRouter from "./auth.js";
import blogRouter from "./blog.js";
import contactRouter from "./contact.js";
import scraperRouter from "./scraper.js";

const v1Router = Router();

v1Router.use("/auth", authRouter);
v1Router.use("/blog", blogRouter);
v1Router.use("/contact", contactRouter);
v1Router.use("/scraper", scraperRouter);

export default v1Router;
