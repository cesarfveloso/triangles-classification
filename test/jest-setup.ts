import { SetupServer } from './server';

let server: SetupServer;
beforeAll(async () => {
  server = new SetupServer();
  await server.init();
});

afterAll(async () => await server.close());
