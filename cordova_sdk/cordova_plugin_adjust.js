/*
 * cordova_sdk
 * adjust插件：https://github.com/adjust/cordova_sdk
 *
 * create by zengxx on 2018-11-22
 */

var logManager = require('../sdk_log');

var AdjustObj = function (config) {
	logManager.LOGD('adjust create ');

	this.config = config;
	this.EVENT_TOKEN = {
		'start':this.config.eventToken.START,
		'register':this.config.eventToken.REGISTER,
		'login':this.config.eventToken.LOGIN,
	};

	var environment = this.config.isTest ? 'EnvironmentSandbox' : 'EnvironmentProduction';
	var adjustConfig = new window['AdjustConfig'](this.config.appToken, window['AdjustConfig'][environment]);
	window['Adjust']['create'](adjustConfig);

	var logLevel = config.isTest ? 'LogLevelVerbose' : 'LogLevelError';
	adjustConfig['setLogLevel'](window['AdjustConfig'][logLevel]);
};

/*
 * 上报事件
 * token: 事件的token
 * params: 事件的详细信息，没有的话可以不传
 */
AdjustObj.prototype.trackEvent = function(tokenKey, params) {
	logManager.LOGD('adjust trackEvent ' + tokenKey + '  ' + this.EVENT_TOKEN[tokenKey]);

	var adjustEvent = new window['AdjustEvent'](this.EVENT_TOKEN[tokenKey]);
	window['Adjust']['trackEvent'](adjustEvent);
};

module.exports = AdjustObj;

