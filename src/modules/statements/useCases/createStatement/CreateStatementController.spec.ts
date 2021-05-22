import request from 'supertest';
import { Connection } from 'typeorm';
import { app } from '../../../../app';
import { IUsersRepository } from '../../../users/repositories/IUsersRepository';
import { UsersRepository } from '../../../users/repositories/UsersRepository';
import { CreateUserUseCase } from '../../../users/useCases/createUser/CreateUserUseCase';
import createConnection from '../../../../database/index';

let connection: Connection;
let usersRepository: IUsersRepository;
let createUserUseCase: CreateUserUseCase;
let token: string;

describe("Create Statement", () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    usersRepository = new UsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);

    const user = {
      name: "John Doe",
      email: "johndoe@unknown.com",
      password: "123456",
    };

    await createUserUseCase.execute(user);

    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: user.email,
        password: user.password,
      });

    token = responseToken.body.token;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to make a deposit", async () => {
    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "Test Deposit"
      })
      .set({
        Authorization: `Bearer ${token}`
      });


    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.amount).toBe(100);
  });

  it("should be able to make a withdraw", async () => {
    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 100,
        description: "Test Withdraw"
      })
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.amount).toBe(100);
  });

  it("should not be able to make a withdraw with insufficient funds", async () => {
    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 50,
        description: "Test Withdraw"
      })
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(response.status).toBe(400);
  });
})
