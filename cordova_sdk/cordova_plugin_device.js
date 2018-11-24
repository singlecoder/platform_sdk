/*
 * cordova_sdk
 * 设备信息插件：https://github.com/apache/cordova-plugin-device
 *
 * create by zengxx on 2018-11-22
 */

var Device = function () {
	this._uuid = window['device']['uuid'];
	this._platform = window['device']['platform'];
};

Device.prototype.getUuid = function () {
	return this._uuid;
};

Device.prototype.getPlatForm = function () {
	return this._platform;
};

module.exports = Device;

