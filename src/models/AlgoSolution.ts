export abstract class AlgoSolution {
  runTime: number; // milliseconds, 3 decimal places precision
  constructor() {
    this.runTime = -1;
  }

  setRunTime(runTime: number) {
    this.runTime = runTime;
  }
  getFormattedRunTime():string {
    return this.runTime.toFixed(2) + ' ms';
  }
}
