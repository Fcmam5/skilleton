import { Command, CommandArgs } from './types';
import { parseSkillInput } from '../core/parse';
import { SkillManifest, SkillDescriptor } from '../core/types';
import { SkillsetEnvironment } from '../env';
import { InstallCommand } from './install';

export class AddCommand implements Command {
  async run(env: SkillsetEnvironment, args: CommandArgs): Promise<void> {
    const [input] = args.positional;
    if (!input) {
      throw new Error('Usage: skillset add <owner/skill[@ref]>');
    }

    const descriptor = parseSkillInput(input);
    const manifest = await env.manifestRepo.readOrInitializeManifest();
    const nextSkills = manifest.skills.filter((skill: SkillDescriptor) => skill.name !== descriptor.name);
    nextSkills.push(descriptor);
    const updated: SkillManifest = {
      ...manifest,
      skills: nextSkills,
    };

    env.validator.validate(updated);
    await env.manifestRepo.writeManifest(updated);
    console.log(`Added skill ${descriptor.name} (${descriptor.repo}/${descriptor.path}@${descriptor.ref})`);

    console.log('Installing skills...');
    const installCommand = new InstallCommand();
    await installCommand.run(env, args);
  }
}
