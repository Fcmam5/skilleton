import { SkilletonEnvironment } from '../env';

/** Parsed command arguments. */
export interface CommandArgs {
  positional: string[];
  flags: Record<string, string | boolean>;
}

/** Base contract for executable commands. */
export interface Command {
  /**
   * Executes the command.
   * @param env Runtime environment with initialized services.
   * @param args Parsed command arguments.
   */
  run(env: SkilletonEnvironment, args: CommandArgs): Promise<void>;
}
