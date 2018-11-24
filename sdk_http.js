/*
 * sdk的http模块
 *
 * create by zengxx on 2018-11-22
 */

var logManager = require('./sdk_log');

var http = {};

http.getXHR = function () {
    logManager.LOGD('initHttps');
    var xhr = null;
    if (typeof XMLHttpRequest !== 'undefined') {
        xhr = new XMLHttpRequest();
    } else {
        var versions = [
            'MSXML2.Xmlhttp.6.0', 'MSXML2.Xmlhttp.5.0', 'MSXML2.Xmlhttp.4.0',
            'MSXML2.Xmlhttp.3.0', 'MSXML2.Xmlhttp.2.0', 'Microsoft.XmlHttp'
        ];

        for (var i = 0; i < versions.length; ++i) {
            try {
                xhr = new ActiveXObject(versions[i]);
                break;
            } catch (e) {
                logManager.LOGE(e);
            }
        }
        xhr = xhr;
    }
    return xhr;
};

/**
 *
 * @param {Object} params
 * @param {String} params.url
 * @param {Object} params.data
 * @param {Function} params.callback
 */
http.request = function (params) {
    http.post(params.url, params.data, params.callback);
};

http.send = function (url, callback, method, data, async) {
    if (async === undefined) {
        async = true;
    }
    var x = http.getXHR();
    x.open(method, url, async);
    x.onreadystatechange = function () {
        if (x.readyState === 4 && (x.status >= 200 && x.status < 300)) {
            callback && callback(x.responseText);
            logManager.LOGD('callback request::', url, JSON.stringify(x));
        }
    };
    if (method === 'POST') {
        x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    }
    logManager.LOGD('send request::', url, JSON.stringify(data));
    x.send(data);
};

http.get = function (url, data, callback, async) {
    var query = [];
    for (var key in data) {
        query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    }
    http.send(url + (query.length ? '?' + query.join('&') : ''), callback, 'GET', null, async);
};

http.post = function (url, data, callback, async) {
    var query = [];
    for (var key in data) {
        query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    }
    http.send(url, callback, 'POST', query.join('&'), async);
};

module.exports = http;

