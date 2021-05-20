import "reflect-metadata";
import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "./CreateUserUseCase";

let usersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create User", () => {

  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
  });

  it("should be able to create a new user", async () => {
    const user = await createUserUseCase.execute({
      name: "John Doe",
      email: "johndoe@unknown.com",
      password: "123456"
    });

    expect(user).toHaveProperty("id");
    expect(user).toMatchObject(user);

  });

  it("should not be able create a new user with a existent email", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "John Doe",
        email: "johndoe@unknown.com",
        password: "123456"
      });

      await createUserUseCase.execute({
        name: "John Doe",
        email: "johndoe@unknown.com",
        password: "123456"
      });
    }).rejects.toBeInstanceOf(AppError);
  });
})
