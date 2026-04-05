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
   * @param _env Runtime environment with initialized services.
   * @param _args Parsed command arguments.
   */
  run(_env: SkilletonEnvironment, _args: CommandArgs): Promise<void>;
}
