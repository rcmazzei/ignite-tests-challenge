import request from 'supertest';
import createConnection from '../../../../database';

import { Connection } from "typeorm";
import { app } from '../../../../app';

interface IUser {
  name: string;
  email: string;
  password: string;
}

let connection: Connection;
let user: IUser;

describe("Authenticate User", () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    user = {
      name: "John Doe",
      email: "johndoe@unknown.com",
      password: "123456"
    };

    await request(app).post('/api/v1/users').send(user);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to authenticate a valid user", async () => {
    const response = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: user.email,
        password: user.password,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body.user.email).toBe(user.email);
  });

  it("should not be able to authenticate a non existent user", async () => {
    const response = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: 'janedoe@unknown.com',
        password: user.password,
      });

    expect(response.status).toBe(401);
  });

  it("should not be able to authenticate with a invalid password", async () => {
    const response = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: user.email,
        password: '987654321',
      });

    expect(response.status).toBe(401);
  });
})
