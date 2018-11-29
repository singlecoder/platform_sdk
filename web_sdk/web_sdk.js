/*
 * 浏览器测试 sdk
 * WebSDK
 *
 * create by zengxx on 2018-11-26
 */
let config = require('../sdk_config');
let logManager = require('../sdk_log');
let loginManager = require('../sdk_login');
let tool = require('../sdk_tool');

let WebSDK = function () {

};

WebSDK.prototype.loginByGuest = function (successCallback, failureCallback) {
	config.UserInfo.device_id = tool.getUuid();

	loginManager.loginByGuest(tool.getUuid()).then((ret) => {
		logManager.LOGD('WebSDK.loginByGuest successful ' + JSON.stringify(ret));

        successCallback();
	}).catch((err) => {
		logManager.LOGD('WebSDK.loginByGuest fail ' + JSON.stringify(err));

        failureCallback();
	});
};

WebSDK.prototype.loginBySnsIdNoVerify = function (successCallback, failureCallback) {
	config.UserInfo.device_id = tool.getUuid();
	
	loginManager.loginBySnsIdNoVerify(tool.getUuid()).then((ret) => {
		logManager.LOGD('WebSDK.loginBySnsIdNoVerify successful ' + JSON.stringify(ret));

		successCallback();
	}).catch((err) => {
		logManager.LOGD('WebSDK.loginBySnsIdNoVerify fail ' + JSON.stringify(err));

        failureCallback();
	});
};

module.exports = WebSDK;

