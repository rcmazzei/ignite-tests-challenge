import { Connection, createConnection, getConnectionOptions } from 'typeorm';

// (async () => await createConnection())();

export default async (): Promise<Connection> => {

  const connectionOptions = await getConnectionOptions();

  const connection = await createConnection(
    Object.assign(connectionOptions, {
      ...connectionOptions,
      database: process.env.NODE_ENV === 'fin_api' ? 'fin_api_tests' : connectionOptions.database
    }));

  return connection;
  // (async () => await createConnection())();
}
