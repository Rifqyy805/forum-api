import AddReplyUseCase from '../AddReplyUseCase.js';
import CreatedReply from '../../../Domains/replies/entities/CreatedReply.js';
import ReplyRepository from '../../../Domains/replies/ReplyRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';

describe('AddReplyUseCase', () => {
  it('should orchestrate add reply correctly', async () => {
    const useCasePayload = { content: 'sebuah balasan', commentId: 'comment-123', threadId: 'thread-123', owner: 'user-123' };
    const expectedCreatedReply = new CreatedReply({ id: 'reply-123', content: useCasePayload.content, owner: useCasePayload.owner });

    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyThreadExists = vi.fn().mockResolvedValue();
    mockCommentRepository.verifyCommentExists = vi.fn().mockResolvedValue();
    mockReplyRepository.addReply = vi.fn().mockResolvedValue(expectedCreatedReply);

    const useCase = new AddReplyUseCase({ replyRepository: mockReplyRepository, commentRepository: mockCommentRepository, threadRepository: mockThreadRepository });
    const result = await useCase.execute(useCasePayload);

    expect(result).toStrictEqual(expectedCreatedReply);
    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.verifyCommentExists).toHaveBeenCalledWith(useCasePayload.commentId);
    expect(mockReplyRepository.addReply).toHaveBeenCalledWith(
      expect.objectContaining({ content: useCasePayload.content, commentId: useCasePayload.commentId, owner: useCasePayload.owner }),
    );
  });
});