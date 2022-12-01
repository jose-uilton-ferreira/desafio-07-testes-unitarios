import request from "supertest";
import { Connection } from "typeorm";

import createConnection from "../../../../database/index";
import { app } from "../../../../app";

interface IUserInfo {
  id: string;
  token: string;
} 

const CREATE_USER_URL = "/api/v1/users";
const AUTHENTICATE_USER_URL = "/api/v1/sessions";
const DEPOSIT_STATEMENT_URL = "/api/v1/statements/deposit";
const TRANSFER_STATEMENT_URL = "/api/v1/statements/transfers";

let connection: Connection;
let senderUser: IUserInfo;
let receiverUser: IUserInfo;

describe("Create Transfer Statement Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app)
      .post(CREATE_USER_URL)
      .send({
        name: "Marc Flores",
        email: "erbed@zez.bj",
        password: "641684"
      })

    await request(app)
      .post(CREATE_USER_URL)
      .send({
        name: "Sadie Yates",
        email: "jiib@riboz.edu",
        password: "065068"
      });

    const senderAuthenticateResponse = await request(app)
      .post(AUTHENTICATE_USER_URL)
      .send({
        email: "erbed@zez.bj",
        password: "641684"
      });

    const receiverAuthenticateResponse = await request(app)
      .post(AUTHENTICATE_USER_URL)
      .send({
        email: "jiib@riboz.edu",
        password: "065068"
      });

    senderUser = {
      id: senderAuthenticateResponse.body.user.id,
      token: senderAuthenticateResponse.body.token
    };

    receiverUser = {
      id: receiverAuthenticateResponse.body.user.id,
      token: receiverAuthenticateResponse.body.token
    }

    await request(app)
      .post(DEPOSIT_STATEMENT_URL)
      .send({
        amount: 100,
        description: "Deposit Test"
      })
      .set("Authorization", `Bearer ${senderUser.token}`);
  })  

  it("should be able to create a new transfer statement", async () => {
    const responseTransfer = await request(app)
      .post(`${TRANSFER_STATEMENT_URL}/${receiverUser.id}`)
      .send({
        amount: 50,
        description: "Transfer Statement Test"
      })
      .set("Authorization", `Bearer ${senderUser.token}`)

    expect(responseTransfer.status).toBe(201);
    expect(responseTransfer.body).toHaveProperty("id");
  })

  it("should not be able to create a new transfer if sender balance less than transfer amount", 
    async () => {
      const responseTransfer = await request(app)
        .post(`${TRANSFER_STATEMENT_URL}/${receiverUser.id}`)
        .send({
          amount: 9999,
          description: "Transfer amount more than sender balance"
        })
        .set("Authorization", `Bearer ${senderUser.token}`);

      expect(responseTransfer.status).toBe(400);
      expect(responseTransfer.body.message).toBe("Insufficient Funds");
    }
  );

  it("should not be able to create a new transfer if receiver does not exist", async () => {
    await connection.query("DELETE FROM users WHERE id = $1", [receiverUser.id]);

    const responseTransfer = await request(app)
      .post(`${TRANSFER_STATEMENT_URL}/${receiverUser.id}`)
      .send({
        amount: 1,
        description: "Receiver no longer exists"
      })
      .set("Authorization", `Bearer ${senderUser.token}`);

    expect(responseTransfer.status).toBe(404);
    expect(responseTransfer.body.message).toBe("Receiver not found");

  })

  it("should not be able to create a new transfer if sender does not exist", async () => {
    await connection.query("DELETE FROM users WHERE id = $1", [senderUser.id]);

    const responseTransfer = await request(app)
      .post(`${TRANSFER_STATEMENT_URL}/${receiverUser.id}`)
      .send({
        amount: 1,
        description: "Sender no longer exists"
      })
      .set("Authorization", `Bearer ${senderUser.token}`);

    expect(responseTransfer.status).toBe(404);
    expect(responseTransfer.body.message).toBe("Sender not found");
  })


  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })
});