/*
 * 小游戏sdk，也是小游戏逻辑调用sdk的唯一入口
 * 根据发布平台，调用不同平台的sdk模块，如facebook，使用的实际就是fb_sdk
 * 各平台sdk在各自的目录下，各目录提供一个唯一入口js，和目录名保持一致
 *
 * create by zengxx on 2018-11-22
 */

let config = require('./sdk_config');
let logManager = require('./sdk_log');
let bi = require('./sdk_bi');
let tool = require('./sdk_tool');
let propagate = require('./sdk_propagate');

// SDK 实例
let _instance = null;

class SDK {
    static get instance () {
        if (!_instance) {
            _instance = new SDK();
        }

        return _instance;
    }

    constructor () {
        let RealSDK = null;
        let platform = tool.getPublishPlatform();
        switch (platform) {
            case 'fb':
                RealSDK = require('./fb_sdk/fb_sdk');
                break;
            case 'cordova':
                RealSDK = require('./cordova_sdk/cordova_sdk');
                break;
            case 'wx':
                RealSDK = require('./wx_sdk/wx_sdk');
                break;
            case 'web':
                RealSDK = require('./web_sdk/web_sdk');
                break;
            default:
                RealSDK = class {};
                break;
        }

        this._sdk = new RealSDK(); // 根据不同平台创建sdk
        this._define();
    }

    _define () {
        this.ENUM = {}; // 给实例使用的宏，只读

        // 广告位置
        this.ENUM.AD_POSITION_KEY_TOP_CENTER = this._sdk.AD_POSITION_KEY_TOP_CENTER;
        this.ENUM.AD_POSITION_KEY_CENTER = this._sdk.AD_POSITION_KEY_CENTER;
        this.ENUM.AD_POSITION_KEY_BOTTOM_CENTER = this._sdk.AD_POSITION_KEY_BOTTOM_CENTER;

        // adjust 事件token
        this.ENUM.ADJUST_EVENT_TOKEN_KEY_START = this._sdk.ADJUST_EVENT_TOKEN_KEY_START;       // 启动游戏
        this.ENUM.ADJUST_EVENT_TOKEN_KEY_REGISTER = this._sdk.ADJUST_EVENT_TOKEN_KEY_REGISTER; // 注册游戏
        this.ENUM.ADJUST_EVENT_TOKEN_KEY_LOGIN = this._sdk.ADJUST_EVENT_TOKEN_KEY_LOGIN;       // 登录游戏

        // 设置为只读
        for (let key in this.ENUM) {
            Object.defineProperty(this.ENUM, key, {
                'writable': false
            });
        }
    }

    /***** 放置和公司sdk相关的api *****/

    // bi日志上报，eventId必须大于100000
    sendBIEvent (eventId, eventParams) {
        bi.sendEvent(eventId, eventParams);
    }

    // 获取Propagate数据
    getPropagateInfo () {
        return propagate.getShareConfigInfoAutoWeight();
    }

    // 根据分享tag从Propagate获取单个分享点配置
    getShareInfoByTag (tag) {
        let info = this.getPropagateInfo();
        let config = info[tag] || null;

        return config;
    }

    // 随机获取一个分享点配置
    getShareInfoByRandom () {
        let config = null;
        let shareKeys = [];
        let info = this.getPropagateInfo();

        for(let key in info){
            shareKeys.push(key);
        }

        if (shareKeys && shareKeys.length > 0) {
            let randomIndex = (Math.floor(Math.random() * 10000)) % shareKeys.length;
            let sharePointKey = shareKeys[randomIndex];
            let config = info[sharePointKey];
        }

        return config;
    }

    /***** 放置接入的各平台相关的api *****/

    // 主要给需要的平台获取启动场景的参数，在主场景的onLoad中调用
    onLaunch () {
        logManager.LOGD('sdk.onLaunch...');
        this._sdk.onLaunch && this._sdk.onLaunch();
    }

