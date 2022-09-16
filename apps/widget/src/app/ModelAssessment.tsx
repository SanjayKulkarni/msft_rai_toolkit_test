// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ICausalWhatIfData,
  IErrorAnalysisMatrix,
  IHighchartBoxData
} from "@responsible-ai/core-ui";
import {
  ModelAssessmentDashboard,
  IModelAssessmentData,
  IModelAssessmentDashboardProps,
  parseFeatureFlights
} from "@responsible-ai/model-assessment";
import React from "react";

import { callFlaskService } from "./callFlaskService";
import { config } from "./config";
import { modelData as modelDataImported } from "./modelData";

export class ModelAssessment extends React.Component {
  public render(): React.ReactNode {
    const modelData: IModelAssessmentData = modelDataImported;
    const callBack: Pick<
      IModelAssessmentDashboardProps,
      | "requestExp"
      | "requestPredictions"
      | "requestDebugML"
      | "requestMatrix"
      | "requestImportances"
      | "requestCausalWhatIf"
      | "requestBoxPlotDistribution"
      | "requestGlobalCausalEffects"
      | "requestGlobalCausalPolicy"
    > = {};
    if (config.baseUrl) {
      callBack.requestExp = async (data: number): Promise<any[]> => {
        return callFlaskService(data, "/get_exp");
      };
      callBack.requestPredictions = async (data: any[]): Promise<any[]> => {
        return callFlaskService(data, "/predict");
      };
      callBack.requestMatrix = async (
        data: any[]
      ): Promise<IErrorAnalysisMatrix> => {
        return callFlaskService(data, "/matrix");
      };
      callBack.requestDebugML = async (data: any[]): Promise<any[]> => {
        return callFlaskService(data, "/tree");
      };
      callBack.requestImportances = async (data: any[]): Promise<any[]> => {
        return callFlaskService(data, "/importances");
      };
      callBack.requestCausalWhatIf = async (
        id: string,
        features: unknown[],
        featureName: string,
        newValue: unknown[],
        target: unknown[],
        abortSignal: AbortSignal
      ): Promise<ICausalWhatIfData[]> => {
        return callFlaskService(
          [id, features, featureName, newValue, target],
          "/causal_whatif",
          abortSignal
        );
      };
      callBack.requestBoxPlotDistribution = async (
        data: any
      ): Promise<IHighchartBoxData> => {
        return callFlaskService(
          data,
          "/model_overview_probability_distribution"
        );
      };
      callBack.requestGlobalCausalEffects = async (
        id: string,
        filter: unknown[],
        composite_filter: unknown[],
        abortSignal: AbortSignal
      ): Promise<ICausalWhatIfData[]> => {
        return callFlaskService(
          [id, filter, composite_filter],
          "/global_causal_effects",
          abortSignal
        );
      };
      callBack.requestGlobalCausalPolicy = async (
        id: string,
        filter: unknown[],
        composite_filter: unknown[],
        abortSignal: AbortSignal
      ): Promise<ICausalWhatIfData[]> => {
        return callFlaskService(
          [id, filter, composite_filter],
          "/global_causal_policy",
          abortSignal
        );
      };
    }

    return (
      <ModelAssessmentDashboard
        {...modelData}
        {...callBack}
        localUrl={config.baseUrl}
        locale={config.locale}
        theme={undefined}
        featureFlights={parseFeatureFlights(config.featureFlights)}
      />
    );
  }
}
