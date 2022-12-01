import { v4 as uuidV4 } from "uuid";

import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { CreateTransferStatementError } from "./CreateTransferStatementError";
import { CreateTransferStatementUseCase } from "./CreateTransferStatementUseCase"

enum OperationType {
  DEPOSIT = "deposit"
}

let createTransferStatementUseCase: CreateTransferStatementUseCase;
let createStatementUseCase: CreateStatementUseCase;
let statementsRepositoryInMemory: InMemoryStatementsRepository;
let usersRepositoryInMemory: InMemoryUsersRepository;

describe("Create Transfer Statement", () => {
  beforeEach(() => {
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    usersRepositoryInMemory = new InMemoryUsersRepository();

    createTransferStatementUseCase = new CreateTransferStatementUseCase(
      statementsRepositoryInMemory,
      usersRepositoryInMemory
    );

    createStatementUseCase = new CreateStatementUseCase(
      usersRepositoryInMemory,
      statementsRepositoryInMemory
    );
  })

  it("should be able to create a new transfer statement", async () => {
    const sender = await usersRepositoryInMemory.create({
      name: "Kate Graham",
      email: "gaujelit@rehe.tv",
      password: "848854"
    });

    const receiver = await usersRepositoryInMemory.create({
      name: "Tommy Reid",
      email: "hofzivwir@fawtuvu.ao",
      password: "054469"
    })

    await createStatementUseCase.execute({
      user_id: sender.id!,
      type: OperationType.DEPOSIT,
      amount: 200,
      description: "Deposit Statement Test"
    })

    const transferStatement = await createTransferStatementUseCase.execute({
      user_id: receiver.id!,
      sender_id: sender.id!,
      amount: 100,
      description: "Transfer Statement Test"
    });

    expect(transferStatement).toHaveProperty("id");
  })

  it("should not be able to create a new transfer if sender does not exist", async () => {
    const receiver = await usersRepositoryInMemory.create({
      name: "Kate Graham",
      email: "gaujelit@rehe.tv",
      password: "848854"
    });

    expect(async () => {
      await createTransferStatementUseCase.execute({
        user_id: receiver.id!,
        sender_id: uuidV4(),
        amount: 100,
        description: "Transfer Statement Test"
      });
    }).rejects.toBeInstanceOf(CreateTransferStatementError.SenderNotFound)
  })

  it("should not be able to create a new transfer if receiver does not exist", async () => {
    const sender = await usersRepositoryInMemory.create({
      name: "Kate Graham",
      email: "gaujelit@rehe.tv",
      password: "848854"
    });

    expect(async () => {
      await createTransferStatementUseCase.execute({
        user_id: uuidV4(),
        sender_id: sender.id!,
        amount: 100,
        description: "Transfer Statement Test"
      });
    }).rejects.toBeInstanceOf(CreateTransferStatementError.ReceiverNotFound)
  })

  it(
    "should not be able to create a new transfer if sender balance less than transfer amount", async () => {
      const sender = await usersRepositoryInMemory.create({
        name: "Kate Graham",
        email: "gaujelit@rehe.tv",
        password: "848854"
      });
  
      const receiver = await usersRepositoryInMemory.create({
        name: "Tommy Reid",
        email: "hofzivwir@fawtuvu.ao",
        password: "054469"
      })

      await createStatementUseCase.execute({
        user_id: sender.id!,
        type: OperationType.DEPOSIT,
        amount: 100,
        description: "Deposit Statement Test"
      })

      expect(async () => {
        await createTransferStatementUseCase.execute({
          user_id: receiver.id!,
          sender_id: sender.id!,
          amount: 100,
          description: "Transfer Statement Test"
        });
      }).rejects.toBeInstanceOf(CreateTransferStatementError.InsufficientFunds);
    }
  )
})