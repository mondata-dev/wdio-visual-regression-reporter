import WDIOReporter from "@wdio/reporter";

export class VisualRegressionReporter extends WDIOReporter {
  constructor(options: any) {
    /*
     * make reporter to write to the output stream by default
     */
    options = Object.assign(options, { stdout: true });
    super(options);
  }

  onRunnerEnd() {
    this.write("YEY");
  }
}
