import ClientError from './ClientError.js';

class AuthorizationError extends ClientError {
  constructor(message) {
    super(message, 403); // ← ini yang kurang
    this.name = 'AuthorizationError';
  }
}

export default AuthorizationError;