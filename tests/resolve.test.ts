import { SkillResolver } from '../src/core/resolve';
import { SkillValidationError } from '../src/core/errors';
import { GitRefResolver } from '../src/core/git-ref-resolver';
import { SkillDescriptor } from '../src/core/types';

describe('SkillResolver', () => {
  it('resolves commits without rewriting descriptor repo/path', async () => {
    const refResolver = {
      resolve: jest.fn().mockResolvedValueOnce('fed9617111260e19f4f54b72a2874a3f3de8ff94'),
    } as unknown as GitRefResolver;

    const resolver = new SkillResolver(refResolver);
    const descriptor: SkillDescriptor = {
      name: 'react-query-skill',
      repo: 'https://github.com/mhdcodes/react-query-skill',
      path: '.',
      ref: 'main',
    };

    const [result] = await resolver.resolve([descriptor]);

    expect(refResolver.resolve).toHaveBeenCalledTimes(1);
    expect(refResolver.resolve).toHaveBeenCalledWith('https://github.com/mhdcodes/react-query-skill', 'main');
    expect(result).toEqual({
      name: 'react-query-skill',
      repo: 'https://github.com/mhdcodes/react-query-skill',
      path: '.',
      ref: 'main',
      commit: 'fed9617111260e19f4f54b72a2874a3f3de8ff94',
      timestamp: expect.any(String),
    });
  });

  it('propagates resolver errors', async () => {
    const refResolver = {
      resolve: jest.fn().mockRejectedValueOnce(new SkillValidationError('Unable to resolve ref "main"')),
    } as unknown as GitRefResolver;

    const resolver = new SkillResolver(refResolver);

    await expect(
      resolver.resolve([
        {
          name: 'react-query-skill',
          repo: 'https://github.com/mhdcodes/react-query-skill',
          path: '.',
          ref: 'main',
        },
      ]),
    ).rejects.toThrow('Unable to resolve ref "main"');

    expect(refResolver.resolve).toHaveBeenCalledTimes(1);
  });
});
