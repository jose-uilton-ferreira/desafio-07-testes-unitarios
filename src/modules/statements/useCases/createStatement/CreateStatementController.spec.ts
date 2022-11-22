import { Connection } from "typeorm";
import request from "supertest";

import createConnection from "../../../../database";
import { app } from "../../../../app";

let connection: Connection;
let user_id: string;
let token: string;

const CREATE_USER_URL = "/api/v1/users";
const AUTHENTICATE_URL = "/api/v1/sessions"
const CREATE_STATEMENT_URL = "/api/v1/statements/";

describe("Create Statement Controller", () => {
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
      .post(AUTHENTICATE_URL)
      .send({
        email: userData.email,
        password: userData.password
      });
    
    user_id = responseAuthenticate.body.user.id;
    token = responseAuthenticate.body.token;
  });

  it("should be able to create a new deposit", async () => {
    const responseDeposit = await request(app)
      .post(`${CREATE_STATEMENT_URL}/deposit`)
      .send({
        amount: 100.00,
        description: "Deposit Statement Test"
      })
      .set("Authorization", `Bearer ${token}`);

    expect(responseDeposit.status).toBe(201);
    expect(responseDeposit.body).toHaveProperty("id");
  })

  it("should be able to create a new withdraw", async () => {
    const responseWithdraw = await request(app)
      .post(`${CREATE_STATEMENT_URL}/withdraw`)
      .send({
        amount: 50.00,
        description: "Withdraw Statement Test"
      })
      .set("Authorization", `Bearer ${token}`);

    expect(responseWithdraw.status).toBe(201);
    expect(responseWithdraw.body).toHaveProperty("id");
  })

  it("should not be able to create a withdraw more than the balance", async () => {
    const responseWithdraw = await request(app)
      .post(`${CREATE_STATEMENT_URL}/withdraw`)
      .send({
        amount: 500.00,
        description: "Withdraw Statement Test"
      })
      .set("Authorization", `Bearer ${token}`);

    expect(responseWithdraw.status).toBe(400);
  })

  it("should not be able to create a new statement to a non-existent user", async () => {
    await connection.query("DELETE FROM users WHERE id = $1", [user_id]);

    const responseDeposit = await request(app)
      .post(`${CREATE_STATEMENT_URL}/deposit`)
      .send({
        amount: 100.00,
        description: "Deposit Statement Test"
      })
      .set("Authorization", `Bearer ${token}`);

    expect(responseDeposit.status).toBe(404);
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })
})