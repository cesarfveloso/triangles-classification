import { SetupServer } from './server';
import config from 'config';

(async (): Promise<void> => {
  const server = new SetupServer(config.get('apiPort'));
  await server.init();
  server.start();
})();
