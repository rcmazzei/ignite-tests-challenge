import "reflect-metadata";
import { AppError } from "../../../../shared/errors/AppError";
import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let usersRepository: IUsersRepository;
let statementsRepository: IStatementsRepository;
let getBalanceUseCase: GetBalanceUseCase;
let user: User;

describe("GetBalance", () => {

  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(statementsRepository, usersRepository);

    user = await usersRepository.create({
      name: "John Doe",
      email: "johndoe@unknown.com",
      password: "123456"
    });
  });

  it("should be able to get user balance", async () => {
    await statementsRepository.create({
      user_id: user.id!,
      amount: 200,
      type: OperationType.DEPOSIT,
      description: 'Test 1'
    });

    await statementsRepository.create({
      user_id: user.id!,
      amount: 100,
      type: OperationType.WITHDRAW,
      description: 'Test 2'
    });

    await statementsRepository.create({
      user_id: user.id!,
      amount: 100,
      type: OperationType.DEPOSIT,
      description: 'Test 3'
    });
    const userBalance = await getBalanceUseCase.execute({ user_id: user.id! });

    expect(userBalance.balance).toBe(200);
    expect(userBalance.statement.length).toBe(3);

  });

  it("should not accept an invalid user get a balance", async () => {
    expect(async () => {
      const userBalance = await getBalanceUseCase.execute({ user_id: "1234" });
    }).rejects.toBeInstanceOf(AppError);
  })
})
