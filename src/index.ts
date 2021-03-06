import { SetupServer } from './server';
import config from 'config';

(async (): Promise<void> => {
  const server = new SetupServer(
    (process.env.PORT && parseInt(process.env.PORT)) || config.get('apiPort')
  );
  await server.init();
  server.start();
})();
