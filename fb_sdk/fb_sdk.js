/*
 * facebook小游戏 sdk
 * FBSDK
 *
 * create by zengxx on 2018-11-22
 */

var logManager = require('../sdk_log');
var loginManager = require('../sdk_login');
var config = require('../sdk_config');
var sdkTool = require('../sdk_tool');

var FBSDK = function () {
	this._supportAPIs = FBInstant.getSupportedAPIs();

	// 广告模块
	this._interstitialInstance = null;
	this._interstitialLoaded = false;

	this._rewardVideoInstance = null;
	this._rewardVideoLoaded = false;

	// 分享模块

	this._initInterstitial();
	this._initRewardVideoAd();
};

/***** 广告模块 *****/

FBSDK.prototype._initInterstitial = function () {
	if (this._supportAPIs.includes('getInterstitialAdAsync')) {
		FBInstant.getInterstitialAdAsync(
			config.fbConfig.interstitial
		).then((interstitial) => {
			this._interstitialInstance = interstitial;
			return this._interstitialInstance.loadAsync();
		}).then(() => {
			this._interstitialLoaded = true;
		}).catch((err) => {
			logManager.LOGD('_initInterstitial err ' + JSON.stringify(err));

			this._interstitialLoaded = false;
		});
	}
};

FBSDK.prototype.showInterstitial = function(successCallback, failureCallback) {
	if (this._interstitialLoaded) {
		this._interstitialInstance.showAsync().then(() => {
			successCallback();
			this._initInterstitial();
		}).catch ((err) => {
			logManager.LOGD('showInterstitial err ' + JSON.stringify(err));

			failureCallback();
			this._initInterstitial();
		});
	} else {
		this._initInterstitial();
	}
};

FBSDK.prototype._initRewardVideoAd = function () {
	if (this._supportAPIs.includes('getRewardedVideoAsync')) {
		FBInstant.getRewardedVideoAsync(
			config.fbConfig.rewardvideo
		).then((rewardvideo) => {
			this._rewardVideoInstance = rewardvideo;
			this._rewardVideoInstance.loadAsync().then(() => {
				this._rewardVideoLoaded = true;
			}).catch ((err) => {
				logManager.LOGD('_initRewardVideoAd err ' + JSON.stringify(err));

				this._rewardVideoLoaded = false;
			});
		});
	}
};

FBSDK.prototype.showRewardVideoAd = function (successCallback, failureCallback) {
	if (this._rewardVideoLoaded) {
		this._rewardVideoInstance.showAsync().then(() => {
			successCallback();
			this._initRewardVideoAd();
		}).catch((err) => {
			logManager.LOGD('showRewardVideoAd err ' + JSON.stringify(err));

			failureCallback();
			this._initRewardVideoAd();
		});
	} else {
		this._initRewardVideoAd();
	}
};

FBSDK.prototype.showAdsWithPolicy = function (successCallback, failureCallback) {
	this.showRewardVideoAd(successCallback, () => {
		this.showInterstitial(successCallback, failureCallback);
	});
};

/***** 分享模块 *****/

/*
 * 拉起分享的对话框
 * 本接口不推荐使用，无论分享出去还是直接关闭对话框，都会走同一个回调
 *
 * title: 标题
 * imageUrl: 分享的图片，本地或者url都可以
 * extraInfo: 扩展信息
 */
FBSDK.prototype.shareAsync = function (title, imageUrl, extraInfo, successCallback, failureCallback) {
	sdkTool.getBase64Image(imageUrl, (imageBase64) => {
		logManager.LOGD('get base64 image result ' + imageBase64);

		FBInstant.shareAsync({
			'intent': 'SHARE', //INVITE  REQUEST  CHALLENGE  SHARE  表明分享的意图
			'image': imageBase64,
			'text': title,
			'data': extraInfo
		}).then((ret) => {
			// 分享出去或者关闭对话框都会走这里
			successCallback && successCallback(ret);
		}).catch((err) => {
			logManager.LOGD('shareAsync error ' + JSON.stringify(err));

			failureCallback && failureCallback();
		});
	});
};

/*
 * 分享到好友和群真正调用的接口
 *
 * type: 分享类型，'friend':分享给好友 'group':分享到群
 */
FBSDK.prototype.shareToFriend = function (type, title, imageUrl, extraInfo, successCallback, failureCallback) {
	sdkTool.getBase64Image(imageUrl, (imageBase64) => {
		FBInstant.context.chooseAsync({
			'minSize': type === 'friend' ? 0 : 3
		}).then((ret) => {
			logManager.LOGD('shareToFriend successful ' + JSON.stringify(ret));

			successCallback && successCallback(ret);

			FBInstant.updateAsync({
				'action': 'CUSTOM',
				'cta': 'Join The Fight',
				'text': {
					'default':'Let us play game together',
					'localizations': {
						'en_US': title || 'Let us play game together',
						'zh_CN': title || '来玩游戏吧伙计！ '
					}
				},
				'image': imageBase64,
				'template': 'VILLAGE_INVASION',
				'data': extraInfo,
				'strategy': 'IMMEDIATE',
				'notification': 'NO_PUSH'
			}).then((ret) => {
				logManager.LOGD('shareToFriend updateAsync successful ' + JSON.stringify(ret));
			}).catch((err) => {
				logManager.LOGD('shareToFriend updateAsync fail ' + JSON.stringify(err));
			});
		}).catch((err) => {
			logManager.LOGD('shareToFriend error ' + JSON.stringify(err));

			failureCallback && failureCallback();
		});
	});
};

/***** 登录模块 *****/

FBSDK.prototype.loginBySnsId = function (successCallback, failureCallback) {
	FBInstant.player.getSignedPlayerInfoAsync('my_metadata').then((result) => {
		logManager.LOGD('FBInstant.getSignedPlayerInfoAsync successful ' + JSON.stringify(result));

		return loginManager.loginBySnsIdNoVerify(result.getPlayerID(), {
			'snsId': 'fbinstant:' + result.getPlayerID(),
			'name': FBInstant.player.getName(),
			'purl': FBInstant.player.getPhoto(),
			'fb_appid': config.fbConfig.appId,
			'signature': ''
		});
	}).then((ret) => {
		logManager.LOGD('FBSDK.loginBySnsId successful ' + JSON.stringify(ret));

		successCallback();
	}).catch((err) => {
		logManager.LOGD('FBSDK.loginBySnsId error ' + JSON.stringify(err));

		failureCallback();
	});
};

module.exports = FBSDK;

