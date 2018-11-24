/*
 * sdk的配置文件
 *
 * create by zengxx on 2018-11-22
 */

var config = {};

// 项目配置的一些基本信息
config.baseInfo = {
	debug: true, // 是否debug模式，上线必须设置为false
	/*
	 * 根据发布的不同平台设置即可
	 * 微信小游戏：wx
	 * facebook：fb
	 * cordova：cordova
	 */
	platform: '',
    supportPlatforms: ['fb', 'cordova', 'wx'],
};

config.AdsConfig = {
    'bannerPos': 'BOTTOM_CENTER',
    isTest: config.baseInfo.debug, // 上线必须设置为false,否则不计算收益
    admobIds: {
        android: { // for Android
            banner: 'ca-app-pub-4647010395903141/5180954621',
            interstitial: 'ca-app-pub-4647010395903141/7989992939',
            rewardvideo: 'ca-app-pub-3940256099942544/5224354917',
        },
        ios: { // for iOS
            banner: 'ca-app-pub-4647010395903141/5180954621',
            interstitial: 'ca-app-pub-4647010395903141/7989992939',
            rewardvideo: 'ca-app-pub-4647010395903141/6410275819',
        },
        wp: { // for windows phone
            banner: 'ca-app-pub-4647010395903141/5180954621',
            interstitial: 'ca-app-pub-4647010395903141/7989992939',
            rewardvideo: 'ca-app-pub-4647010395903141/6410275819',
        },
    },
};

config.fbConfig = {
    interstitial: 'my_placement_id', // 插屏广告id
    rewardvideo: 'my_placement_id',  // 奖励广告id
};

config.AdjustInfo = {
    isTest: config.baseInfo.debug, // 上线必须设置为false
    appToken: 'y37hhbk3h0jk',
    eventToken: {
        START: '3zgi11',     // 启动
        REGISTER: 'rf81mo',  // 注册
        LOGIN: '9zhccv',     // 登录
    },
};

module.exports = config;

