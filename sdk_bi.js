/*
 * sdk的bi打点模块
 *
 * create by zengxx on 2018-11-23
 */

let config = require('./sdk_config');
let logManager = require('./sdk_log');
let http = require('./sdk_http');
let tool = require('./sdk_tool');

// BI 实例
let _instance = null;

class BI {
	static get instance () {
        if (!_instance) {
            _instance = new BI();
        }

        return _instance;
    }

    constructor () {
    	// TODO 打点上报信息

        this._define();
    }

    _define () {
        this.ENUM = {}; // 给实例使用的宏，只读

        // TODO BI事件 sdk内部事件ID，游戏自己的记得id大于100000

        // 设置为只读
        for (let key in this.ENUM) {
            Object.defineProperty(this.ENUM, key, {
                'writable': false
            });
        }
    }

    innerSendEvent (eventId, eventParams) {
    	// TODO 组织BI参数

        logManager.LOGD('BI打点', "eventid= " + eventId + " 描述 = " + JSON.stringify(eventParams));

        // TODO 上报BI打点
    }

    /*
     * sdk.js文件中调用，给游戏逻辑调用的打点接口
     *
     * eventId: 打点事件(必须大于100000，即从100001开始)
     * eventParams: 额外参数(默认包含参数fb_appid、fb_playerid字段,若不需要可自行修改tyfb.StateInfo.hasAppInfo值过滤),只能是一级的json,不允许多级嵌套以及array
     */
    sendEvent (eventId, eventParams) {
    	if (eventId > 100000) {
    		this.innerSendEvent(eventId, eventParams);
    	} else {
    		logManager.LOGD('BI打点格式错误, eventId不大于100000');
    	}
    }
}

module.exports = BI.instance;

