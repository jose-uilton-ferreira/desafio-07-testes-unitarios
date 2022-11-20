import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase"

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

let getStatementOperationUseCase: GetStatementOperationUseCase;
let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

let user: User;

describe("Get Statement Operation", () => {
  beforeEach(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    )
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);

    user = await createUserUseCase.execute({
      name: "Name Test",
      email: "test@test.com",
      password: "test"
    });
  })

  it("should be able to get statement operation", async () => {
    const statementData: ICreateStatementDTO = {
      user_id: user.id!,
      type: OperationType.DEPOSIT,
      amount: 100.00,
      description: "Statement Data"
    };

    const statement = await inMemoryStatementsRepository.create(statementData);
    const statementSearched = await getStatementOperationUseCase.execute({
      user_id: user.id!,
      statement_id: statement.id!
    });

    expect(statementSearched).toEqual(statement);
  })

  it("should not be able to get statement operation of non-existent user", async () => {
    const statementData: ICreateStatementDTO = {
      user_id: user.id!,
      type: OperationType.DEPOSIT,
      amount: 100.00,
      description: "Statement Data"
    };

    const statement = await inMemoryStatementsRepository.create(statementData);

    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: "00000",
        statement_id: statement.id!,
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
    
  })

  it("should not be able to get non-existent statement operation", async () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: user.id!,
        statement_id: "00000"
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  })
})