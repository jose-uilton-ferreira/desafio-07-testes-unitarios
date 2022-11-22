import { Connection } from "typeorm";
import request from "supertest";

import createConnection from "../../../../database";
import { app } from "../../../../app";

let connection: Connection;
let user_id: number;
let token: string;

const CREATE_USER_URL = "/api/v1/users";
const AUTHENTICATE_USER_URL = "/api/v1/sessions";
const CREATE_STATEMENT_URL = "/api/v1/statements";
const BALANCE_URL = "/api/v1/statements/balance";

describe("Get Balance Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const userData = {
      name: "Name Test",
      email: "test@test.com",
      password: "test"
    };

    await request(app).post(CREATE_USER_URL).send(userData);

    const responseAuthenticate = await request(app)
      .post(AUTHENTICATE_USER_URL)
      .send({
        email: userData.email,
        password: userData.password
      });
    
    user_id = responseAuthenticate.body.user.id;
    token = responseAuthenticate.body.token;
  });

  it("should be able to get balance", async () => {
    const responseDeposit = await request(app)
      .post(`${CREATE_STATEMENT_URL}/deposit`)
      .send({
        amount: 200.00,
        description: "Deposit Statement Test"
      })
      .set("Authorization", `Bearer ${token}`);
    
    const responseWithdraw = await request(app)
      .post(`${CREATE_STATEMENT_URL}/withdraw`)
      .send({
        amount: 50.00,
        description: "Withdraw Statement Test"
      })
      .set("Authorization", `Bearer ${token}`);

    const responseBalance = await request(app)
      .get(BALANCE_URL)
      .set("Authorization", `Bearer ${token}`);

    const balance = responseBalance.body;

    expect(responseBalance.status).toBe(200);
    expect(balance.balance).toBe(150);
    expect(balance.statement.length).toEqual(2);
  });

  it("should not be able to get balance of a non-existent user", async () => {
    await connection.query("DELETE FROM users WHERE id = $1", [user_id]);

    const responseBalance = await request(app)
      .get(BALANCE_URL)
      .set("Authorization", `Bearer ${token}`);

    expect(responseBalance.status).toBe(404);
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });
});