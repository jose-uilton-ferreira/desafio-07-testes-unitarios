import { Connection } from "typeorm";
import request from "supertest";

import createConnection from "../../../../database";
import { app } from "../../../../app";

let connection: Connection;
let user_id: number;
let token: string;

const CREATE_USER_URL = "/api/v1/users";
const AUTHENTICATE_USER_URL = "/api/v1/sessions";
const STATEMENT_URL = "/api/v1/statements";

describe("Get Statement Operation", () => {
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
  })

  it("should be able to get a statement operation", async () => {
    const responseStatement = await request(app)
      .post(`${STATEMENT_URL}/deposit`)
      .send({
        amount: 100,
        description: "Deposit Statement Test"
      })
      .set("Authorization", `Bearer ${token}`);

    const statement = responseStatement.body;

    const responseGetStatement = await request(app)
      .get(`${STATEMENT_URL}/${statement.id}`)
      .set("Authorization", `Bearer ${token}`);
    
    expect(responseGetStatement.status).toBe(200);
    expect(responseGetStatement.body).toHaveProperty("id");
  })

  it("should not be able to get a non-existent statement operation", async () => {
    const fakeStatementId = "669a2dc8-c0d1-433f-bcbc-9242996c1ab5";

    const responseGetStatement = await request(app)
      .get(`${STATEMENT_URL}/${fakeStatementId}`)
      .set("Authorization", `Bearer ${token}`);
    
    expect(responseGetStatement.status).toBe(404);
  })

  it("should not be able to get a statement operation of a non-existent user", async () => {
    const responseStatement = await request(app)
      .post(`${STATEMENT_URL}/deposit`)
      .send({
        amount: 100,
        description: "Deposit Statement Test"
      })
      .set("Authorization", `Bearer ${token}`);

    await connection.query("DELETE FROM users WHERE id = $1", [user_id]);

    const statement = responseStatement.body;

    const responseGetStatement = await request(app)
      .get(`${STATEMENT_URL}/${statement.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(responseGetStatement.status).toBe(404);
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })
});