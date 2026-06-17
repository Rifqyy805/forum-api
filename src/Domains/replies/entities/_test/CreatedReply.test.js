import CreatedReply from '../CreatedReply.js';

describe('CreatedReply entity', () => {
  it('should throw error when not contain needed property', () => {
    expect(() => new CreatedReply({ id: 'reply-123', content: 'abc' }))
      .toThrowError('CREATED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when not meet data specification', () => {
    expect(() => new CreatedReply({ id: 123, content: 'abc', owner: 'user-123' }))
      .toThrowError('CREATED_REPLY.NOT_MEET_DATA_SPECIFICATION');
  });

  it('should create CreatedReply correctly', () => {
    const payload = { id: 'reply-123', content: 'sebuah balasan', owner: 'user-123' };
    const { id, content, owner } = new CreatedReply(payload);
    expect(id).toBe(payload.id);
    expect(content).toBe(payload.content);
    expect(owner).toBe(payload.owner);
  });
});