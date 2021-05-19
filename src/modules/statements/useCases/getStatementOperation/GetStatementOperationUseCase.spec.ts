import 'reflect-metadata';
import { AppError } from "../../../../shared/errors/AppError";
import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let statementsRepository: IStatementsRepository;
let usersRepository: IUsersRepository;
let getStatementOperation: GetStatementOperationUseCase;
let user: User;

describe("Get Statement Operation", () => {

  beforeEach(async () => {
    statementsRepository = new InMemoryStatementsRepository();
    usersRepository = new InMemoryUsersRepository();
    getStatementOperation = new GetStatementOperationUseCase(usersRepository, statementsRepository);

    user = await usersRepository.create({
      name: "John Doe",
      email: "johndoe@unknown.com",
      password: "123456"
    });
  });

  it("should be able to get a statement operation", async () => {
    const newStatement = await statementsRepository.create({
      user_id: user.id!,
      amount: 100,
      type: OperationType.DEPOSIT,
      description: 'Test 3'
    });

    const statement = await getStatementOperation.execute({ user_id: user.id!, statement_id: newStatement.id! });

    expect(statement.id).toBe(newStatement.id);
  });

  it("should not be able to find a non existent operation", async () => {
    expect(async () => {
      await getStatementOperation.execute({ user_id: user.id!, statement_id: '123456' })
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to find a existing operation to a non existent user", async () => {
    expect(async () => {

      const newStatement = await statementsRepository.create({
        user_id: user.id!,
        amount: 100,
        type: OperationType.DEPOSIT,
        description: 'Test 3'
      });

      const statement = await getStatementOperation.execute({ user_id: user.id!, statement_id: newStatement.id! });

      await getStatementOperation.execute({ user_id: '123456', statement_id: statement.id! })
    }).rejects.toBeInstanceOf(AppError);
  });

})
