/*
 * sdk的配置文件
 *
 * create by zengxx on 2018-11-22
 */

var config = {};

// 项目配置的一些基本信息
config.baseInfo = {
	debug: true, // 是否debug模式，上线必须设置为false
};

config.AdsConfig = {
    'bannerPos': 'BOTTOM_CENTER',
    isTest: config.baseInfo.debug, // 上线必须设置为false,否则不计算收益
    admobIds: {
        android: { // for Android
            banner: 'ca-app-pub-3180535698853578/1576771014',
            interstitial: 'ca-app-pub-3180535698853578/8688974274',
            rewardvideo: 'ca-app-pub-3180535698853578/9427340872',
        },
        ios: { // for iOS
            banner: 'ca-app-pub-3180535698853578/5843319084',
            interstitial: 'ca-app-pub-3180535698853578/4830578177',
            rewardvideo: 'ca-app-pub-3180535698853578/1629699769',
        },
        wp: { // for windows phone
            banner: '',
            interstitial: '',
            rewardvideo: '',
        },
    },
};

config.fbConfig = {
    interstitial: 'my_placement_id', // 插屏广告id
    rewardvideo: 'my_placement_id',  // 奖励广告id
    appId: '', // fb的appid
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

