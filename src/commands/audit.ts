import { Command, CommandArgs } from './types';
import { SkilletonEnvironment } from '../env';

export class AuditCommand implements Command {
  async run(_env: SkilletonEnvironment, _args: CommandArgs): Promise<void> {
    console.log('audit not implemented yet');
  }
}
