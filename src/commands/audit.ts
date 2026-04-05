import { Command, CommandArgs } from './types';
import { SkilletonEnvironment } from '../env';

/** Placeholder command for future audit checks. */
export class AuditCommand implements Command {
  /**
   * Executes the current placeholder audit implementation.
   * @param _env Runtime environment.
   * @param _args Parsed command arguments.
   */
  async run(_env: SkilletonEnvironment, _args: CommandArgs): Promise<void> {
    console.log('audit not implemented yet');
  }
}
