import { create } from 'node:domain';
import request from 'supertest'
import { Connection } from 'typeorm';
import { app } from '../../../../app';
import createConnection from '../../../../database';

interface IUser {
  name: string;
  email: string;
  password: string;
}

let connection: Connection;
let user: IUser;

describe("Create User", () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    user = {
      name: "John Doe",
      email: "johndoe@unknown.com",
      password: '123456789'
    };
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a new user", async () => {
    const response = await request(app)
      .post('/api/v1/users')
      .send(user);

    expect(response.status).toBe(201);
  });

  it("should not be able create a new user with a existent email", async () => {
    const response = await request(app)
      .post('/api/v1/users')
      .send(user);

    expect(response.status).toBe(400);
  });
});
