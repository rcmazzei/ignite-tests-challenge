import request from 'supertest';
import { Connection } from 'typeorm';
import { app } from '../../../../app';
import createConnection from '../../../../database'
import { UsersRepository } from '../../../users/repositories/UsersRepository';
import { CreateUserUseCase } from '../../../users/useCases/createUser/CreateUserUseCase';
import { StatementsRepository } from '../../repositories/StatementsRepository';
import { CreateStatementUseCase } from '../createStatement/CreateStatementUseCase';

let connection: Connection;
let usersRepository: UsersRepository;
let createUserUseCase: CreateUserUseCase;
let token_user_a: String;
let token_user_b: String;

describe("Get Statement Operation", () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    usersRepository = new UsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);

    const user_a = {
      name: "John Doe",
      email: "johndoe@unknown.com",
      password: "123456",
    };

    await createUserUseCase.execute(user_a);

    const user_b = {
      name: "Jane Doe",
      email: "janedoe@unknown.com",
      password: "123456",
    };

    await createUserUseCase.execute(user_b);

    let responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: user_a.email,
        password: user_a.password,
      });

    token_user_a = responseToken.body.token;

    responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: user_b.email,
        password: user_b.password,
      });

    token_user_b = responseToken.body.token;

  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get a statement operation", async () => {
    const { body: deposit } = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "Test Deposit"
      })
      .set({
        Authorization: `Bearer ${token_user_a}`
      });

    const response = await request(app)
      .get(`/api/v1/statements/${deposit.id}`)
      .set({
        Authorization: `Bearer ${token_user_a}`
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
    expect(response.body.id).toBe(deposit.id);
  });

  it("should not be able to get a statement operation created by another user", async () => {
    const { body: deposit } = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "Test Deposit"
      })
      .set({
        Authorization: `Bearer ${token_user_a}`
      });

    const response = await request(app)
      .get(`/api/v1/statements/${deposit.id}`)
      .set({
        Authorization: `Bearer ${token_user_b}`
      });

    expect(response.status).toBe(404);
  });

  it("should not be able to get a statement operation with a invalid or missing token", async () => {
    const { body: deposit } = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "Test Deposit"
      })
      .set({
        Authorization: `Bearer ${token_user_a}`
      });

    let response = await request(app)
      .get(`/api/v1/statements/${deposit.id}`)
      .set({
        Authorization: `Bearer 123456789`
      });

    expect(response.status).toBe(401);

    response = await request(app)
      .get(`/api/v1/statements/${deposit.id}`);

    expect(response.status).toBe(401);
  });
});
