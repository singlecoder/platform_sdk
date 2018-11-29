/*
 * sdk的http模块
 *
 * create by zengxx on 2018-11-22
 */

let logManager = require('./sdk_log');

// Http 实例
let _instance = null;

class Http {
    static get instance () {
        if (!_instance) {
            _instance = new Http();
        }

        return _instance;
    }

    post (cfgObj, successcb, failcb) {
        try {
            let useJson = false;

            let xhr = new XMLHttpRequest();
            xhr.open('POST', cfgObj.url);

            if (cfgObj.headers) {

                for (let k in cfgObj.headers) {
                    xhr.setRequestHeader(k.toString(), cfgObj.headers[k]);
                    if ((k == 'content-type' || k == 'Content-type') && cfgObj.headers[k] == 'application/json;charset=UTF-8') {
                        useJson = true;
                    }
                }
            }

            if (typeof(cfgObj.headers) != 'object') {
                cfgObj.headers = {
                    'content-type': 'application/x-www-form-urlencoded;charset:UTF-8'
                };
            }

            xhr.onreadystatechange = function () {
                logManager.LOGD('http.post responseText ' + xhr.responseText);

                if(xhr.readyState == 4 && xhr.status==200){
                    if (typeof xhr.responseText === 'string') {
                        successcb && successcb(JSON.parse(xhr.responseText));
                    }else{
                        failcb && failcb();
                    }
                }
            };

            logManager.LOGD('http.post send... ' + cfgObj.url + '\n' + JSON.stringify(cfgObj.postData));

            if (useJson) {
                xhr.send(JSON.stringify(cfgObj.postData));
            } else {
                let formData = new FormData();
                for (let k in cfgObj.postData) {
                    formData.append(k.toString(), cfgObj.postData[k]);
                }
                xhr.send(formData);
            }
        } catch (err) {
            logManager.LOGE('error:', 'Http.post... ' + JSON.stringify(err));
        }
    }

    get (cfgObj, successcb, failcb) {
        try {
            let xhr = new XMLHttpRequest();
            xhr.open('GET', cfgObj.url);
            xhr.onreadystatechange = function(e) {
                logManager.LOGD('http.get responseText ' + xhr.responseText);

                if(xhr.readyState == 4 && xhr.status==200){
                    if (typeof xhr.responseText === 'string') {
                        successcb && successcb(JSON.parse(xhr.responseText));
                    }else{
                        failcb && failcb();
                    }
                }
            };

            logManager.LOGD('http.get send... ' + cfgObj.url);

            xhr.send();
        } catch(err) {
            logManager.LOGE('error:', 'Http.get... ' + JSON.stringify(err));
        }
    }
}

module.exports = Http.instance;

