/*
 * cordova sdk
 * CordovaSDK
 *
 * create by zengxx on 2018-11-22
 */

var config = require('../sdk_config');
var logManager = require('../sdk_log');
var loginManager = require('../sdk_login');

var AdMobObj = require('./cordova_plugin_admob');
var FileUtil = require('./cordova_plugin_file');
var Device = require('./cordova_plugin_device');
var AdjustObj = require('./cordova_plugin_adjust');

var CordovaSDK = function () {
    this._admob = new AdMobObj(config.AdsConfig); // 保存一个admob对象
    this._fileUtil = new FileUtil(); // 文件系统
    this._device = new Device(); // 设备信息
    this._adjust = new AdjustObj(config.AdjustInfo); // adjust

    // this._test();
};

// test
CordovaSDK.prototype._test = function () {
    if (!config.baseInfo.debug) {
        return ;
    }

    // device
    logManager.LOGD('device test uuid is ' + this.getUuid());
    logManager.LOGD('device test platform is ' + this.getPlatform());

    // file
    this.saveFile(this.getUuid(), 'just a test', function () {
        this.readFile(this.getUuid(), function (ret) {
            logManager.LOGD('readFile result is ' + JSON.stringify(ret));
        });
    }.bind(this));

    // adjust
    this.trackEvent(CordovaSDK.ADJUST_EVENT_TOKEN_KEY_START);
    this.trackEvent(CordovaSDK.ADJUST_EVENT_TOKEN_KEY_REGISTER);
    this.trackEvent(CordovaSDK.ADJUST_EVENT_TOKEN_KEY_LOGIN);

    // admob
    this.showBanner();
};

// Ads
CordovaSDK.prototype.showInterstitial = function (successCallback, failureCallback) {
    return this._admob.showInterstitial(successCallback, failureCallback);
};

CordovaSDK.prototype.showBanner = function (position) {
    return this._admob.showBanner(position);
};

CordovaSDK.prototype.showBannerAtXY = function (x, y) {
    return this._admob.showBannerAtXY(x, y)
};

CordovaSDK.prototype.hideBanner = function () {
    return this._admob.hideBanner();
};

CordovaSDK.prototype.showRewardVideoAd = function (successCallback, failureCallback) {
    return this._admob.showRewardVideoAd(successCallback, failureCallback);
};

CordovaSDK.prototype.showAdsWithPolicy = function (successCallback, failureCallback) {
    return this._admob.showAdsWithPolicy(successCallback, failureCallback);
};



// device
CordovaSDK.prototype.getUuid = function () {
    return this._device.getUuid();
};

CordovaSDK.prototype.getPlatform = function () {
    return this._device.getPlatForm();
};

// file
CordovaSDK.prototype.saveFile = function (filename, info, callback) {
    this._fileUtil.saveFile(filename, info, callback);
};

CordovaSDK.prototype.readFile = function (filename, callback) {
    this._fileUtil.readFile(filename, callback);
};

// adjust

/*
 * 上报事件
 * token: 事件的token
 * params: 事件的详细信息，没有的话可以不传
 */
CordovaSDK.prototype.trackEvent = function (tokenKey, params) {
    return this._adjust.trackEvent(tokenKey, params);
};

// 游客登录
CordovaSDK.prototype.loginByGuest = function (successCallback, failureCallback) {
    loginManager.loginByGuest(this.getUuid()).then(function (ret) {
        logManager.LOGD('CordovaSDK.loginByGuest successful ' + JSON.stringify(ret));

        successCallback();
    }).catch(function (err) {
        logManager.LOGD('CordovaSDK.loginByGuest fail ' + JSON.stringify(err));

        failureCallback();
    });
};

// banner 广告位置
CordovaSDK.AD_POSITION_KEY_TOP_CENTER = 'TOP_CENTER';
CordovaSDK.AD_POSITION_KEY_CENTER = 'CENTER';
CordovaSDK.AD_POSITION_KEY_BOTTOM_CENTER = 'BOTTOM_CENTER';

// adjust 事件token
CordovaSDK.ADJUST_EVENT_TOKEN_KEY_START = 'start';       // 启动游戏
CordovaSDK.ADJUST_EVENT_TOKEN_KEY_REGISTER = 'register'; // 注册游戏
CordovaSDK.ADJUST_EVENT_TOKEN_KEY_LOGIN = 'login';       // 登录游戏

module.exports = CordovaSDK;

