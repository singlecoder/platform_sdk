/*
 * sdk的login模块，和我们的sdk对接登录
 *
 * create by zengxx on 2018-11-24
 */

var config = require('./sdk_config');
var logManager = require('./sdk_log');
var httpManager = require('./sdk_http');
var tool = require('./sdk_tool');

var login = {};

/*
 * 从sdk服务器获取token
 *
 * uuid: 玩家唯一标识
 */
login.getToken = function (uuid) {
	return new Promise(function (resolve, reject) {
		// TODO
	});
};

/*
 * 根据从sdk服务器拿到的token进行登录
 *
 * token: 从sdk服务器拿到的token
 * uuid: 玩家唯一标识
 */
login.loginByToken = function (token, uuid) {
	return new Promise(function (resolve, reject) {
		// TODO
	});
};

/*
 * 游客登录
 *
 * uuid: 玩家唯一标识
 */
login.loginByGuest = function (uuid) {
	return new Promise(function (resolve, reject) {
		resolve();
	}).then(function () {
		logManager.LOGD('get token from ' + uuid);

		return login.getToken(uuid);
	}).then(function (token) {
		logManager.LOGD('get token successful ' + token);

		return login.loginByToken(token, uuid);
	});
};

/*
 * 第三方账号登录
 *
 * uuid: 玩家唯一标识
 * snsInfo: 第三方账号的一些信息
 */
login.loginBySnsIdNoVerify = function (uuid, snsInfo) {
	return new Promise(function (resolve, reject) {
		// TODO
	});
};

module.exports = login;

