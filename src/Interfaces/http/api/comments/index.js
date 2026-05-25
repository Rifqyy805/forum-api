import CommentsHandler from './handler.js';
import createCommentsRouter from './routes.js';

const comments = (container, authenticateToken) => {
  const handler = new CommentsHandler(container);
  return createCommentsRouter(handler, authenticateToken);
};

export default comments;