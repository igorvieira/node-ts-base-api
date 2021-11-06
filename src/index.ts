import { SetupServer } from './server';
import config from 'config';
import logger from './logger';

enum ExitStatus {
  Failure = 1,
  Success = 0
}


// Exit if we have a rejection from promise
process.on('unhandledRejection', (reason, promise) => {
  logger.error(
    `App exiting due to an unhandled promise: ${promise} and reason: ${reason}`
  );
  // lets throw the error and let the uncaughtException handle below handle it
  throw reason;
});

// Fails in some exception
process.on('uncaughtException', (error) => {
  logger.error(`App exiting due to an uncaught exception: ${error}`);
  process.exit(ExitStatus.Failure);
});

(async (): Promise<void> => {
  try {
    const server = new SetupServer(config.get('App.port'));
    await server.init();
    server.start();

    const exitStignals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGQUIT']
    exitStignals.map(sig => process.on(sig, async () => {
      try {
        await server.close()
        logger.info(`App exited with success`)
        process.exit(ExitStatus.Success)
      } catch (error) {
        logger.error(`App exited with error: ${error}`)
        process.exit(ExitStatus.Failure)
      }
    }))

  } catch (error) {
    logger.error(`App exited with error: ${error}`)
    process.exit(ExitStatus.Failure)
  }

})();