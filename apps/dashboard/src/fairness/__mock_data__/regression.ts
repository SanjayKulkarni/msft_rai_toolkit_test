// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IFairnessData } from "@responsible-ai/core-ui";

export const regression: IFairnessData = {
  predictedY: [
    [1, 1.2, 1.5, 1.4, 1, 1.2, 1.5, 1.4, 1, 1.2, 1.5, 1.4],
    [1.4, 1.5, 1.9, 1.6, 1.4, 1.5, 1.9, 1.6, 1.4, 1.5, 1.9, 1.6],
    [1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5]
  ],
  testData: [
    ["a", "1", 1],
    ["b", "2", 2],
    ["b", "2", 3],
    ["b", "3", 4],
    ["a", "1", 5],
    ["b", "2", 6],
    ["b", "2", 7],
    ["b", "3", 8],
    ["a", "1", 9],
    ["b", "2", 10],
    ["b", "2", 11],
    ["b", "3", 12]
  ],
  trueY: [
    1.1, 1.7, 0.9, 1.2, 1.5, 1.3245, 1.34265, 1.768, 1.467, 1.24, 1.87975,
    1.4587
  ]
};
