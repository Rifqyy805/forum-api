import DeleteCommentUseCase from '../DeleteCommentUseCase.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';

describe('DeleteCommentUseCase', () => {
  it('should orchestrate delete comment correctly', async () => {
    const payload = { threadId: 'thread-123', commentId: 'comment-123', owner: 'user-123' };

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyThreadExists = vi.fn().mockResolvedValue();
    mockCommentRepository.verifyCommentExists = vi.fn().mockResolvedValue();
    mockCommentRepository.verifyCommentOwner = vi.fn().mockResolvedValue();
    mockCommentRepository.deleteComment = vi.fn().mockResolvedValue();

    const useCase = new DeleteCommentUseCase({ commentRepository: mockCommentRepository, threadRepository: mockThreadRepository });
    await useCase.execute(payload);

    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(payload.threadId);
    expect(mockCommentRepository.verifyCommentExists).toHaveBeenCalledWith(payload.commentId);
    expect(mockCommentRepository.verifyCommentOwner).toHaveBeenCalledWith(payload.commentId, payload.owner);
    expect(mockCommentRepository.deleteComment).toHaveBeenCalledWith(payload.commentId);
  });
});