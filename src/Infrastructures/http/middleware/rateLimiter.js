import rateLimit from 'express-rate-limit';

const threadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300, // naikkan untuk testing
  message: {
    status: 'fail',
    message: 'Terlalu banyak permintaan, coba lagi nanti.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // skip rate limit untuk environment test
    return process.env.NODE_ENV === 'test';
  },
});

export default threadLimiter;