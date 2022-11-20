import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase"

let showUserProfileUseCase: ShowUserProfileUseCase;
let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Show User Profile", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to show a user profile", async () => {
    const user = await createUserUseCase.execute({
      name: "Name Test",
      email: "test@test.com",
      password: "test"
    });

    const userProfile = await showUserProfileUseCase.execute(user.id!);

    expect(userProfile).toEqual(user);
  });

  it("shoult not be able to show a non-existent user profile", async () => {
    expect(async () => {
      await showUserProfileUseCase.execute("00000");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  })
})