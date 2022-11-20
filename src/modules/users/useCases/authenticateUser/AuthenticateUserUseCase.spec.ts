import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Authenticate User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  })

  it("should be able to authenticate a user", async () => {
    const userData = {
      name: "Name Test",
      email: "test@test.com",
      password: "test",
    };

    await createUserUseCase.execute(userData);

    const authInfo = await authenticateUserUseCase.execute({
      email: userData.email,
      password: userData.password,
    });

    expect(authInfo).toHaveProperty("token");
    expect(authInfo.user).toHaveProperty("id");
  })

  it("should not be able to authenticate a user with non-existent email", async () => {
    const userData = {
      name: "Name Test",
      email: "test@test.com",
      password: "test",
    };

    await createUserUseCase.execute(userData);

    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "nonexistent@test.com",
        password: userData.password
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })

  it("should not be able to authenticate a user with incorrect password", async () => {
    const userData = {
      name: "Name Test",
      email: "test@test.com",
      password: "test",
    };

    await createUserUseCase.execute(userData);

    expect(async () => {
      await authenticateUserUseCase.execute({
        email: userData.email,
        password: "incorrect_password",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  })

});