import request from 'supertest';
import { Connection } from "typeorm";
import { app } from '../../../../app';
import createConnection from '../../../../database';

interface IUser {
  name: string;
  email: string;
  password: string;
}

let connection: Connection;
let user: IUser;
let token: string;

describe("Show User Profile", () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    user = {
      name: "John Doe",
      email: "johndoe@unknown.com",
      password: "123456",
    }

    await request(app).post('/api/v1/users').send(user);
    const response = await request(app).post('/api/v1/sessions').send(user);

    token = response.body.token;

  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get the user profile", async () => {
    const response = await request(app)
      .get('/api/v1/profile')
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("email");
    expect(response.body.name).toBe(user.name);
  });

  it("should not be able to get the profile with invalid or missing token", async () => {
    let response = await request(app)
      .get('/api/v1/profile')
      .set({
        Authorization: `Bearer 123456`
      });

    expect(response.status).toBe(401);

    response = await request(app)
      .get('/api/v1/profile');

    expect(response.status).toBe(401);
  });
});
