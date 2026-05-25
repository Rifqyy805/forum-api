import ThreadsHandler from './handler.js';
import createThreadsRouter from './routes.js';

const threads = (container, authenticateToken) => {
  const handler = new ThreadsHandler(container); // ← ini yang kurang
  return createThreadsRouter(handler, authenticateToken);
};

export default threads;