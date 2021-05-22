import "reflect-metadata";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

import { OperationType } from '../../entities/Statement';
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { AppError } from "../../../../shared/errors/AppError";

let createStatementUseCase: CreateStatementUseCase;
let statementsRepository: IStatementsRepository;
let usersRepository: IUsersRepository;

describe("Create Statement", () => {

  beforeEach(() => {
    statementsRepository = new InMemoryStatementsRepository();
    usersRepository = new InMemoryUsersRepository();
    createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository);
  });

  it("should be able to create a statement", async () => {
    const user = await usersRepository.create({
      name: "John Doe",
      email: "johndoe@unknown.com",
      password: "123456"
    });

    if (user && user.id) {
      const data = {
        user_id: user.id,
        type: OperationType.DEPOSIT,
        description: 'Test',
        amount: 100
      };

      const statement = await createStatementUseCase.execute(data);

      const userBalance = await statementsRepository.getUserBalance({ user_id: user.id })

      expect(statement).toHaveProperty("id");
      expect(statement).toMatchObject(data);
      expect(userBalance.balance).toBe(100);
    };
  });

  it("should not be able to create a statement with a non existent user", async () => {
    expect(async () => {
      const data = {
        user_id: '123456',
        type: OperationType.DEPOSIT,
        description: 'Test',
        amount: 100
      };

      await createStatementUseCase.execute(data);
    }).rejects.toBeInstanceOf(AppError);
  });


  it("should not be able to make a withdraw with insufficient funds", async () => {
    expect(async () => {
      const user = await usersRepository.create({
        name: "John Doe",
        email: "johndoe@unknown.com",
        password: "123456"
      });

      const data = {
        user_id: user.id!,
        type: OperationType.WITHDRAW,
        description: 'Test',
        amount: 100
      };

      await createStatementUseCase.execute(data);
    }).rejects.toBeInstanceOf(AppError);
  });
})
