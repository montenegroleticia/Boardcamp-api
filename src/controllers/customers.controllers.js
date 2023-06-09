import { db } from "../database/database.connection.js";

export async function getCustomers(req, res) {
  try {
    const customers = await db.query(`SELECT * FROM customers;`);
    customers.rows = customers.rows.map((c) => ({
      ...c,
      birthday: new Date(c.birthday).toISOString().split("T")[0],
    }));
    res.send(customers.rows);
  } catch (err) {
    res.send(err.message);
  }
}

export async function getCustomersById(req, res) {
  const { id } = req.params;

  try {
    const customer = await db.query(`SELECT * FROM customers WHERE id = $1;`, [
      id,
    ]);
    if (customer.rows.length < 1) return res.sendStatus(404);
    customer.rows = customer.rows.map((c) => ({
      ...c,
      birthday: new Date(c.birthday).toISOString().split("T")[0],
    }));
    res.send(customer.rows[0]);
  } catch (err) {
    res.send(err.message);
  }
}

export async function postCustomers(req, res) {
  const { name, phone, cpf, birthday } = req.body;

  try {
    const customer = await db.query(`SELECT * FROM customers WHERE cpf = $1;`, [
      cpf,
    ]);
    if (customer.rows.length > 0) return res.sendStatus(409);

    await db.query(
      `INSERT INTO customers (name, phone, cpf, birthday) VALUES ($1, $2, $3, $4);`,
      [name, phone, cpf, new Date(birthday).toISOString().split("T")[0]]
    );
    res.sendStatus(201);
  } catch (err) {
    res.send(err.message);
  }
}

export async function putCustomers(req, res) {
  const { id } = req.params;
  const { name, phone, cpf, birthday } = req.body;

  try {
    const customerFake = await db.query(
      `SELECT * FROM customers WHERE cpf = $1 AND id <> $2;`,
      [cpf, id]
    );
    if (customerFake.rows.length >= 1) return res.sendStatus(409);

    await db.query(
      `UPDATE customers SET name = $2, phone = $3, cpf = $4, birthday = $5 WHERE id = $1;`,
      [id, name, phone, cpf, new Date(birthday).toISOString().split("T")[0]]
    );
    res.sendStatus(200);
  } catch (err) {
    res.send(err.message);
  }
}
