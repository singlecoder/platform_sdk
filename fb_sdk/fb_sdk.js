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
var bi = require('../sdk_bi');

var FBSDK = function () {
	// 广告模块
	this._interstitialInstance = null;
	this._interstitialLoaded = false;

	this._rewardVideoInstance = null;
	this._rewardVideoLoaded = false;

	// 分享模块

	this._initInterstitial();
	this._initRewardVideoAd();
};

FBSDK.prototype.onLaunch = function () {
	if (FBSDK.isInited) {
		return ;
	} else {
		FBSDK.isInited = true;
	}

	//运行场景上下文,  POST - A facebook post. THREAD - A messenger thread. GROUP - A facebook group. SOLO - Default context
	var contextType = FBInstant.context.getType();
	//启动参数元数据,可能为null
    var entryPointData = FBInstant.getEntryPointData() || {};

    FBInstant.getEntryPointAsync().then((entrypoint) => {
    	logManager.LOGD('getEntryPointAsync successful ' + entrypoint);

    	//类似于微信小游戏的进入的场景参数
        // game_switch          (游戏切换启动）                                                                              *
        // other                (本地调试启动）                                                                              *
        // game_composer        (pc版messenger中启动)
        // games_hub            (客户端messenger中启动)
        // admin_message        (Game plays coming from a custom update within a messenger thread)          custom update                  updateAsync
        // bookmark             (来自Facebook 游戏列表中的书签界面)
        // bot_cta              (Game plays that began from a call-to-action attached to a Messenger bot message)          *
        // bot_menu             (Game plays that began from a Messenger bot menu)
        // custom_share         (Game plays started from custom shares created by the game with the share API)
        // facebook_web         (Game plays started from the Facebook front page on web)
        // feed                 (Game plays started from a Facebook feed)
        // game_cta             (Game plays that began from various call-to-action buttons on Messenger and Facebook)
        // game_search          (Game plays coming from players searching in Messenger and Facebook search)
        // game_share           (Game plays started from a generic player share of the Instant Game)
        // gameroom             (Game plays coming from Facebook Gameroom)
        // group                (Game plays that started from an entry point in a Facebook group)
        // home_screen_shortcut (Game plays coming from our Home Screen Shortcuts API (Android Only))
        // menu                 (Game plays coming from a Messenger menu)
        // notification         (Game plays initiated by a player engaging with a Facebook notification)
        // shareable_link       (Game plays that began from a deep link to the game (such as our Instant Game “m.me” links))
        // score_share          (Game plays that started from a played-shared score)
        // video_call           (Game plays coming from the Messenger video chat entry point)
        // web_games_hub        (Game plays started from the Instant Games hub on web, located here)
        
        var event_param = entryPointData;
        if(!event_param.from_type){
            event_param.from_type = 'normal';
            event_param.from_param = '';
        }
        event_param.entrypoint = entryPoint;
        event_param.fb_id = FBInstant.player.getID().toString();
        event_param.contextType = contextType;

        config.UserInfo.scene_id = entryPoint;
        config.UserInfo.scene_param = event_param;
        config.UserInfo.device_id = sdkTool.uuidTo32(FBInstant.player.getID());

        bi.innerSendEvent(bi.ENUM.ON_LAUNCH, event_param);

    }).catch((err) => {
    	logManager.LOGD('getEntryPointAsync fail ' + JSON.stringify(err));

    });
};

/***** 广告模块 *****/

