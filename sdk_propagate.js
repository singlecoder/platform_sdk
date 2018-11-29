/*
 * sdk的propagate模块
 * 直接从tyfb把接口拿过来的
 *
 * create by zengxx on 2018-11-28
 */

let config = require('./sdk_config');
let logManager = require('./sdk_log');
let http = require('./sdk_http');
let md5 = require('./sdk_md5');

// Propagate 实例
let _instance = null;

class Propagate {
	static get instance () {
        if (!_instance) {
            _instance = new Propagate();
        }

        return _instance;
    }

    constructor () {
		this._cachedShareConfig = null;
		this._rawConfigInfo = null;

		this._doHttpGetShareConfig();
    }

    getShareConfigInfoAutoWeight () {
        return this._shuffleByWeights();
    }

    _doHttpGetShareConfig () {
        let reqObj = {};
        let timeStamp = new Date().getTime();
        reqObj.act = 'api.getShareConfig';
        reqObj.time = timeStamp;
        reqObj.game_mark = config.SystemInfo.cloudId + '-' + config.SystemInfo.gameId;

        let signStr = this.getConfigSignStr(reqObj);
        let paramStrList = [];
        for (let key in reqObj) {
            paramStrList.push(key + '=' + reqObj[key]);
        }
        paramStrList.push('sign=' + signStr);

        let finalUrl = config.SystemInfo.shareManagerUrl + '?' + paramStrList.join('&');
        http.get({
        	'url': finalUrl
        }, (ret) => {
        	logManager.LOGD('sdk_propagate get share config successful ' + JSON.stringify(ret));

        	if(ret.retmsg) {
                this._rawConfigInfo = ret.retmsg;
                this.processRawShareConfigInfo();
            }
        }, (ret) => {
        	logManager.LOGD('sdk_propagate get share config fail ' + JSON.stringify(ret));

        	setTimeout(() => {
        		this._doHttpGetShareConfig();
        	}, 10000);
        });
    }

    _shuffleByWeights () {
        let ret = {};
        for (let key in this._cachedShareConfig) {
            if(key == 'shareExt') continue;
            let slotArr = this._cachedShareConfig[key];
            if (slotArr.length == 0) {
                ret[key] = {};
            } else if (slotArr.length == 1) {
                ret[key] = slotArr[0];
            } else {
                let totalWeights = slotArr.reduce(function (x, y) {
                    return x + y.weight;
                }, 0);
                let rnd = Math.random() * totalWeights;
                for (let i = 0; i < slotArr.length; i++) {
                    rnd -= slotArr[i].weight;
                    if (rnd <= 0) {
                        ret[key] = slotArr[i];
                        break;
                    }
                }
            }
        }

        return ret;
    }

    processRawShareConfigInfo () {
        this._cachedShareConfig = {};

        if (!this._rawConfigInfo) {
            return;
        }

        let sPointKeys = Object.keys(this._rawConfigInfo);
        for (let i = 0, len = sPointKeys.length; i < len; i++) {
            let sPointList = this._rawConfigInfo[sPointKeys[i]];
            let _len = sPointList.length;
            this._cachedShareConfig[sPointKeys[i]] = [];

            if (0 < _len) {
                sPointList.forEach((v) => {
                	this._cachedShareConfig[sPointKeys[i]].push(v);
                });
            }
        }
    }

    // 计算机签名
    getConfigSignStr (reqObj) {
    	let sortedKeys = Object.keys(reqObj).sort();
        let signStr = '';
        for (let i = 0; i < sortedKeys.length; i++) {
            let key = sortedKeys[i];
            if (key == 'act' || key == 'sign') {
                continue;
            } else {
                signStr += key + '=' + reqObj[key];
            }
        }
        let finalSign = md5.hex_md5('market.tuyoo.com-api-' + signStr + '-market.tuyoo-api') || '';

        return finalSign;
    }
}

module.exports = Propagate.instance;

