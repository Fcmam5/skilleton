export class Logger {
  // TODO: Add verbose mode

  static info(message: string): void {
    console.log(`\x1b[34m${message}\x1b[0m`);
  }

  static error(message: string): void {
    console.error(`\x1b[31m${message}\x1b[0m`);
  }

  static warn(message: string): void {
    console.warn(`\x1b[33m${message}\x1b[0m`);
  }

  static success(message: string): void {
    console.log(`\x1b[32m${message}\x1b[0m`);
  }
}
