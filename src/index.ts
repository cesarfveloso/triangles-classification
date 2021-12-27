import { SetupServer } from './server';

(async (): Promise<void> => {
  const port = Number.isNaN(Number(process.env.PORT)) ? undefined : Number(process.env.PORT);
  const server = new SetupServer(port);
  await server.init();
  server.start();
})();
