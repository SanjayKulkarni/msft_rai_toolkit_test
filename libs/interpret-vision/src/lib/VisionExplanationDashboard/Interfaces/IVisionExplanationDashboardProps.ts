// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IVisionExplanationDashboardData,
  ErrorCohort
} from "@responsible-ai/core-ui";

export interface IVisionExplanationDashboardProps {
  /*
   * the interface design for the dashboard
   */
  cohorts: ErrorCohort[];
  dataSummary: IVisionExplanationDashboardData;
  requestExp?: (index: number, abortSignal: AbortSignal) => Promise<any[]>;
  selectedCohort: ErrorCohort;
  setSelectedCohort: (cohort: ErrorCohort) => void;
}
