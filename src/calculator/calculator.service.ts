import { Injectable } from '@nestjs/common';

@Injectable()
export class CalculatorService {
  constructor() {}

  static calculate(startTime: string, endTime: string): number {
    const a = startTime.split(':');
    const b = endTime.split(':');

    const secondsA = +a[0] * 60 * 60 + +a[1] * 60;
    const secondsB = +b[0] * 60 * 60 + +b[1] * 60;

    return secondsB - secondsA;
  }
}
