#!/usr/bin/env node

import { Command, CommandArgs } from '../src/commands/types';
import { AddCommand } from '../src/commands/add';
import { InstallCommand } from '../src/commands/install';
import { UpdateCommand } from '../src/commands/update';
import { ListCommand } from '../src/commands/list';
import { DescribeCommand } from '../src/commands/describe';
import { AuditCommand } from '../src/commands/audit';
import { createEnvironment } from '../src/env';

type CommandRegistry = Record<string, Command>;

const commands: CommandRegistry = {
  add: new AddCommand(),
  install: new InstallCommand(),
  update: new UpdateCommand(),
  list: new ListCommand(),
  describe: new DescribeCommand(),
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
      const [rawFlag, value] = token.slice(2).split('=');
      const flag = rawFlag === 'h' ? 'help' : rawFlag;
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
    } else if (token.startsWith('-') && token.length > 1) {
      const rawFlag = token.slice(1);
      const flag = rawFlag === 'h' ? 'help' : rawFlag;
      flags[flag] = true;
    } else {
      positional.push(token);
    }
  }

  return { command, args: { positional, flags } };
}

function printHelp(command?: string): void {
  if (command === 'add') {
    console.log(
      `Add a skill to your project\n\nUsage:\n  skilleton add <owner/skill[@ref]>\n\nArguments:\n  <owner/skill[@ref]>    Skill identifier (required)\n\nExamples:\n  # Add from monorepo\n  skilleton add mindrally/skills/jest\n\n  # Add from root repository\n  skilleton add mhdcodes/react-query-skill\n\n  # Add specific ref\n  skilleton add mindrally/skills/jest@main\n\n  # Add with explicit URL\n  skilleton add https://github.com/owner/repo/path/to/skill\n\nThis command:\n  1. Parses the skill identifier\n  2. Adds the skill to skilleton.json\n  3. Runs 'skilleton install' to fetch and lock the skill\n`,
    );
    return;
  }

  console.log(
    `Skilleton — Skills Skeleton\n\nUsage:\n  skilleton <command> [options]\n\nCommands:\n  add <owner/skill[@ref]>     Add a skill to skilleton.json\n  install [--agent <name>]    Install skills defined in skilleton.json\n  update [--agent <name>]     Refresh lockfile and reinstall changed skills\n  list [--format=table|json] Show declared skills and pinned commits\n  describe <skill-name>       Inspect a skill's metadata and installed contents\n  audit                       Placeholder for future audit functionality\n\nRun "skilleton <command> --help" for details.\n`,
  );
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const { command, args } = parseArgs(argv);

  if (!command || command === '--help' || command === '-h') {
    printHelp();
    return;
  }

  // Validate command first
  const handler = commands[command];
  if (!handler) {
    console.error(`Unknown command: ${command}`);
    printHelp();
    process.exitCode = 1;
    return;
  }

  // Handle individual command help (only for known commands)
  if (args.flags.help) {
    printHelp(command);
    return;
  }

  const env = createEnvironment(process.cwd());
  await handler.run(env, args);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
