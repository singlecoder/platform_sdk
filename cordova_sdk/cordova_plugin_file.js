/*
 * cordova_sdk
 * 文件系统插件：https://github.com/apache/cordova-plugin-file
 *
 * create by zengxx on 2018-11-22
 */

var logManager = require('../sdk_log');

var FileUtil = function () {

};

/*
 * 私有文件操作api，保存数据
 *
 * dataObj: 需要保存的数据，Blob对象 new Blob(['the info to write'], { type: 'text/plain' })
 * isAppend: 是否在文件尾添加内容
 */
FileUtil.prototype._writeFile = function (fileEntry, dataObj, isAppend, callback) {
    fileEntry['createWriter'](function (fileWriter) {
        fileWriter['onwriteend'] = function () {
            logManager.LOGD('successful file write');
            callback(true);
        };

        fileWriter['onerror'] = function (err) {
            logManager.LOGD("failed file write: " + err.toString());
        };

        if (isAppend) {
            try {
                fileWriter['seek'](fileWriter['length']);
            }
            catch (err) {
                logManager.LOGD("file doesn't exist!");
            }
        }

        fileWriter['write'](dataObj);
    });
};

FileUtil.prototype._readFile = function (fileEntry, callback) {
    fileEntry['file'](function (file) {
        var reader = new window['FileReader']();

        reader['onloadend'] = function () {
            logManager.LOGD('successful file read: ' + fileEntry['fullPath'] + '     ' + this.result);
            callback({
                'success': true,
                'info': JSON.parse(this.result)
            });
        };

        reader['readAsText'](file);
    }, function () {
        logManager.LOGD('failed file read');
        callback({'success': false});
    });
};


/*
* 本地存储 存储用户登陆相关信息
*
* info: 需要存储的用户信息，格式为 {}
* callback: 用户信息存储成功后的回调，回调里面参数为bool，表示本次存储是否成功
*/
FileUtil.prototype.saveFile = function (filename, info, callback) {
    var that = this;
    var callback = callback || function () {
    };

    !info && (callback(false));

    window['requestFileSystem'](window['LocalFileSystem']['PERSISTENT'], 0, function (fs) {
        fs['root']['getFile'](filename, {'create': true, 'exclusive': false}, function (fileEntry) {
            // 这里看文档貌似只支持这种格式的存储
            var blob = new window['Blob']([JSON.stringify(info)], {'type': 'text/plain'});
            that._writeFile(fileEntry, blob, false, function (isSuccess) {
                callback(isSuccess);
            });
        }, function () {
            logManager.LOGD('create file fail');
            callback(false);
        });
    }, function () {
        logManager.LOGD('load file fail');
        callback(false);
    });
};

/*
 * 本地存储 获取用户登陆相关信息
 *
 * callback: 获取信息后的回调，回调函数参数格式为 {'success':true, 'info':{}}
 * callback的参数说明：
 *    success: true 表示读取成功，false 表示读取失败，这时候info字段没有意义
 *    info: 用户信息的对象
 */
FileUtil.prototype.readFile = function (filename, callback) {
    var that = this;
    var callback = callback || function () {
    };

    window['requestFileSystem'](window['LocalFileSystem']['PERSISTENT'], 0, function (fs) {
        fs['root']['getFile'](filename, {'create': true, 'exclusive': false}, function (fileEntry) {
            that._readFile(fileEntry, function (ret) {
                callback(ret);
            });
        }, function () {
            logManager.LOGD('create file fail');
            callback(false);
        });
    }, function () {
        logManager.LOGD('load file fail');
        callback(false);
    });
};

module.exports = FileUtil;

