class ToggleLikeCommentUseCase {
  constructor({ likeRepository, commentRepository, threadRepository }) {
    this._likeRepository = likeRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(threadId, commentId, owner) {
    await this._threadRepository.checkAvailabilityThread(threadId);
    await this._commentRepository.checkAvailabilityComment(commentId);

    const isLikeExist = await this._likeRepository.checkLikeExist(commentId, owner);

    if (isLikeExist) {
      await this._likeRepository.deleteLike(commentId, owner);
    } else {
      await this._likeRepository.addLike(commentId, owner);
    }
  }
}
export default ToggleLikeCommentUseCase;
