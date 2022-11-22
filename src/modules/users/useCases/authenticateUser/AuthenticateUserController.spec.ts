import { Connection } from "typeorm";
import request from "supertest";

import createConnection from "../../../../database";
import { app } from "../../../../app";

let connection: Connection;

const CREATE_URL = "/api/v1/users";
const AUTHENTICATE_URL = "/api/v1/sessions";

describe("Authenticate User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  })

  it("should be able to authenticate a user", async () => {
    const userData = {
      name: "Name Test",
      email: "test@test.com",
      password: "test"
    };

    await request(app)
      .post(CREATE_URL)
      .send(userData);

    const responseAuthenticate = await request(app)
      .post(AUTHENTICATE_URL)
      .send({
        email: userData.email,
        password: userData.password,
      });

    expect(responseAuthenticate.status).toBe(200);
    expect(responseAuthenticate.body).toHaveProperty("token");
    expect(responseAuthenticate.body.user).toHaveProperty("id");
  })

  it("should not be able to authenticate a user with non-existent email", async () => {
    const responseAuthenticate = await request(app)
      .post(AUTHENTICATE_URL)
      .send({
        email: "nonexistent@test.com",
        password: "test"
      })
    
    expect(responseAuthenticate.status).toBe(401);
  })

  it("should not be able to authenticate a user with incorrect password", async () => {
    const responseAuthenticate = await request(app)
      .post(AUTHENTICATE_URL)
      .send({
        email: "test@test.com",
        password: "incorrect"
      })

    expect(responseAuthenticate.status).toBe(401);
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })
})