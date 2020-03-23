import WDIOReporter from "@wdio/reporter";
import * as fs from "fs";
import * as path from "path";
import chalk from "chalk";

export function summarizeReportFile(reportFile = "regression/report.json") {
  console.log();
  console.log(chalk.bold(chalk.magenta("Visual regression report:")));
  console.log();

  summarizeReportFileInternal(reportFile, (c) => process.stdout.write(c));
}

function summarizeReportFileInternal(
  reportFile: string,
  write: (content: any) => void,
) {
  if (!fs.existsSync(reportFile)) {
    write(chalk.red(`Could not find report file: ${reportFile}\n`));
    return;
  }

  const report: any[] = JSON.parse(fs.readFileSync(reportFile, "utf8"));
  const mismatched = report.filter((e) =>
    e.matchers.some((m: any) => m.mismatch > 0),
  );

  if (mismatched.length == 0) {
    write(chalk.green("  All good.\n\n"));
    return;
  }

  for (const e of mismatched) {
    for (const m of e.matchers) {
      const expected = m.files.expected.split(path.sep);
      const browser = expected[expected.length - 3];
      write(
        `  * ${chalk.bold(e.testName)}: ${chalk.yellow(
          m.fileName,
        )} mismatched on ${browser}\n`,
      );
    }
  }

  write("\n");
  write(
    chalk.bold(chalk.yellow("  PLEASE CHECK SCREENSHOTS FOR CORRECTNESS!\n")),
  );
  write("\n");
}

export class VisualRegressionReporter extends WDIOReporter {
  private readonly reportFile: string;

  constructor(options: any) {
    /*
     * make reporter to write to the output stream by default
     */
    options = Object.assign(options, { stdout: true });
    super(options);

    this.reportFile = options.reportFile || "regression/report.json";
  }

  onRunnerEnd() {
    summarizeReportFileInternal(this.reportFile, this.write);
  }
}
