import express from 'express';

const createRepliesRouter = (handler, authenticateToken) => {
  const router = express.Router({ mergeParams: true });

  router.post('/', authenticateToken, handler.postReplyHandler);
  router.delete('/:replyId', authenticateToken, handler.deleteReplyHandler);

  return router;
};

export default createRepliesRouter;