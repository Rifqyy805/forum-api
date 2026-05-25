import AddThreadUseCase from '../AddThreadUseCase.js';
import CreatedThread from '../../../Domains/threads/entities/CreatedThread.js';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';

describe('AddThreadUseCase', () => {
  it('should orchestrate add thread correctly', async () => {
    const useCasePayload = {
      title: 'sebuah thread',
      body: 'sebuah body',
      owner: 'user-123',
    };

    // mock return nilai berbeda dari expected
    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.addThread = vi.fn().mockResolvedValue(
      new CreatedThread({
        id: 'thread-123',
        title: useCasePayload.title,
        owner: useCasePayload.owner,
      }),
    );

    const useCase = new AddThreadUseCase({ threadRepository: mockThreadRepository });
    const result = await useCase.execute(useCasePayload);

    expect(result).toStrictEqual(new CreatedThread({
      id: 'thread-123',
      title: useCasePayload.title,
      owner: useCasePayload.owner,
    }));
    expect(mockThreadRepository.addThread).toHaveBeenCalledWith(
      expect.objectContaining({
        title: useCasePayload.title,
        body: useCasePayload.body,
        owner: useCasePayload.owner,
      }),
    );
  });
});