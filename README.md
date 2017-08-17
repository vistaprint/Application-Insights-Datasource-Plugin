# Application Insights Datasource -  Custom Plugin
This is a simple datasource for use with Application Insights. 

## Supported Version Information
This datasource has only been tested with Grafana Version 3.0.0-beta7 and 3.0.1 stable and higher.

##To install and use

1. Add the contents of this repository to your grafana plugins directory and then restart the grafana server.
- Plugin directory: 
  - /var/lib/grafana/plugins (default)
  - /usr/local/var/lib/grafana/plugins (if installed with brew)

2. Create a new datasource and select *AppInsights* from the drop down. You will need your *Application ID*, and *API Key* for the App Insights API.