FBSDK.prototype._initInterstitial = function () {
	if (FBInstant.getSupportedAPIs().includes('getInterstitialAdAsync')) {
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
	if (FBInstant.getSupportedAPIs().includes('getRewardedVideoAsync')) {
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
FBSDK.prototype.shareToTimeline = function (title, imageUrl, extraInfo, successCallback, failureCallback) {
	// bi打点信息
	var extData = {
        'from_type': 'share',
        'share_type': 'indirect',
        'share_uuid' : config.UserInfo.uuid.toString(),
        'from_user_id' : config.UserInfo.userId.toString(),
        'from_fb_id' : config.UserInfo.playerId.toString(),
        'fb_id' : config.UserInfo.playerId.toString(),
        'share_point_id' : extraInfo.sharePointId,
        'share_scheme_id' : extraInfo.shareSchemeId
    };

    bi.innerSendEvent(bi.ENUM.FB_SHARE_SYNC, extData);

	sdkTool.getBase64Image(imageUrl, (imageBase64) => {
		logManager.LOGD('get base64 image result ' + imageBase64);

		FBInstant.shareAsync({
			'intent': 'SHARE', //INVITE  REQUEST  CHALLENGE  SHARE  表明分享的意图
			'image': imageBase64,
			'text': title,
			'data': extraInfo
		}).then((ret) => {
			logManager.LOGD('shareToTimeline successful ' + JSON.stringify(ret));

			// 分享出去或者关闭对话框都会走这里
			successCallback && successCallback(extraInfo);
		}).catch((err) => {
			logManager.LOGD('shareToTimeline error ' + JSON.stringify(err));

			failureCallback && failureCallback(extraInfo);
		});
	});
};

/*
 * 分享到好友和群真正调用的接口
 *
 * type: 分享类型，'friend':分享给好友 'group':分享到群
 */
FBSDK.prototype.shareToFriend = function (type, title, imageUrl, extraInfo, successCallback, failureCallback) {
	// bi打点信息
	var extData = {
        'from_type': 'share',
        'share_type': type,
        'share_uuid' : config.UserInfo.uuid.toString(),
        'from_user_id' : config.UserInfo.userId.toString(),
        'from_fb_id' : config.UserInfo.playerId.toString(),
        'fb_id' : config.UserInfo.playerId.toString(),
        'share_point_id' : extraInfo.sharePointId,
        'share_scheme_id' : extraInfo.shareSchemeId
    };

    var eventId = type === 'friend' ? bi.ENUM.FB_SHARE_FRIEND : bi.ENUM.FB_SHARE_GROUP;
    bi.innerSendEvent(eventId, extData);

	sdkTool.getBase64Image(imageUrl, (imageBase64) => {
		FBInstant.context.chooseAsync({
			'minSize': type === 'friend' ? 0 : 3
		}).then((ret) => {
			logManager.LOGD('shareToFriend successful ' + JSON.stringify(ret));

			var eventId = type === 'friend' ? bi.ENUM.FB_SHARE_FRIEND_SUCCESS : bi.ENUM.FB_SHARE_GROUP_SUCCESS;
   			bi.innerSendEvent(eventId, extData);

			successCallback && successCallback(extraInfo);

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

			var eventId = type === 'friend' ? bi.ENUM.FB_SHARE_FRIEND_FAIL : bi.ENUM.FB_SHARE_GROUP_FAIL;
   			bi.innerSendEvent(eventId, extData);

			failureCallback && failureCallback(extraInfo);
		});
	});
};

/***** 登录模块 *****/

FBSDK.prototype.loginBySnsId = function (successCallback, failureCallback) {
	bi.innerSendEvent(bi.ENUM.GET_FB_PLAYER_INFO_START, config.UserInfo.scene_param);

	FBInstant.player.getSignedPlayerInfoAsync('my_metadata').then((result) => {
		logManager.LOGD('FBInstant.getSignedPlayerInfoAsync successful ' + JSON.stringify(result));

		bi.innerSendEvent(bi.ENUM.GET_FB_PLAYER_INFO_SUCCESS, config.UserInfo.scene_param);

		// 初始化一些配置信息
		config.UserInfo.playerId = result.getPlayerID();
		config.UserInfo.device_id = sdkTool.uuidTo32(FBInstant.player.getID());

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

		bi.innerSendEvent(bi.ENUM.GET_FB_PLAYER_INFO_FAIL, config.UserInfo.scene_param);

		failureCallback();
	});
};

module.exports = FBSDK;

