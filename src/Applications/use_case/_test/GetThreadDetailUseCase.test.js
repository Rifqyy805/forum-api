import GetThreadDetailUseCase from '../GetThreadDetailUseCase.js';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import ReplyRepository from '../../../Domains/replies/ReplyRepository.js';

describe('GetThreadDetailUseCase', () => {
  it('should orchestrate get thread detail with replies correctly', async () => {
    const threadId = 'thread-123';

    const mockThread = {
      id: threadId,
      title: 'sebuah thread',
      body: 'sebuah body',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
    };

    const mockComments = [
      {
        id: 'comment-111',
        username: 'johndoe',
        date: '2021-08-08T07:22:33.555Z',
        content: 'sebuah comment',
        is_delete: false,
      },
      {
        id: 'comment-222',
        username: 'dicoding',
        date: '2021-08-08T07:26:21.338Z',
        content: 'dihapus',
        is_delete: true,
      },
    ];

    const mockRepliesComment111 = [
      {
        id: 'reply-111',
        username: 'johndoe',
        date: '2021-08-08T07:30:00.000Z',
        content: 'balasan dihapus',
        is_delete: true,   // ← branch true
      },
      {
        id: 'reply-222',
        username: 'dicoding',
        date: '2021-08-08T07:35:00.000Z',
        content: 'sebuah balasan',
        is_delete: false,  // ← branch false
      },
    ];

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.getThreadById = vi.fn().mockResolvedValue({ ...mockThread });
    mockCommentRepository.getCommentsByThreadId = vi.fn().mockResolvedValue(mockComments);
    mockReplyRepository.getRepliesByCommentId = vi.fn()
      .mockResolvedValueOnce(mockRepliesComment111)
      .mockResolvedValueOnce([]);

    const useCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    const thread = await useCase.execute(threadId);

    expect(thread.comments[0].replies[0].content).toBe('**balasan telah dihapus**');
    expect(thread.comments[0].replies[1].content).toBe('sebuah balasan');
    expect(thread.comments[0].content).toBe('sebuah comment');
    expect(thread.comments[1].content).toBe('**komentar telah dihapus**');
    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith(threadId);
    expect(mockReplyRepository.getRepliesByCommentId).toHaveBeenCalledTimes(2);
  });
});