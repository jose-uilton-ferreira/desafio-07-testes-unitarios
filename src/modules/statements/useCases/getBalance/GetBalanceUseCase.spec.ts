import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

let getBalanceUseCase: GetBalanceUseCase;
let createUserUseCase: CreateUserUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;

let user: User;

describe("Get Balance", () => {
  beforeEach(async () => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);

    user = await createUserUseCase.execute({
      name: "Name Test",
      email: "test@test.com",
      password: "test"
    });
  })

  it("should be able to get balance", async () => {
    const depositStatement = await inMemoryStatementsRepository.create({
      user_id: user.id!,
      type: OperationType.DEPOSIT,
      amount: 100.00,
      description: "Deposit Statement Test"
    });

    const withdrawStatement = await inMemoryStatementsRepository.create({
      user_id: user.id!,
      type: OperationType.WITHDRAW,
      amount: 50.00,
      description: "Withdraw Statement Test",
    });

    const balance = await getBalanceUseCase.execute({ user_id: user.id! });

    expect(balance.balance).toBe(50);
    expect(balance.statement).toEqual([depositStatement, withdrawStatement]);
  })

  it("should not be able to get balance of a non-existent user", async () => {
    expect(async () => {
      await getBalanceUseCase.execute({ user_id: "00000" });
    }).rejects.toBeInstanceOf(GetBalanceError);
  })
})