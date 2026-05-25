import RepliesHandler from './handler.js';
import createRepliesRouter from './routes.js';

const replies = (container, authenticateToken) => {
  const handler = new RepliesHandler(container);
  return createRepliesRouter(handler, authenticateToken);
};

export default replies;