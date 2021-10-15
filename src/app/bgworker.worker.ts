/// <reference lib="webworker" />

import { PrimeCalculator } from "./worker/prime";

addEventListener('message', ({ data }) => {
  const response = PrimeCalculator.findNthPrimeNumber(parseInt(data));
  postMessage(response);
});
