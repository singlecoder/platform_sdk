/*
 * cordova_sdk
 * admob插件：https://github.com/floatinghotpot/cordova-admob-pro
 *
 * create by zengxx on 2018-11-22
 */

var logManager = require('../sdk_log');

var AdMobObj = function (adsConfig) {
    this._ad_units = adsConfig;

    this.POSITION = {
        'TOP_CENTER': window['AdMob']['AD_POSITION']['TOP_CENTER'],
        'CENTER': window['AdMob']['AD_POSITION']['CENTER'],
        'BOTTOM_CENTER': window['AdMob']['AD_POSITION']['BOTTOM_CENTER']
    };

    this._AdStatus_Enum = {
        none: 0,
        loading: 1,
        loaded: 2,
        loadedfail: 3,
        present: 4,
        dismiss: 5,
    };

    if (/(android)/i.test(window['navigator']['userAgent'])) {
        this._admobid = this._ad_units.admobIds.android;
    } else if (/(ipod|iphone|ipad)/i.test(window['navigator']['userAgent'])) {
        this._admobid = this._ad_units.admobIds.ios;
    } else {
        this._admobid = this._ad_units.admobIds.wp;
    }

    this._rewardVideoAdStatus = this._AdStatus_Enum.none; // 状态，0：无状态，1：loading状态，2：loading失败状态，3：
    this._interstitialAdStatus = this._AdStatus_Enum.none;

    this._bannerOk = false; // banner 数据是否加载成功

    this._rewardVideoSuccessCallback = null;
    this._rewardVideoFailCallback = null;

    this._interstitialSuccessCallback = null;
    this._interstitialFailCallback = null;

    this._waitingBannerPosKey = null; // 主要是 banner 还在加载时候就调用了showBanner的情况，这个值记录显示位置的key

    this._listen();
    this._initBanner();
    this._initInterstitial();
    this._initRewardVideoAd();
};

/*
 * 需要监听的事件太多，单独拿出来
 * 如果游戏需要根据这些回调做相应操作，游戏里自己监听
 */
AdMobObj.prototype._listen = function () {
    logManager.LOGD("_listen...");

    // 从服务器加载数据失败
    window['document']['addEventListener']('onAdFailLoad', function (info) {
        logManager.LOGD("onAdFailLoad...", info, info['adType']);
        switch (info['adType']) {
            case 'banner':
                this._bannerOk = false;
                break;
            case 'interstitial':
                this._interstitialAdStatus = this._AdStatus_Enum.loadedfail;
                break;
            case 'rewardvideo':
                this._rewardVideoAdStatus = this._AdStatus_Enum.loadedfail;
                break;
            default:
                break;
        }
    }.bind(this));

    // 从服务器加载数据成功
    window['document']['addEventListener']('onAdLoaded', function (info) {
        logManager.LOGD("onAdLoaded...", info, info['adType']);
        switch (info['adType']) {
            case 'banner':
                this._bannerOk = true;

                if (this._waitingBannerPosKey) {
                    this.showBanner(this._waitingBannerPosKey);
                    this._waitingBannerPosKey = null;
                }

                break;
            case 'interstitial':
                this._interstitialAdStatus = this._AdStatus_Enum.loaded;
                break;
            case 'rewardvideo':
                this._rewardVideoAdStatus = this._AdStatus_Enum.loaded;
                break;
            default:
                break;
        }
    }.bind(this));

    // 成功播放完，发放奖励
    window['document']['addEventListener']('onAdPresent', function (info) {
        logManager.LOGD("onAdPresent...", info, info['adType']);
        // logManager.LOGD("onAdPresent..." + JSON.stringify(info));
        // TODO
        switch (info['adType']) {
            case 'banner':
                break;
            case 'interstitial':
                this._interstitialAdStatus = this._AdStatus_Enum.present;
                break;
            case 'rewardvideo':
                this._rewardVideoAdStatus = this._AdStatus_Enum.present;
                break;
            default:
                break;
        }
    }.bind(this));

    // 用户点击了广告
    window['document']['addEventListener']('onAdLeaveApp', function (info) {
        logManager.LOGD("onAdLeaveApp...", info, info['adType']);

        switch (info['adType']) {
            case 'banner':
                break;
            case 'interstitial':
                break;
            case 'rewardvideo':
                break;
            default:
                break;

        }
    }.bind(this));

    // 关闭
    window['document']['addEventListener']('onAdDismiss', function (info) {
        logManager.LOGD("onAdDismiss...", info, info['adType']);
        // TODO
        switch (info['adType']) {
            case 'banner':
                break;
            case 'interstitial':
                try {// 外部调用不可信

                    // 是否成功播放完
                    if (this._interstitialAdStatus === this._AdStatus_Enum.present) {
                        this._interstitialSuccessCallback && this._interstitialSuccessCallback();
                    } else {
                        this._interstitialFailCallback && this._interstitialFailCallback();
                    }

                } catch (e) {
                    logManager.LOGE("onAdDismiss...", info['adType'], JSON.stringify(e));
                }

                this._interstitialAdStatus = this._AdStatus_Enum.dismiss;
                this._interstitialSuccessCallback = null;
                this._interstitialFailCallback = null;
                this._initInterstitial();

                break;
            case 'rewardvideo':
                try {// 外部调用不可信
                    // 是否成功播放完
                    if (this._rewardVideoAdStatus === this._AdStatus_Enum.present) {
                        this._rewardVideoSuccessCallback && this._rewardVideoSuccessCallback();
                    } else {
                        this._rewardVideoFailCallback && this._rewardVideoFailCallback();
                    }
                } catch (e) {
                    logManager.LOGE("onAdDismiss...", info['adType'], JSON.stringify(e));
                }
                this._rewardVideoAdStatus = this._AdStatus_Enum.dismiss;
                this._rewardVideoSuccessCallback = null;
                this._rewardVideoFailCallback = null;
                this._initRewardVideoAd();

                break;
            default:
                break;
        }
    }.bind(this));
};

