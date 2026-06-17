import express from 'express';

const createCommentsRouter = (handler, authenticateToken) => {
  const router = express.Router({ mergeParams: true });

  // Route Utama
  router.post('/', authenticateToken, handler.postCommentHandler);
  router.delete('/:commentId', authenticateToken, handler.deleteCommentHandler);

  // Route Tambahan Fitur Opsional Likes [Page 4-5]
  router.put('/:commentId/likes', authenticateToken, handler.putLikeCommentHandler);

  return router;
};

export default createCommentsRouter;
