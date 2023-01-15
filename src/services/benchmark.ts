type MeasureResultEntry = { name: string; duration: number };

export class Benchmark {
  private marks: string[] = [];

  public mark(mark: string): void {
    performance.mark(mark);
    this.marks.push(mark);
  }

  public measure(): MeasureResultEntry[] {
    const measureResult: MeasureResultEntry[] = [];
    let preMark: string | null = null;
    this.marks.forEach((mark) => {
      if (preMark) {
        const { name, duration } = performance.measure(
          `${preMark} -> ${mark}`,
          preMark,
          mark
        );
        measureResult.push({ name, duration });
      }
      preMark = mark;
    });
    return measureResult;
  }

  public clean(): void {
    performance.clearMarks();
    performance.clearMeasures();
  }
}
