/// <reference path="../typings/tsd.d.ts" />
import { QueryCtrl } from 'app/plugins/sdk';
declare class AppInsightsQueryCtrl extends QueryCtrl {
    static templateUrl: string;
    refresh: any;
    datasource: any;
    metrics_types: any[];
    aggregations: any[];
    type: any;
    /** @ngInject **/
    constructor($scope: any, $injector: any);
    getMetricOptions(): any;
    resetAggregation(metric: any): void;
    onChangeInternal(): void;
}
export { AppInsightsQueryCtrl };
