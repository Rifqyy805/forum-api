import express from 'express';

const createCommentsRouter = (handler, authenticateToken) => {
  const router = express.Router({ mergeParams: true });

  router.post('/', authenticateToken, handler.postCommentHandler);
  router.delete('/:commentId', authenticateToken, handler.deleteCommentHandler);

  return router;
};

export default createCommentsRouter;