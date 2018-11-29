/*
 * sdk的tool模块，提供一些通用的api
 *
 * create by zengxx on 2018-11-23
 */

let logManager = require('./sdk_log');
let config = require('./sdk_config');

let tool = {};

tool.getBase64Image = function (imageUrl, callback) {
	imageUrl.indexOf('https') === -1 && (imageUrl = imageUrl.replace('http', 'https'));

	let xhr = new XMLHttpRequest();
	xhr.open('get', imageUrl, true);
	xhr.responseType = 'blob';
	
	xhr.onload = function () {
		logManager.LOGD('getBase64Image... ' + xhr.status);

		if (xhr.status === 200) {
			let blob = xhr.response;
			let fr = new FileReader();
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
	let s = [];
    let hexDigits = '0123456789abcdefghijklmnopqrstuvwxyz';
    for (let i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = '4';  // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = '';

    let uuid = s.join('');
    return uuid;
};

/*
 * 保证uuid为32位
 */
tool.uuidTo32 = function (uuid) {
	let s = [];
    s[0] = uuid;

    let len = 32 - uuid.toString().length;
    for (let i = 1; i < len+1; i++) {
        s[i] = '0';
    }

    return s.join('');
};

/*
 * 获取发布平台
 * 
 * 微信小游戏：wx
 * facebook：fb
 * cordova：cordova
 * 浏览器测试：web
 */
tool.getPublishPlatform = function () {
	if (window && window['cordova']) {
		return 'cordova';
	}

	if (window && window['FBInstant']) {
		return 'fb';
	}

	if (window && window['wx']) {
		return 'wx';
	}

	return 'web';
};

/*
 * 获取设备系统类型 ios android，其他系统暂不支持
 */
tool.getDevicePlatform = function () {
	if (/(android)/i.test(window['navigator']['userAgent'])) {
        return 'android';
    } else if (/(ipod|iphone|ipad)/i.test(window['navigator']['userAgent'])) {
        return 'ios';
    } else {
        return '';
    }
};

/*
 * 获取当前平台的clientId
 */
tool.getClientId = function () {
	let clientId = '';

	if (tool.getPublishPlatform() === 'cordova') {
		clientId = config.SystemInfo.clientIds[tool.getPublishPlatform()][tool.getDevicePlatform()] || '';
	} else {
		clientId = config.SystemInfo.clientIds[tool.getPublishPlatform()] || '';
	}

	return clientId;
};

/*
 * 获取当前平台的clientId的int值
 */
tool.getIntClientId = function () {
	let intClientId = 0;

	if (tool.getPublishPlatform() === 'cordova') {
		intClientId = config.SystemInfo.intClientIds[tool.getPublishPlatform()][tool.getDevicePlatform()] || 0;
	} else {
		intClientId = config.SystemInfo.intClientIds[tool.getPublishPlatform()] || 0;
	}

	return intClientId;
};

module.exports = tool;

