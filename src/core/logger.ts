/** Colored terminal logger used by CLI commands. */
export class Logger {
  // TODO: Add verbose mode

  /** Logs an informational message in blue. */
  static info(message: string): void {
    console.log(`\x1b[34m${message}\x1b[0m`);
  }

  /** Logs an error message in red. */
  static error(message: string): void {
    console.error(`\x1b[31m${message}\x1b[0m`);
  }

  /** Logs a warning message in yellow. */
  static warn(message: string): void {
    console.warn(`\x1b[33m${message}\x1b[0m`);
  }

  /** Logs a success message in green. */
  static success(message: string): void {
    console.log(`\x1b[32m${message}\x1b[0m`);
  }
}
