import { Connection } from "typeorm"
import request from "supertest";
import createConnection from "../../../../database"
import { app } from "../../../../app";

let connection: Connection;

const CREATE_URL = "/api/v1/users";

describe("Create User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  })

  it("should be able to create a new user", async () => {
    const userData = {
      name: "Name Test",
      email: "test@test.com",
      password: "test"
    };

    const response = await request(app)
      .post(CREATE_URL)
      .send(userData)
    
    expect(response.status).toBe(201);
  })

  it("should not be able to create a new user with existing email", async () => {
    const userData = {
      name: "Name Test",
      email: "test@test.com",
      password: "test"
    };

    await request(app).post(CREATE_URL).send(userData)
    const response = await request(app).post(CREATE_URL).send(userData);

    expect(response.status).toBe(400);
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })
})