import "reflect-metadata";
import 'dotenv/config';
import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let usersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Show User Profile", () => {

  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository);
  });

  it("should be able to get the user profile", async () => {
    const data = {
      name: "John Doe",
      email: "johndoe@unknown.com",
      password: "123456"
    };

    const user = await createUserUseCase.execute(data);

    const userProfile = await showUserProfileUseCase.execute(user.id!);

    expect(userProfile.id).toBe(user.id);
    expect(userProfile.email).toBe(user.email);
  });

  it("should not be able to get the profile for a non existent user", async () => {
    expect(async () => {
      await showUserProfileUseCase.execute("123456");

    }).rejects.toBeInstanceOf(AppError);
  });
})
