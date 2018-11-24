/*
 * sdk的tool模块，提供一些通用的api
 *
 * create by zengxx on 2018-11-23
 */

var logManager = require('./sdk_log');

var tool = {};

tool.getBase64Image = function (imageUrl, callback) {
	imageUrl = imageUrl.replace('http', 'https');

	var xhr = new XMLHttpRequest();
	xhr.open('get', imageUrl, true);
	xhr.reponseType = 'blob';
	
	xhr.onload = function () {
		logManager.LOGD('getBase64Image... ' + xhr.status);

		if (xhr.status === 200) {
			var blob = xhr.reponse;
			var fr = new FileReader();
			fr.onload = function(ret) {
				callback && callback(ret.target.result || '');
			};
			fr.readAsDataURL(blob);
		}
	};

	xhr.send();
};

// 纯web环境可以从这里获取uuid
tool.getUuid = function () {
	var s = [];
    var hexDigits = "0123456789abcdefghijklmnopqrstuvwxyz";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "";

    var uuid = s.join("");
    return uuid;
};

module.exports = tool;

