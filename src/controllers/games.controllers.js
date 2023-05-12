import { db } from "../database/database.connection.js";

export async function getGames(req, res) {
  try {
    const games = await db.query(`SELECT * FROM games;`);
    res.send(games.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export async function postGames(req, res) {
  const { name, image, stockTotal, pricePerDay } = req.body;

  try {
    const newGame = await db.query(`SELECT * from games WHERE name = $1;`, [
      name,
    ]);
    if (newGame.rows.length > 0) return res.status(409);

    await db.query(
      `INSERT INTO games (name, image, "stockTotal", "pricePerDay") VALUES
        ($1, $2, $3, $4)
      ;`,
      [name, image, stockTotal, pricePerDay]
    );
    res.sendStatus(201);
  } catch (err) {
    res.status(500).send(err.message);
  }
}
