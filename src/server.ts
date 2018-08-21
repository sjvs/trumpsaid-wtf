
import { config } from 'dotenv-safe';

config();
require('@google-cloud/trace-agent').start();
require('newrelic');

import errorhandler from 'errorhandler';
import app from './app';
import logger from './util/logger';
import checkNativeDependencies from './util/nativeDependencies';
import testRemoteConnections from './util/testRemoteConnections';

let server;
export default server;

const startServer = async () => {
  await testRemoteConnections();
  checkNativeDependencies();

  if (process.env.NODE_ENV !== 'production') {
    app.use(errorhandler());
  }

  server = app.listen(app.get('port'), app.get('host'), () => {
    logger.info(
      `Trump Said WTF webserver is running at http://${app.get('hostname')}:${app.get('port')} in ${app.get('env')} mode`);
  });
};

if (process.env.SERVER_TYPE !== 'WORKER') {
// tslint:disable-next-line:no-floating-promises
  startServer();
}
