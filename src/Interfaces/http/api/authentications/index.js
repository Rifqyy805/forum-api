import AuthenticationsHandler from './handler.js';
import createAuthenticationsRouter from './routes.js';

const authentications = (container) => {
  const handler = new AuthenticationsHandler(container);
  return createAuthenticationsRouter(handler);
};

export default authentications;