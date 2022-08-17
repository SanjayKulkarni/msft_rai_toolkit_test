// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  FocusZone,
  DetailsList,
  DetailsHeader,
  IDetailsHeaderProps,
  IRenderFunction,
  IGroup,
  IColumn,
  Image,
  Text,
  Stack
} from "@fluentui/react";
import { IVisionListItem } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

export interface ITableListProps {
  errorInstances: IVisionListItem[];
  successInstances: IVisionListItem[];
  imageDim: number;
  pageSize: number;
  selectItem: (item: IVisionListItem) => void;
}

export interface ITableListState {
  items: IVisionListItem[];
  groups: IGroup[];
  columns: IColumn[];
}

export class TableList extends React.Component<
  ITableListProps,
  ITableListState
> {
  public constructor(props: ITableListProps) {
    super(props);

    this.state = {
      columns: [],
      groups: [],
      items: []
    };
  }

  public componentDidMount(): void {
    const items: IVisionListItem[] = [];

    items.concat(...this.props.successInstances);
    items.concat(...this.props.errorInstances);

    const groups: IGroup[] = [
      {
        count: this.props.successInstances.length,
        key: "success",
        level: 0,
        name: localization.InterpretVision.Dashboard.titleBarSuccess,
        startIndex: 0
      },
      {
        count: this.props.errorInstances.length,
        key: "error",
        level: 0,
        name: localization.InterpretVision.Dashboard.titleBarError,
        startIndex: this.props.successInstances.length
      }
    ];

    const columns: IColumn[] = [
      {
        fieldName: "image",
        isResizable: true,
        key: "image",
        maxWidth: 400,
        minWidth: 200,
        name: localization.InterpretVision.Dashboard.columnOne
      },
      {
        fieldName: "index",
        isResizable: true,
        key: "index",
        maxWidth: 400,
        minWidth: 200,
        name: localization.InterpretVision.Dashboard.columnTwo
      },
      {
        fieldName: "trueY",
        isResizable: true,
        key: "truey",
        maxWidth: 400,
        minWidth: 200,
        name: localization.InterpretVision.Dashboard.columnThree
      },
      {
        fieldName: "predictedY",
        isResizable: true,
        key: "predictedy",
        maxWidth: 400,
        minWidth: 200,
        name: localization.InterpretVision.Dashboard.columnFour
      },
      {
        fieldName: "other",
        isResizable: true,
        key: "other",
        maxWidth: 400,
        minWidth: 200,
        name: localization.InterpretVision.Dashboard.columnFive
      }
    ];

    this.setState({ columns, groups, items });
  }

  public render(): React.ReactNode {
    return (
      <FocusZone style={{ width: "100%" }}>
        <DetailsList
          items={this.state.items}
          groups={this.state.groups}
          columns={this.state.columns}
          groupProps={{ showEmptyGroups: true }}
          onRenderDetailsHeader={this.onRenderDetailsHeader}
          onRenderItemColumn={this.onRenderColumn}
        />
      </FocusZone>
    );
  }

  private onRenderDetailsHeader = (
    props: IDetailsHeaderProps | undefined,
    _defaultRender?: IRenderFunction<IDetailsHeaderProps> | undefined
  ) => {
    if (!props) {
      return <div />;
    }
    return (
      <DetailsHeader
        {...props}
        ariaLabelForToggleAllGroupsButton={"Expand collapse groups"}
      />
    );
  };

  private onRenderColumn = (
    item: IVisionListItem | undefined,
    index: number | undefined,
    column?: IColumn | undefined
  ) => {
    const value =
      item && column && column.fieldName
        ? item[column.fieldName as keyof IVisionListItem]
        : "";

    const image =
      item && column && column.fieldName === "image"
        ? item["image" as keyof IVisionListItem]
        : "";

    if (typeof image === "number") {
      return <div />;
    }
    if (index) {
      index = index + 1;
    }

    return (
      <div data-is-focusable>
        <Stack
          horizontal
          tokens={{ childrenGap: "s1" }}
          onClick={this.callbackWrapper(item)}
        >
          {image ? (
            <Stack.Item>
              <Image
                src={`data:image/jpg;base64,${image}`}
                style={{
                  borderRadius: 4,
                  height: "auto",
                  width: this.props.imageDim
                }}
              />
            </Stack.Item>
          ) : (
            <Stack.Item>
              <Text>{value}</Text>
            </Stack.Item>
          )}
        </Stack>
      </div>
    );
  };

  private callbackWrapper = (item?: IVisionListItem | undefined) => () => {
    if (!item) {
      return;
    }
    this.props.selectItem(item);
  };
}