AdMobObj.prototype._initBanner = function () {
    logManager.LOGD("_initBanner...id:" + this._admobid.banner + "  pos: " + this._ad_units.bannerPos);

    window['AdMob']['createBanner']({
        adId: this._admobid.banner,
        position: this.POSITION[this._ad_units.bannerPos],
        isTesting: this._ad_units.isTest,
        overlap: true,
        autoShow: false
    });
};

AdMobObj.prototype._initInterstitial = function () {
    logManager.LOGD("_initInterstitial...admobid:" + JSON.stringify(this._admobid) + "ad_units:" + JSON.stringify(this._ad_units));

    window['AdMob']['prepareInterstitial']({
            adId: this._admobid.interstitial,
            isTesting: this._ad_units.isTest,
            autoShow: false
        }, function (info) {
            this._interstitialAdStatus = this._AdStatus_Enum.loading;
        }.bind(this), function (info) {
            this._interstitialAdStatus = this._AdStatus_Enum.loadedfail;
        }.bind(this)
    );
};

AdMobObj.prototype._initRewardVideoAd = function () {
    logManager.LOGD("_initRewardVideoAd...admobid:" + JSON.stringify(this._admobid) + "ad_units:" + JSON.stringify(this._ad_units));

    window['AdMob']['prepareRewardVideoAd']({
            adId: this._admobid.rewardvideo,
            isTesting: this._ad_units.isTest,
            autoShow: false
        }, function (info) {
            this._rewardVideoAdStatus = this._AdStatus_Enum.loading;
        }.bind(this), function (info) {
            this._rewardVideoAdStatus = this._AdStatus_Enum.loadedfail;
        }.bind(this)
    );
};

// 传入的是POSITION中的key，如果key找不到，就用TOP_CENTER
AdMobObj.prototype.showBanner = function (positionKey) {
    logManager.LOGD("AdMobObj.showBanner....position:" + positionKey);
    if (!this._bannerOk) {
        this._waitingBannerPosKey = positionKey || 'BOTTOM_CENTER';

        return;
    }

    var position = this.POSITION[positionKey] || this.POSITION['BOTTOM_CENTER'];
    logManager.LOGD("AdMobObj.showBanner....position:", position);
    window['AdMob']['showBanner'](position);
};

AdMobObj.prototype.showBannerAtXY = function (x, y) {
    var successCallback = function () {

    };
    var failureCallback = function () {

    };
    window['AdMob']['showBannerAtXY'](x, y, successCallback, failureCallback);
};

