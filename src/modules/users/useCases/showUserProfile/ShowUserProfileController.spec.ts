import { Connection } from "typeorm";
import request from "supertest";

import createConnection from "../../../../database";
import { app } from "../../../../app";

let connection: Connection;

const CREATE_URL = "/api/v1/users";
const AUTHENTICATE_URL = "/api/v1/sessions";
const SHOW_URL = "/api/v1/profile"

describe("Show User Profile", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  })

  it("should be able to show user profile", async () => {
    const userData = {
      name: "Name Test",
      email: "test@test.com",
      password: "test"
    };

    await request(app).post(CREATE_URL).send(userData);

    const responseAuthenticate = await request(app)
      .post(AUTHENTICATE_URL)
      .send({
        email: userData.email,
        password: userData.password
      });

    const { token } = responseAuthenticate.body

    const responseShow = await request(app)
      .get(SHOW_URL)
      .set("Authorization", `Bearer ${token}`);

    expect(responseShow.status).toBe(200)
    expect(responseShow.body).toHaveProperty("id");
  })

  it("should not be able show a non-existent user profile", async () => {
    
    const responseAuthenticate = await request(app)
      .post(AUTHENTICATE_URL)
      .send({
        email: "test@test.com",
        password: "test"
      })

    const { id } = responseAuthenticate.body.user;
    const { token } = responseAuthenticate.body;

    await connection.query("DELETE FROM users WHERE id = $1;", [id]);

    const responseShow = await request(app)
      .get(SHOW_URL)
      .set("Authorization", `Bearer ${token}`);

    expect(responseShow.status).toBe(404);
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })
});