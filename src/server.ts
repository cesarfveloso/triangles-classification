import { Server } from '@overnightjs/core';
import { Application } from 'express';
import bodyParser from 'body-parser';
import * as http from 'http';
import cors from 'cors';
import { TrianglesControlller } from './controllers/triangles';
import { TrianglesService } from './services/triangles';
import { TrianglesRepository } from './repository/triangles';
import swaggerUi from 'swagger-ui-express';
import apiSchema from './api-schema.json';
import { errorHandler } from './middlewares/error-handler';
import morgan from 'morgan';
import { logger } from './services/logger';
import rateLimit from 'express-rate-limit';

export class SetupServer extends Server {
  private server?: http.Server;
  constructor(private port = 3000) {
    super();
  }

  public async init(): Promise<void> {
    this.setupExpress();
    await this.docsSetup();
    this.setupControllers();
    this.setupErrorHandlers();
    this.setupRateLimiter();
  }

  private setupExpress(): void {
    this.app.use(bodyParser.json());
    this.app.use(
      cors({
        origin: '*',
      })
    );
    this.app.use(morgan('combined'));
  }

  private setupControllers(): void {
    const triangleRepository = new TrianglesRepository('TRIANGLES');
    const trianglesService = new TrianglesService(triangleRepository);
    const trianglesController = new TrianglesControlller(trianglesService);
    this.addControllers([trianglesController]);
  }

  public getApp(): Application {
    return this.app;
  }

  public async close(): Promise<void> {
    if (this.server) {
      await new Promise((resolve, reject) => {
        this.server?.close((err) => {
          if (err) {
            return reject(err);
          }
          resolve(true);
        });
      });
    }
  }

  public start(): void {
    this.server = this.app.listen(this.port, () => {
      logger.info(`Server listening on port: ${this.port}`);
    });
  }

  private async docsSetup(): Promise<void> {
    this.app.use('/docs', swaggerUi.serve, swaggerUi.setup(apiSchema));
  }

  private setupErrorHandlers(): void {
    this.app.use(errorHandler);
  }

  private setupRateLimiter(): void {
    // Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
    // see https://expressjs.com/en/guide/behind-proxies.html
    // app.set('trust proxy', 1);
    const limiter = rateLimit({
      windowMs: 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use(limiter);
  }
}