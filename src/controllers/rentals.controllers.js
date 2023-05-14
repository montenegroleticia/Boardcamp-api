import { db } from "../database/database.connection.js";

const now = new Date();
const day = String(now.getDate()).padStart(2, "0");
const month = String(now.getMonth() + 1).padStart(2, "0");
const year = String(now.getFullYear());
const date = new Date(`${year}-${month}-${day}`);

export async function getRentals(req, res) {
  try {
    const rentals = await db.query(
      `SELECT rentals.*, 
      customers.id AS "customerId", customers.name AS "customerName", 
      games.id AS "gameId", games.name AS "gameName" FROM rentals
      JOIN customers ON customers.id = rentals."customerId"
      JOIN games ON games.id = rentals."gameId";`
    );

    const getRentals = rentals.rows.map((item) => ({
      id: item.id,
      customerId: item.customerId,
      gameId: item.gameId,
      rentDate: item.rentDate,
      daysRented: item.daysRented,
      returnDate: item.returnDate,
      originalPrice: item.originalPrice,
      delayFee: item.delayFee,
      customer: {
        id: item.customerId,
        name: item.customerName,
      },
      game: {
        id: item.gameId,
        name: item.gameName,
      },
    }));
    res.send(getRentals);
  } catch (err) {
    res.send(err.message);
  }
}

export async function postRentals(req, res) {
  const { customerId, gameId, daysRented } = req.body;

  try {
    const customer = await db.query(`SELECT * FROM customers WHERE id = $1;`, [
      customerId,
    ]);
    if (customer.rows.length < 1) return res.sendStatus(400);

    const game = await db.query(`SELECT * FROM games WHERE id = $1;`, [
      customerId,
    ]);
    if (game.rows.length < 1) return res.sendStatus(400);

    const gameRentals = await db.query(
      `SELECT * FROM rentals WHERE "gameId"=$1;`,
      [gameId]
    );
    if (gameRentals.rows.length >= game.rows[0].stockTotal)
      return res.sendStatus(400);

    if (daysRented < 1) return res.sendStatus(400);

    const originalPrice = Number(daysRented) * game.rows[0].pricePerDay;

    await db.query(
      `INSERT INTO rentals ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee") VALUES ($1, $2, $3, $4, $5, $6, $7);`,
      [customerId, gameId, date, daysRented, null, originalPrice, null]
    );
    res.sendStatus(201);
  } catch (err) {
    res.send(err.message);
  }
}

export async function postRentalsReturn(req, res) {
  const { id } = req.params;

  try {
    const rental = await db.query(`SELECT * FROM rentals WHERE id = $1;`, [id]);
    if (rental.rows.length < 1) return res.sendStatus(404);

    if (rental.rows[0].returnDate !== null) return res.sendStatus(400);

    const game = await db.query(`SELECT * FROM games WHERE id = $1`, [
      rental.rows[0].gameId,
    ]);

    const delayTime = date.getTime() - rental.rows[0].rentDate.getTime();
    const delayDays = Math.ceil(delayTime / (1000 * 3600 * 24));
    const delayFee = delayDays * Number(game.rows[0].pricePerDay);

    await db.query(
      `UPDATE rentals SET "delayFee" = $1, "returnDate" = $2 WHERE id = $3;`,
      [delayFee, date, id]
    );

    res.sendStatus(200);
  } catch (err) {
    res.send(err.message);
  }
}

export async function deleteRentals(req, res) {
  const { id } = req.params;

  try {
    const rental = await db.query(`SELECT * FROM rentals WHERE id = $1;`, [id]);
    if (rental.rows.length < 1) return res.sendStatus(404);
    if (rental.rows[0].returnDate === null) return res.sendStatus(400);

    await db.query(`DELETE FROM rentals WHERE id = $1;`, [id]);
    res.sendStatus(200);
  } catch (err) {
    res.send(err.message);
  }
}
