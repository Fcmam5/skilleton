import { SkillsetEnvironment } from '../env';

export interface CommandArgs {
  positional: string[];
  flags: Record<string, string | boolean>;
}

export interface Command {
  run(env: SkillsetEnvironment, args: CommandArgs): Promise<void>;
}
