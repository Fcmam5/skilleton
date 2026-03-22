import { Command, CommandArgs } from './types';
import { SkillsetEnvironment } from '../env';

export class AuditCommand implements Command {
  async run(_env: SkillsetEnvironment, _args: CommandArgs): Promise<void> {
    console.log('audit not implemented yet');
  }
}
