import { describe, it, expect, vi } from 'vitest';
import ToggleLikeCommentUseCase from '../ToggleLikeCommentUseCase.js';
import LikeRepository from '../../../Domains/likes/LikeRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';

describe('ToggleLikeCommentUseCase', () => {
  it('should orchestrating the add like action correctly if like not exist', async () => {
    // Arrange
    const threadId = 'thread-123';
    const commentId = 'comment-123';
    const owner = 'user-123';

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    /** mocking needed functions using Vitest (vi.fn) */
    mockThreadRepository.checkAvailabilityThread = vi.fn(() => Promise.resolve());
    mockCommentRepository.checkAvailabilityComment = vi.fn(() => Promise.resolve());
    mockLikeRepository.checkLikeExist = vi.fn(() => Promise.resolve(false));
    mockLikeRepository.addLike = vi.fn(() => Promise.resolve());

    /** creating use case instance */
    const toggleLikeCommentUseCase = new ToggleLikeCommentUseCase({
      likeRepository: mockLikeRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await toggleLikeCommentUseCase.execute(threadId, commentId, owner);

    // Assert
    expect(mockThreadRepository.checkAvailabilityThread).toHaveBeenCalledWith(threadId);
    expect(mockCommentRepository.checkAvailabilityComment).toHaveBeenCalledWith(commentId);
    expect(mockLikeRepository.checkLikeExist).toHaveBeenCalledWith(commentId, owner);
    expect(mockLikeRepository.addLike).toHaveBeenCalledWith(commentId, owner);
  });

  it('should orchestrating the delete like action correctly if like exist', async () => {
    // Arrange
    const threadId = 'thread-123';
    const commentId = 'comment-123';
    const owner = 'user-123';

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    mockThreadRepository.checkAvailabilityThread = vi.fn(() => Promise.resolve());
    mockCommentRepository.checkAvailabilityComment = vi.fn(() => Promise.resolve());
    mockLikeRepository.checkLikeExist = vi.fn(() => Promise.resolve(true));
    mockLikeRepository.deleteLike = vi.fn(() => Promise.resolve());

    const toggleLikeCommentUseCase = new ToggleLikeCommentUseCase({
      likeRepository: mockLikeRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await toggleLikeCommentUseCase.execute(threadId, commentId, owner);

    // Assert
    expect(mockThreadRepository.checkAvailabilityThread).toHaveBeenCalledWith(threadId);
    expect(mockCommentRepository.checkAvailabilityComment).toHaveBeenCalledWith(commentId);
    expect(mockLikeRepository.checkLikeExist).toHaveBeenCalledWith(commentId, owner);
    expect(mockLikeRepository.deleteLike).toHaveBeenCalledWith(commentId, owner);
  });
});
