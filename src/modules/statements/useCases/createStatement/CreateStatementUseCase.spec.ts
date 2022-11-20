import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

let user: User;

describe("Create Statement", () => {

  beforeEach(async () => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createStatementUseCase = new CreateStatementUseCase(
        inMemoryUsersRepository,
        inMemoryStatementsRepository
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);

    user = await createUserUseCase.execute({
      name: "Name Test",
      email: "test@test.com",
      password: "test"
    });
  })

  it("should be able to create a new statement", async () => {
    const statementData: ICreateStatementDTO = {
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 100.00,
      description: "Statement Test"
    };

    const statement = await createStatementUseCase.execute(statementData);

    expect(statement).toHaveProperty("id");
  })

  it("should not be able to create a new statement to a non-existent user", async () => {
    const statementData: ICreateStatementDTO = {
      user_id: "00000",
      type: OperationType.DEPOSIT,
      amount: 100.00,
      description: "Statement Test"
    };

    expect(async () => {
      await createStatementUseCase.execute(statementData);
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  })

  it("should not be able to create a withdraw more than the balance", async () => {
    const depositStatementData: ICreateStatementDTO = {
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 100.00,
      description: "Deposit Statement Test"
    };

    const withdrawStatementData: ICreateStatementDTO = {
      user_id: user.id as string,
      type: OperationType.WITHDRAW,
      amount: 200.00,
      description: "Withdraw Statement Test"
    };

    await createStatementUseCase.execute(depositStatementData);

    expect(async () => {
      await createStatementUseCase.execute(withdrawStatementData)
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  })
});