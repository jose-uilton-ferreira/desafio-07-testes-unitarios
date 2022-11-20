import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase"

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Create User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  })

  it("should be able to create a new user", async () => {
    const userData = {
      name: "Name Test",
      email: "test@test.com",
      password: "test"
    };

    const user = await createUserUseCase.execute(userData);

    expect(user).toHaveProperty("id");
  })

  it("should not be able to create a new user with existing email", async () => {
    const userData = {
      name: "Name Test",
      email: "test@test.com",
      password: "test",
    };

    expect(async () => {
      await createUserUseCase.execute(userData);
      await createUserUseCase.execute(userData);
    }).rejects.toBeInstanceOf(CreateUserError);
  })
})