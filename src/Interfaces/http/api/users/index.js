import UsersHandler from './handler.js';
import createUsersRouter from './routes.js';

const users = (container) => {
  const handler = new UsersHandler(container);
  return createUsersRouter(handler);
};

export default users;