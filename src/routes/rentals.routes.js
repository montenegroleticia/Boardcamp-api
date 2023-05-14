import { Router } from "express";
import {
  deleteRentals,
  getRentals,
  postRentals,
  postRentalsReturn,
} from "../controllers/rentals.controllers.js";

const rentalsRouter = Router();

rentalsRouter.get("/rentals", getRentals);
rentalsRouter.post("/rentals", postRentals);
rentalsRouter.post("/rentals/:id/return", postRentalsReturn);
rentalsRouter.delete("/rentals/:id", deleteRentals);

export default rentalsRouter;
