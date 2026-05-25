import CreateComment from '../CreateComment.js';

describe('CreateComment entity', () => {
  it('should throw error when not contain needed property', () => {
    expect(() => new CreateComment({ content: 'abc', threadId: 'thread-123' }))
      .toThrowError('CREATE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when not meet data specification', () => {
    expect(() => new CreateComment({ content: 123, threadId: 'thread-123', owner: 'user-123' }))
      .toThrowError('CREATE_COMMENT.NOT_MEET_DATA_SPECIFICATION');
  });

  it('should create CreateComment correctly', () => {
    const payload = { content: 'sebuah comment', threadId: 'thread-123', owner: 'user-123' };
    const { content, threadId, owner } = new CreateComment(payload);
    expect(content).toBe(payload.content);
    expect(threadId).toBe(payload.threadId);
    expect(owner).toBe(payload.owner);
  });
});