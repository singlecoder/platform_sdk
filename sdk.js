/*
 * 小游戏sdk，也是小游戏逻辑调用sdk的唯一入口
 * 根据发布平台，调用不同平台的sdk模块，如facebook，使用的实际就是fb_sdk
 * 各平台sdk在各自的目录下，各目录提供一个唯一入口js，和目录名保持一致
 *
 * create by zengxx on 2018-11-22
 */

var config = require('./sdk_config');
var logManager = require('./sdk_log');
var bi = require('./sdk_bi');
var tool = require('./sdk_tool');

var sdk = (function () {
    // 发布平台的sdk
    var real_sdk = null;

    return {
        // 调用本对象其他api的时候，必须保证init已经被调用
        init: function () {
            if (!real_sdk) {
                var RealSDK = null;
                switch (config.baseInfo.platform) {
                    case 'fb':
                        RealSDK = require('./fb_sdk/fb_sdk');
                        break;
                    case 'cordova':
                        RealSDK = require('./cordova_sdk/cordova_sdk');
                        break;
                    case 'wx':
                        RealSDK = require('./wx_sdk/wx_sdk');
                        break;
                    default:
                        RealSDK = function () {};
                        break;
                }

                real_sdk = new RealSDK();
                sdk._define();

                bi.init();
            }
        },

        // 私有接口，用来放置sdk提供的宏
        _define: function () {
            // 广告位置
            sdk.AD_POSITION_KEY_TOP_CENTER = real_sdk.AD_POSITION_KEY_TOP_CENTER;
            sdk.AD_POSITION_KEY_CENTER = real_sdk.AD_POSITION_KEY_CENTER;
            sdk.AD_POSITION_KEY_BOTTOM_CENTER = real_sdk.AD_POSITION_KEY_BOTTOM_CENTER;

            // adjust 事件token
            sdk.ADJUST_EVENT_TOKEN_KEY_START = real_sdk.ADJUST_EVENT_TOKEN_KEY_START;       // 启动游戏
            sdk.ADJUST_EVENT_TOKEN_KEY_REGISTER = real_sdk.ADJUST_EVENT_TOKEN_KEY_REGISTER; // 注册游戏
            sdk.ADJUST_EVENT_TOKEN_KEY_LOGIN = real_sdk.ADJUST_EVENT_TOKEN_KEY_LOGIN;       // 登录游戏
        },

        /***** 放置与各平台无关的api *****/

        // bi日志上报
        sendBIEvent: function (eventId, eventParams) {
            bi.sendBIEvent(eventId, eventParams);
        },

        /***** 放置接入的各平台相关的api *****/

        showBanner: function (position) {
            logManager.LOGD("sdk.showBanner...");
            real_sdk.showBanner && real_sdk.showBanner(position);
        },

        showBannerAtXY: function (x, y) {
            logManager.LOGD("sdk.showBannerAtXY...");
            real_sdk.showBannerAtXY && real_sdk.showBannerAtXY(x, y);
        },

        showInterstitial: function (successCallback, failureCallback) {
            logManager.LOGD("sdk.showInterstitial...");

            successCallback = successCallback || function () {};
            failureCallback = failureCallback || function () {};

            if (real_sdk.showInterstitial) {
                real_sdk.showInterstitial(successCallback, failureCallback);
            } else {
                failureCallback();
            }
        },

        showRewardVideoAd: function (successCallback, failureCallback) {
            logManager.LOGD("sdk.showRewardVideoAd...");

            successCallback = successCallback || function () {};
            failureCallback = failureCallback || function () {};

            if (real_sdk.showRewardVideoAd) {
                real_sdk.showRewardVideoAd(successCallback, failureCallback);
            } else {
                failureCallback();
            }
        },

        showAdsWithPolicy: function (successCallback, failureCallback) {
            logManager.LOGD("sdk.showAdsWithPolicy...");

            successCallback = successCallback || function () {};
            failureCallback = failureCallback || function () {};

            if (real_sdk.showAdsWithPolicy) {
                real_sdk.showAdsWithPolicy(successCallback, failureCallback);
            } else {
                failureCallback();
            }
        },

        // adjust 事件上报
        trackEvent: function (tokenKey, params) {
            logManager.LOGD('sdk.trackEvent...');
            real_sdk.trackEvent && real_sdk.trackEvent(tokenKey, params);
        },

        /*
         * 分享给好友或者群
         *
         * type: type: 分享类型，'friend':分享给好友 'group':分享到群，默认好友
         * title: 标题
         * imageUrl: 分享的图片，本地或者url都可以
         * extraInfo: 扩展信息，主要bi打点用
         */
        shareToFriend: function (type, title, imageUrl, extraInfo, successCallback, failureCallback) {
            logManager.LOGD('sdk.shareFBAsync...');

            successCallback = successCallback || function () {};
            failureCallback = failureCallback || function () {};

            if (real_sdk.shareToFriend) {
                real_sdk.shareToFriend(type || 'friend', title, imageUrl, extraInfo, successCallback, failureCallback);
            } else {
                failureCallback();
            }
        },

        // 游客登录
        loginByGuest: function (successCallback, failureCallback) {
            logManager.LOGD("sdk.loginByGuest...");

            successCallback = successCallback || function () {};
            failureCallback = failureCallback || function () {};

            if (real_sdk.loginByGuest) {
                real_sdk.loginByGuest(successCallback, failureCallback);
            } else {
                failureCallback();
            }
        },

        // 各平台账号登录
        loginBySnsId: function (successCallback, failureCallback) {
            logManager.LOGD("sdk.loginBySnsId...");

            successCallback = successCallback || function () {};
            failureCallback = failureCallback || function () {};
            
            if (real_sdk.loginBySnsId) {
                real_sdk.loginBySnsId(successCallback, failureCallback);
            } else {
                failureCallback();
            }
        },
    }
})();

module.exports = sdk;

