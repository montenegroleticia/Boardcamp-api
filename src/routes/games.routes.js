import { Router } from "express";
import { getGames, postGames } from "../controllers/games.controllers.js";
import schemaValidation from "../middlewares/schemaValidation.middleware.js";
import { gameSchema } from "../schemas/game.schema.js";

const gamesRouter = Router();

gamesRouter.get("/games", getGames);
gamesRouter.post("/games", schemaValidation(gameSchema), postGames);

export default gamesRouter;
