/// <reference path="../typings/tsd.d.ts" />
declare class AppInsightsDatasource {
    private $q;
    private backendSrv;
    private templateSrv;
    name: string;
    appId: any;
    apiKey: any;
    apiUrl: string;
    /** @ngInject */
    constructor(instanceSettings: any, $q: any, backendSrv: any, templateSrv: any);
    query(options: any): any;
    makeMultipleRequests(requests: any): any;
    _evaluateExpression(metricsList: any): any[];
    _parseQueryResults(results: any): {
        target: any;
        datapoints: any[];
    };
    _parseValue(value: any): {
        target: any;
        datapoints: any[];
    };
    _getTargetSeries(segments: any, metric: any, aggregation: any): any[];
    _getQueryTargetSeries(segments: any): any[];
    _parseTargetAlias(value: any): any;
    _evalOperator(operator: any, op1: any, op2: any): any;
    makeRequest(request: any): any;
    testDatasource(): any;
    getAllMetadata(): any;
    getAggregations(metricName: any): any;
}
export { AppInsightsDatasource };
