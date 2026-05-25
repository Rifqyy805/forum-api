import express from 'express';

const createUsersRouter = (handler) => {
  const router = express.Router();

  // Bind handler agar 'this' di dalam class tidak hilang
  router.post('/', handler.postUserHandler.bind(handler));

  return router;
};

export default createUsersRouter;
