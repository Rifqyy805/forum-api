import AddCommentUseCase from '../AddCommentUseCase.js';
import CreatedComment from '../../../Domains/comments/entities/CreatedComment.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';

describe('AddCommentUseCase', () => {
  it('should orchestrate add comment correctly', async () => {
    const useCasePayload = { content: 'sebuah comment', threadId: 'thread-123', owner: 'user-123' };
    const expectedCreatedComment = new CreatedComment({ id: 'comment-123', content: useCasePayload.content, owner: useCasePayload.owner });

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyThreadExists = vi.fn().mockResolvedValue();
    mockCommentRepository.addComment = vi.fn().mockResolvedValue(expectedCreatedComment);

    const useCase = new AddCommentUseCase({ commentRepository: mockCommentRepository, threadRepository: mockThreadRepository });
    const result = await useCase.execute(useCasePayload);

    expect(result).toStrictEqual(expectedCreatedComment);
    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.addComment).toHaveBeenCalledWith(
      expect.objectContaining({ content: useCasePayload.content, threadId: useCasePayload.threadId, owner: useCasePayload.owner }),
    );
  });
});