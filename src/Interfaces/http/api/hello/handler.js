class HelloHandler {
  constructor(container) {
    this._container = container;
    this.getHelloHandler = this.getHelloHandler.bind(this);
  }

  async getHelloHandler(req, res, next) {
    try {
      res.status(200).json({
        status: 'success',
        message: 'Hello World!',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default HelloHandler;