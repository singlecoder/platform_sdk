/*
 * sdk的log模块
 *
 * create by zengxx on 2018-11-22
 */

let config = require('./sdk_config');

let log = {};

let adapter = function (name, func) {
    let _name = name;

    return function () {
        if (!config.baseInfo.debug) {
            return ;
        }
        
        let info = 'sdk.' + _name + '  ===>  ';
        for (let i=0, len = arguments.length; i<len;i++) {
            if (arguments[i] === undefined) {
                info += "undefined" + ' ';
            } else {
                info += arguments[i].toString() + ' ';
            }
        }

        func(info);
    };
};

log.LOGD = adapter('LOGD', function (info) {
    console.log(info);
});

log.LOGW = adapter('LOGW', function (info) {
    console.warn(info);
});

log.LOGE = adapter('LOGE', function (info) {
    console.error(info);
});

module.exports = log;

