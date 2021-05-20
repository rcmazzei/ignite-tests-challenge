import "reflect-metadata";
import 'dotenv/config';
import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";

let usersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticaUserUseCase: AuthenticateUserUseCase;

describe("Authenticate User", () => {

  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
    authenticaUserUseCase = new AuthenticateUserUseCase(usersRepository);
  });

  it("should be able to authenticate a valid user", async () => {

    const data = {
      name: "John Doe",
      email: "johndoe@unknown.com",
      password: "123456"
    };

    await createUserUseCase.execute(data);

    const authentication = await authenticaUserUseCase.execute({
      email: data.email,
      password: data.password
    });

    expect(authentication).toHaveProperty("token");
    expect(authentication.user).toHaveProperty("id");
    expect(authentication.user.email).toBe(data.email);

  });

  it("should not be able to authenticate a non existent user", async () => {
    expect(async () => {
      await authenticaUserUseCase.execute({
        email: "johndoe@unkwown.com",
        password: "123456"
      });

    }).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to authenticate with a invalid password", async () => {

    expect(async () => {
      const data = {
        name: "John Doe",
        email: "johndoe@unknown.com",
        password: "123456"
      };

      await createUserUseCase.execute(data);

      await authenticaUserUseCase.execute({
        email: data.email,
        password: "000000"
      });

    }).rejects.toBeInstanceOf(AppError);

  });
})