    showBanner (position) {
        logManager.LOGD("sdk.showBanner...");
        this._sdk.showBanner && this._sdk.showBanner(position);
    }

    showBannerAtXY (x, y) {
        logManager.LOGD("sdk.showBannerAtXY...");
        this._sdk.showBannerAtXY && this._sdk.showBannerAtXY(x, y);
    }

    hideBanner(){
        logManager.LOGD("sdk.hideBanner...");
        this._sdk.hideBanner && this._sdk.hideBanner();
    }

    showInterstitial (successCallback, failureCallback) {
        logManager.LOGD("sdk.showInterstitial...");

        successCallback = successCallback || function () {};
        failureCallback = failureCallback || function () {};

        if (this._sdk.showInterstitial) {
            this._sdk.showInterstitial(successCallback, failureCallback);
        } else {
            failureCallback();
        }
    }

    showRewardVideoAd (successCallback, failureCallback) {
        logManager.LOGD("sdk.showRewardVideoAd...");

        successCallback = successCallback || function () {};
        failureCallback = failureCallback || function () {};

        if (this._sdk.showRewardVideoAd) {
            this._sdk.showRewardVideoAd(successCallback, failureCallback);
        } else {
            failureCallback();
        }
    }

    showAdsWithPolicy (successCallback, failureCallback) {
        logManager.LOGD("sdk.showAdsWithPolicy...");

        successCallback = successCallback || function () {};
        failureCallback = failureCallback || function () {};

        if (this._sdk.showAdsWithPolicy) {
            this._sdk.showAdsWithPolicy(successCallback, failureCallback);
        } else {
            failureCallback();
        }
    }

    // adjust 事件上报
    trackEvent (tokenKey, params) {
        logManager.LOGD('sdk.trackEvent...');
        this._sdk.trackEvent && this._sdk.trackEvent(tokenKey, params);
    }

    /*
     * 分享给好友或者群
     *
     * type: type: 分享类型，'friend':分享给好友 'group':分享到群，默认好友
     * title: 标题
     * imageUrl: 分享的图片，本地或者url都可以
     * extraInfo: 扩展信息，主要bi打点用
     */
    shareToFriend (type, title, imageUrl, extraInfo, successCallback, failureCallback) {
        logManager.LOGD('sdk.shareToFriend...');

        successCallback = successCallback || function () {};
        failureCallback = failureCallback || function () {};

        if (this._sdk.shareToFriend) {
            this._sdk.shareToFriend(type || 'friend', title, imageUrl, extraInfo, successCallback, failureCallback);
        } else {
            failureCallback();
        }
    }

    /*
     * 拉起分享到朋友圈的对话框
     *
     * title: 标题
     * imageUrl: 分享的图片，本地或者url都可以
     * extraInfo: 扩展信息，主要bi打点用
     */
    shareToTimeline (title, imageUrl, extraInfo, successCallback, failureCallback) {
        logManager.LOGD('sdk.shareToTimeline...');

        successCallback = successCallback || function () {};
        failureCallback = failureCallback || function () {};

        if (this._sdk.shareToTimeline) {
            this._sdk.shareToTimeline(title, imageUrl, extraInfo, successCallback, failureCallback);
        } else {
            failureCallback();
        }
    }

    // 游客登录
    loginByGuest (successCallback, failureCallback) {
        logManager.LOGD("sdk.loginByGuest...");

        successCallback = successCallback || function () {};
        failureCallback = failureCallback || function () {};

        if (this._sdk.loginByGuest) {
            this._sdk.loginByGuest(successCallback, failureCallback);
        } else {
            failureCallback();
        }
    }

    // 各平台账号登录
    loginBySnsId (successCallback, failureCallback) {
        logManager.LOGD("sdk.loginBySnsId...");

        successCallback = successCallback || function () {};
        failureCallback = failureCallback || function () {};
        
        if (this._sdk.loginBySnsId) {
            this._sdk.loginBySnsId(successCallback, failureCallback);
        } else {
            failureCallback();
        }
    }
};

module.exports = SDK.instance;

