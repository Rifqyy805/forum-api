import AddCommentUseCase from '../../../../Applications/use_case/AddCommentUseCase.js';
import DeleteCommentUseCase from '../../../../Applications/use_case/DeleteCommentUseCase.js';
import ToggleLikeCommentUseCase from '../../../../Applications/use_case/ToggleLikeCommentUseCase.js';

class CommentsHandler {
  constructor(container) {
    this._container = container;
    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
    this.putLikeCommentHandler = this.putLikeCommentHandler.bind(this);
  }

  async postCommentHandler(req, res, next) {
    try {
      const { id: owner } = req.user;
      const { threadId } = req.params;
      const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);
      const addedComment = await addCommentUseCase.execute({ ...req.body, threadId, owner });

      res.status(201).json({ status: 'success', data: { addedComment } });
    } catch (error) {
      next(error);
    }
  }

  async deleteCommentHandler(req, res, next) {
    try {
      const { id: owner } = req.user;
      const { threadId, commentId } = req.params;
      const deleteCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name);
      await deleteCommentUseCase.execute({ threadId, commentId, owner });

      res.status(200).json({ status: 'success' });
    } catch (error) {
      next(error);
    }
  }

  async putLikeCommentHandler(req, res, next) {
    try {
      // Mengambil ID user dari middleware autentikasi Express Anda
      const { id: credentialId } = req.user; 
      const { threadId, commentId } = req.params;

      // Panggil Use Case melalui Container Injection
      const toggleLikeCommentUseCase = this._container.getInstance(ToggleLikeCommentUseCase.name);
      await toggleLikeCommentUseCase.execute(threadId, commentId, credentialId);

      // Kirim response sukses khas Express
      return res.status(200).json({
        status: 'success',
      });
    } catch (error) {
      // Teruskan ke middleware error handling Express Anda jika terjadi kegagalan/404
      next(error); 
    }
  }
}

export default CommentsHandler;