/*
 * sdk的log模块
 *
 * create by zengxx on 2018-11-22
 */

var config = require('./sdk_config');

var log = {};

var adapter = function (name, func) {
    var _name = name;

    return function () {
        if (!config.baseInfo.debug) {
            return ;
        }
        
        var info = 'sdk.' + _name + '  ===>  ';
        for (var i=0, len = arguments.length; i<len;i++) {
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

