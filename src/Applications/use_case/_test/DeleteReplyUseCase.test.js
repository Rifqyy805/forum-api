import DeleteReplyUseCase from '../DeleteReplyUseCase.js';
import ReplyRepository from '../../../Domains/replies/ReplyRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';

describe('DeleteReplyUseCase', () => {
  it('should orchestrate delete reply correctly', async () => {
    const payload = { threadId: 'thread-123', commentId: 'comment-123', replyId: 'reply-123', owner: 'user-123' };

    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyThreadExists = vi.fn().mockResolvedValue();
    mockCommentRepository.verifyCommentExists = vi.fn().mockResolvedValue();
    mockReplyRepository.verifyReplyExists = vi.fn().mockResolvedValue();
    mockReplyRepository.verifyReplyOwner = vi.fn().mockResolvedValue();
    mockReplyRepository.deleteReply = vi.fn().mockResolvedValue();

    const useCase = new DeleteReplyUseCase({ replyRepository: mockReplyRepository, commentRepository: mockCommentRepository, threadRepository: mockThreadRepository });
    await useCase.execute(payload);

    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(payload.threadId);
    expect(mockCommentRepository.verifyCommentExists).toHaveBeenCalledWith(payload.commentId);
    expect(mockReplyRepository.verifyReplyExists).toHaveBeenCalledWith(payload.replyId);
    expect(mockReplyRepository.verifyReplyOwner).toHaveBeenCalledWith(payload.replyId, payload.owner);
    expect(mockReplyRepository.deleteReply).toHaveBeenCalledWith(payload.replyId);
  });
});