AdMobObj.prototype.hideBanner = function () {
    logManager.LOGD("AdMobObj.hideBanner....");

    window['AdMob']['hideBanner']();
};

AdMobObj.prototype.showInterstitial = function (successCallback, failureCallback) {
    logManager.LOGD("AdMobObj.showInterstitial....");

    this._interstitialSuccessCallback = successCallback;
    this._interstitialFailCallback = failureCallback;

    if (this._interstitialAdStatus === this._AdStatus_Enum.loaded) {
        logManager.LOGD("loaded......");

        window['AdMob']['isInterstitialReady'](function (isReady) {
            logManager.LOGD("AdMobObj.isInterstitialReady....", isReady);

            if (isReady) {
                window['AdMob']['showInterstitial'](function () {
                    logManager.LOGD("showInterstitial...success....");

                    this._interstitialSuccessCallback = successCallback;
                    this._interstitialFailCallback = failureCallback;
                }.bind(this), function () {
                    logManager.LOGD("showInterstitial...fail....");

                    this._rewardVideoSuccessCallback = null;
                    this._rewardVideoFailCallback = null;
                    failureCallback();
                }.bind(this));
            } else {
                logManager.LOGD("AdMobObj.isInterstitialReady.  interstitial not ready......");
                this._interstitialSuccessCallback = null;
                this._interstitialFailCallback = null;
                failureCallback();

            }
        }.bind(this));
    } else if (this._interstitialAdStatus === this._AdStatus_Enum.loadedfail
        || this._interstitialAdStatus === this._AdStatus_Enum.dismiss) {
        logManager.LOGD("loadedfail or dismiss......");

        this._interstitialSuccessCallback = null;
        this._interstitialFailCallback = null;

        this._initInterstitial();
        failureCallback();
    } else {
        logManager.LOGD("AdMobObj.showInterstitial not loaded..._interstitialAdStatus:", this._interstitialAdStatus);
        this._interstitialSuccessCallback = null;
        this._interstitialFailCallback = null;

        failureCallback();
    }
};

AdMobObj.prototype.showRewardVideoAd = function (successCallback, failureCallback) {
    logManager.LOGD("AdMobObj.showRewardVideoAd....");

    this._rewardVideoSuccessCallback = successCallback;
    this._rewardVideoFailCallback = failureCallback;

    if (this._rewardVideoAdStatus === this._AdStatus_Enum.loaded) {
        logManager.LOGD("loaded......");

        window['AdMob']['showRewardVideoAd'](function () {
            this._rewardVideoSuccessCallback = successCallback;
            this._rewardVideoFailCallback = failureCallback;
        }.bind(this), function () {
            this._rewardVideoSuccessCallback = null;
            this._rewardVideoFailCallback = null;

            failureCallback();
        }.bind(this));
    } else if (this._rewardVideoAdStatus === this._AdStatus_Enum.loadedfail
        || this._rewardVideoAdStatus === this._AdStatus_Enum.dismiss) {
        logManager.LOGD("AdMobObj.showRewardVideoAd loadedfail or dismiss......");

        this._rewardVideoSuccessCallback = null;
        this._rewardVideoFailCallback = null;

        this._initRewardVideoAd();
        failureCallback();
    } else if (this._rewardVideoAdStatus === this._AdStatus_Enum.loading) {
        logManager.LOGD("AdMobObj.showRewardVideoAd is in loading...");
        this._rewardVideoSuccessCallback = null;
        this._rewardVideoFailCallback = null;

        failureCallback();
    } else if (this._rewardVideoAdStatus === this._AdStatus_Enum.present) {
        logManager.LOGD("AdMobObj.showRewardVideoAd is present...");
        this._rewardVideoSuccessCallback = null;
        this._rewardVideoFailCallback = null;

        failureCallback();
    } else {
        logManager.LOGD("AdMobObj.showRewardVideoAd is ..._rewardVideoAdStatus:" + this._rewardVideoAdStatus);
        this._rewardVideoSuccessCallback = null;
        this._rewardVideoFailCallback = null;

        failureCallback();
    }
};

AdMobObj.prototype.showAdsWithPolicy = function (successCallback, failureCallback) {
    this.showRewardVideoAd(successCallback, function () {
        this.showInterstitial(successCallback, failureCallback);
    }.bind(this));
};

module.exports = AdMobObj;

