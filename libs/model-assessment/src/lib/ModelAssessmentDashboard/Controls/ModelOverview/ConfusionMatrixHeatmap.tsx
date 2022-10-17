// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// import { getTheme, IDropdownOption } from "@fluentui/react";
import {
  Stack,
  StackItem,
  ComboBox,
  IComboBoxOption,
  IComboBox
} from "@fluentui/react";
import {
  JointDataset,
  FluentUIStyles,
  calculateConfusionMatrixData,
  defaultModelAssessmentContext,
  ModelAssessmentContext,
  HeatmapHighChart,
  ErrorCohort
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import {
  Point,
  PointOptionsObject,
  TooltipFormatterContextObject
} from "highcharts";
import * as _ from "lodash";
import React from "react";

import { modelOverviewChartStyles } from "./ModelOverviewChart.styles";
import { wrapText } from "./StatsTableUtils";

interface IConfusionMatrixProps {
  // onChooseCohorts: () => void;
  // cohorts: ErrorCohort[];
  // selectableMetrics: IDropdownOption[];
  // classes: string[];
  // items: PointOptionsObject[];
  // showColors: boolean;
  // id: string;
  id: string;
}

interface IConfusionMatrixState {
  allClasses: string[];
  selectedClasses: string[];
  selectedCohort: number;
}

interface IConfusionMatrixPoint extends Point {
  value: number;
}

export class ConfusionMatrixHeatmap extends React.Component<
  IConfusionMatrixProps,
  IConfusionMatrixState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public constructor(
    props: IConfusionMatrixProps,
    context: React.ContextType<typeof ModelAssessmentContext>
  ) {
    super(props);
    this.state = {
      allClasses: context.dataset.class_names
        ? context.dataset.class_names
        : _.range(
            Math.max(
              ...context.dataset.predicted_y!,
              ...context.dataset.true_y!
            ) + 1
          ).map((x) => `Class ${x}`),
      selectedClasses: [],
      selectedCohort: context.errorCohorts[0].cohort.getCohortID()
    };
  }

  public render(): React.ReactNode {
    const classNames = modelOverviewChartStyles();

    const selectedIndices: number[] = [];
    this.context.errorCohorts.forEach((errorCohort) => {
      if (errorCohort.cohort.getCohortID() === this.state.selectedCohort) {
        selectedIndices.push(
          ...errorCohort.cohort.unwrap(JointDataset.IndexLabel)
        );
      }
    });

    const yPred: number[] = [];
    const yTrue: number[] = [];

    selectedIndices.forEach((idx) => {
      yPred.push(this.context.dataset.predicted_y![idx]);
      yTrue.push(this.context.dataset.true_y![idx]);
    });

    const confusionMatrixData = calculateConfusionMatrixData(
      yTrue,
      yPred,
      this.state.allClasses,
      this.state.selectedClasses
    );
    const confusionMatrix: PointOptionsObject[] = [];

    confusionMatrixData!.confusionMatrix.forEach((row, rowIdx) =>
      row.forEach((it, colIdx) => {
        confusionMatrix.push({
          value: it,
          x: colIdx,
          y: rowIdx
        });
      })
    );

    const selectedLabels: string[] = confusionMatrixData!.selectedLabels;

    return (
      <Stack>
        <Stack horizontal>
          <StackItem className={classNames.dropdown}>
            <ComboBox
              id="confusionMatrixClassDropdown"
              label={
                localization.ModelAssessment.ModelOverview
                  .confusionMatrixCohortSelectionLabel
              }
              selectedKey={this.state.selectedCohort}
              options={this.context.errorCohorts.map(
                (errorCohort: ErrorCohort) => {
                  return {
                    key: errorCohort.cohort.getCohortID(),
                    text: errorCohort.cohort.name
                  };
                }
              )}
              onChange={this.onSelectCohort}
              styles={FluentUIStyles.limitedSizeMenuDropdown}
            />
          </StackItem>
          <StackItem className={classNames.dropdown}>
            <ComboBox
              id="confusionMatrixClassDropdown"
              placeholder={
                localization.ModelAssessment.ModelOverview
                  .confusionMatrixClassSelectionDefaultPlaceholder
              }
              label={
                localization.ModelAssessment.ModelOverview
                  .confusionMatrixClassSelectionLabel
              }
              selectedKey={this.state.selectedClasses}
              options={this.state.allClasses!.map((category: string) => {
                return { key: category, text: category };
              })}
              errorMessage={
                this.state.selectedClasses.length < 2 ||
                this.state.selectedClasses.length > 10
                  ? localization.ModelAssessment.ModelOverview
                      .confusionMatrixClassSelectionError
                  : undefined
              }
              onChange={this.onSelectClasses}
              multiSelect
              styles={FluentUIStyles.limitedSizeMenuDropdown}
            />
          </StackItem>
        </Stack>
        {this.state.selectedClasses.length >= 2 &&
          this.state.selectedClasses.length <= 10 && (
            <StackItem className={classNames.chart}>
              <HeatmapHighChart
                id="modelOverviewConfusionMatrix"
                configOverride={{
                  chart: {
                    marginBottom: 80,
                    marginTop: 40,
                    plotBorderWidth: 1,
                    type: "heatmap"
                  },
                  colorAxis: {
                    maxColor: "#2f7ed8",
                    min: 0,
                    minColor: "#FFFFFF"
                  },
                  legend: {
                    align: "right",
                    enabled: true,
                    layout: "vertical",
                    margin: 0,
                    symbolHeight: 275,
                    verticalAlign: "top",
                    y: 25
                  },
                  series: [
                    {
                      borderWidth: 1,
                      data: confusionMatrix,
                      dataLabels: {
                        color: "#000000",
                        enabled: true
                      },
                      type: "heatmap"
                    }
                  ],
                  tooltip: {
                    formatter: (function (comp) {
                      return function (
                        this: TooltipFormatterContextObject
                      ): string | undefined {
                        const point: IConfusionMatrixPoint = this
                          .point as IConfusionMatrixPoint;
                        const pointValueBold = `<b>${point.value} </b>`;
                        const trueClassBold = `<b>${comp.getPointCategoryName(
                          point,
                          "y"
                        )}</b>`;
                        const predictedClassBold = `<b>${comp.getPointCategoryName(
                          point,
                          "x"
                        )}</b>`;

                        return wrapText(
                          localization.formatString(
                            localization.ModelAssessment.ModelOverview
                              .confusionMatrixHeatmapTooltip,
                            pointValueBold,
                            trueClassBold,
                            predictedClassBold
                          ),
                          40,
                          10
                        );
                      };
                    })(this)
                  },

                  xAxis: {
                    categories: selectedLabels
                  },
                  yAxis: {
                    categories: selectedLabels
                  }
                }}
              />
            </StackItem>
          )}
      </Stack>
    );
  }

  private getPointCategoryName = (
    point: IConfusionMatrixPoint,
    dimension: string
  ): string => {
    const series = point.series,
      isY = dimension === "y",
      axis = series[isY ? "yAxis" : "xAxis"];
    return axis.categories[point[isY ? "y" : "x"]!];
  };

  private onSelectCohort = (
    _: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void => {
    if (item) {
      this.setState({ selectedCohort: Number(item.key) });
    }
  };

  private onSelectClasses = (
    _: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void => {
    if (item) {
      const selectedClass = item.key.toString();
      if (item.selected) {
        this.setState({
          selectedClasses: [...this.state.selectedClasses, selectedClass]
        });
      }
      if (!item.selected) {
        this.setState({
          selectedClasses: this.state.selectedClasses.filter(
            (presentClass: string) => presentClass !== selectedClass
          )
        });
      }
    }
  };
}
