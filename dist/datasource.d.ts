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
    testDatasource(): any;
    getAllMetadata(): any;
    getAggregations(metricName: any): any;
    _parseMetricResults(results: any): any[];
    _parseValue(value: any): any[];
    _getTargetSeries(segments: any, metric: any, aggregation: any): any[];
    _parseTargetAlias(value: any): any;
    makeMultipleRequests(requests: any): any;
    makeRequest(request: any): any;
}
export { AppInsightsDatasource };
