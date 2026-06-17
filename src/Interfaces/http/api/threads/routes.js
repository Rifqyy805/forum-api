import express from 'express';

const createThreadsRouter = (handler, authenticateToken) => {
  const router = express.Router();

  router.post('/', authenticateToken, handler.postThreadHandler);
  router.get('/:threadId', handler.getThreadDetailHandler);

  return router;
};

export default createThreadsRouter;