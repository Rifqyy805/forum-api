import rateLimit from 'express-rate-limit';

const threadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 90,
  message: {
    status: 'fail',
    message: 'Terlalu banyak permintaan, coba lagi nanti.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export default threadLimiter;