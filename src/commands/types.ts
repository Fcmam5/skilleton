import { SkilletonEnvironment } from '../env';

export interface CommandArgs {
  positional: string[];
  flags: Record<string, string | boolean>;
}

export interface Command {
  run(env: SkilletonEnvironment, args: CommandArgs): Promise<void>;
}
