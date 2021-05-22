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

describe("Get Balance", () => {

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

  it("should be able to get user balance", async () => {
    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 200,
        description: "Test Deposit"
      })
      .set({
        Authorization: `Bearer ${token}`
      });

    await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 100,
        description: "Test Withdraw"
      })
      .set({
        Authorization: `Bearer ${token}`
      });

    const response = await request(app)
      .get('/api/v1/statements/balance')
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("balance");
    expect(response.body.balance).toBe(100);
    expect(response.body.statement.length).toBe(2);
  });

  it("should not be able to return the balance if token is missing", async () => {
    const response = await request(app)
      .get('/api/v1/statements/balance');

    expect(response.status).toBe(401);
  });

  it("should not be able to return the balance with a invalid token", async () => {
    const response = await request(app)
      .get('/api/v1/statements/balance')
      .set({
        Authorization: "12345678"
      });

    expect(response.status).toBe(401);
  });
});
