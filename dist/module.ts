import { AppInsightsDatasource } from './datasource';
import { AppInsightsQueryCtrl } from './query_ctrl';

class AppInsightsConfigCtrl {
  static templateUrl = 'partials/config.html';
}

export {
  AppInsightsDatasource as Datasource,
  AppInsightsQueryCtrl as QueryCtrl,
  AppInsightsConfigCtrl as ConfigCtrl
};
