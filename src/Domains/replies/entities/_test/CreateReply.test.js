import CreateReply from '../CreateReply.js';

describe('CreateReply entity', () => {
  it('should throw error when not contain needed property', () => {
    expect(() => new CreateReply({ content: 'abc', commentId: 'comment-123' }))
      .toThrowError('CREATE_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when not meet data specification', () => {
    expect(() => new CreateReply({ content: 123, commentId: 'comment-123', owner: 'user-123' }))
      .toThrowError('CREATE_REPLY.NOT_MEET_DATA_SPECIFICATION');
  });

  it('should create CreateReply correctly', () => {
    const payload = { content: 'sebuah balasan', commentId: 'comment-123', owner: 'user-123' };
    const { content, commentId, owner } = new CreateReply(payload);
    expect(content).toBe(payload.content);
    expect(commentId).toBe(payload.commentId);
    expect(owner).toBe(payload.owner);
  });
});