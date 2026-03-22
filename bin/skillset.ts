#!/usr/bin/env node

import { Command, CommandArgs } from '../src/commands/types';
import { AddCommand } from '../src/commands/add';
import { InstallCommand } from '../src/commands/install';
import { UpdateCommand } from '../src/commands/update';
import { ListCommand } from '../src/commands/list';
import { AuditCommand } from '../src/commands/audit';
import { createEnvironment } from '../src/env';

type CommandRegistry = Record<string, Command>;

const commands: CommandRegistry = {
  add: new AddCommand(),
  install: new InstallCommand(),
  update: new UpdateCommand(),
  list: new ListCommand(),
  audit: new AuditCommand(),
};

function parseArgs(argv: string[]): { command: string | null; args: CommandArgs } {
  if (argv.length === 0) {
    return { command: null, args: { positional: [], flags: {} } };
  }

  const [command, ...rest] = argv;
  const positional: string[] = [];
  const flags: Record<string, string | boolean> = {};

  for (let i = 0; i < rest.length; i += 1) {
    const token = rest[i];
    if (token.startsWith('--')) {
      const [flag, value] = token.slice(2).split('=');
      if (value !== undefined) {
        flags[flag] = value;
        continue;
      }

      const next = rest[i + 1];
      if (next && !next.startsWith('-')) {
        flags[flag] = next;
        i += 1;
      } else {
        flags[flag] = true;
      }
    } else {
      positional.push(token);
    }
  }

  return { command, args: { positional, flags } };
}

function printHelp(): void {
  console.log(
    `Skillset CLI\n\nUsage:\n  skillset <command> [options]\n\nCommands:\n  add <owner/skill[@ref]>     Add a skill to skillset.json\n  install [--agent <name>]    Install skills defined in skillset.json\n  update [--agent <name>]     Refresh lockfile and reinstall changed skills\n  list                        Show declared skills and pinned commits\n  audit                       Placeholder for future audit functionality\n\nRun "skillset <command> --help" for details.\n`,
  );
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const { command, args } = parseArgs(argv);

  if (!command || command === '--help' || command === '-h') {
    printHelp();
    return;
  }

  const handler = commands[command];
  if (!handler) {
    console.error(`Unknown command: ${command}`);
    printHelp();
    process.exitCode = 1;
    return;
  }

  const env = createEnvironment(process.cwd());
  await handler.run(env, args);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
