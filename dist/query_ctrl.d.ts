/// <reference path="../typings/tsd.d.ts" />
import { QueryCtrl } from 'app/plugins/sdk';
declare class AppInsightsQueryCtrl extends QueryCtrl {
    static templateUrl: string;
    refresh: any;
    datasource: any;
    metrics_types: any[];
    aggregations: any[];
    aggregationsOperand2: any[];
    type: any;
    apiTypes: any[];
    operators: any;
    operator: any;
    operand2types: any;
    operand2type: any;
    isOperand2Visible: boolean;
    isOperand2metric: boolean;
    isOperand2constant: boolean;
    /** @ngInject **/
    constructor($scope: any, $injector: any);
    getMetricOptions(): any;
    resetAggregation(metric: any): void;
    resetAggregationOperand2(metric: any): void;
    toggleType(): void;
    toggleOperand2(): void;
    toggleOperand2type(): void;
    onChangeInternal(): void;
}
export { AppInsightsQueryCtrl };
