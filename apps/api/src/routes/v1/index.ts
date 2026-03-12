import { Router } from "express";
import authRouter from "./auth.js";
import blogRouter from "./blog.js";
import contactRouter from "./contact.js";
import scraperRouter from "./scraper.js";
import leadsRouter from "./leads.js";
import clientsRouter from "./clients.js";
import projectsRouter from "./projects.js";
import analyticsRouter from "./analytics.js";
import contractsRouter from "./contracts.js";
import invoicesRouter from "./invoices.js";
import ticketsRouter from "./tickets.js";
import usersRouter from "./users.js";
import portalRouter from "./portal.js";

const v1Router = Router();

v1Router.use("/auth", authRouter);
v1Router.use("/blog", blogRouter);
v1Router.use("/contact", contactRouter);
v1Router.use("/scraper", scraperRouter);
v1Router.use("/leads", leadsRouter);
v1Router.use("/clients", clientsRouter);
v1Router.use("/projects", projectsRouter);
v1Router.use("/analytics", analyticsRouter);
v1Router.use("/contracts", contractsRouter);
v1Router.use("/invoices", invoicesRouter);
v1Router.use("/tickets", ticketsRouter);
v1Router.use("/users", usersRouter);
v1Router.use("/portal", portalRouter);

export default v1Router;
