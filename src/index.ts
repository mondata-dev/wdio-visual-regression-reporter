import WDIOReporter from "@wdio/reporter";
import * as fs from "fs";
import * as path from "path";
import * as chalk from "chalk";

export class VisualRegressionReporter extends WDIOReporter {
  private readonly reportFile: string;

  constructor(options: any) {
    /*
     * make reporter to write to the output stream by default
     */
    options = Object.assign(options, { stdout: true });
    super(options);

    this.reportFile = options.reportFile;
  }

  onRunnerEnd() {
    const report: any[] = JSON.parse(fs.readFileSync(this.reportFile, "utf8"));
    const mismatched = report.filter((e) =>
      e.matchers.some((m: any) => m.mismatch > 0),
    );

    this.write();
    this.write(chalk.bold(chalk.magenta("Visual regression summary:")));
    this.write();

    if (mismatched.length == 0) {
      this.write(chalk.green("  All good."));
      this.write();
      return;
    }

    for (const e of mismatched) {
      for (const m of e.matchers) {
        const expected = m.files.expected.split(path.sep);
        const browser = expected[expected.length - 3];
        this.write(
          `  * ${chalk.bold(e.testName)}: ${chalk.yellow(
            m.fileName,
          )} mismatched on ${browser}`,
        );
      }
    }

    this.write();
    this.write(
      chalk.bold(chalk.yellow("  PLEASE CHECK SCREENSHOTS FOR CORRECTNESS!")),
    );
    this.write();
  }
}
