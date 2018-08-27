'use strict';

import { Dimensions, Platform } from 'react-native';
import CodePush from 'react-native-code-push';
import AppMetadata from 'react-native-app-metadata';

const DeviceInfo = require('react-native-device-info');

// 是否为debug模式
export const DEBUG = true;

// 内部应用版本号
export const VERSION = AppMetadata.ShortVersion;

// 二进制包版本号
export const BINARY_VERSION = DeviceInfo.getVersion();

// 配置中渠道key
export const CHANNEL_KEY = 'UMENG_CHANNEL';

// API 前缀
export const HOSTS = {
    //API: 'http://139.196.160.162:8088',
    //UPGRADE: 'http://139.196.160.162:8088',
    //API: 'http://api.0714mai.com',
    //UPGRADE: 'http://api.0714mai.com',
    //API: 'http://192.168.0.147:8080',
    //UPGRADE: 'http://192.168.0.147:8080',
    API: 'http://api.youdoutu.cn',
    UPGRADE: 'http://api.youdoutu.cn',
};

// 自己服务器 - code-push
// ┌────────────┬──────────────────────────
// ─────────────┐
// │ Name       │ Deployment Key                        │
// ├────────────┼──────────────────────────
// ─────────────┤
// │ Production │ rOd9oew8hZX836YFfArOBeZcfXp44ksvOXqog │
// ├────────────┼──────────────────────────
// ─────────────┤
// │ Staging    │ hp2kcDA6ESlZd8xaFjZr4a0LGoVt4ksvOXqog │
// └────────────┴──────────────────────────
// ─────────────┘

// 国外服务器 - code-push
// ────────────────────────────────────────
// ┐
// │ Name       │ Deployment Key
//   │
// ├────────────┼──────────────────────────
// ────────────────────────────────────────
// ┤
// │ Production │ MGgxcrZKCYM8xI_VMq1vTRCxNknB0a807393-7289-4bba-ba4a-430561def6a
// c │
// ├────────────┼──────────────────────────
// ────────────────────────────────────────
// ┤
// │ Staging    │ bhsBDleNcXJzmXpzD-fScfGz1gqx0a807393-7289-4bba-ba4a-430561def6a
// c │
// └────────────┴──────────────────────────
// ────────────────────────────────────────

// 热更新用到的部署key
export const DEPLOYMENT_KEYS = {
    android: {
        STAGING:'hp2kcDA6ESlZd8xaFjZr4a0LGoVt4ksvOXqog',
        PRODUCTION: 'rOd9oew8hZX836YFfArOBeZcfXp44ksvOXqog',
    },
    ios: {
        STAGING: null,
        PRODUCTION: null
    },
};

// CodePush 的配置选项
export const CODEPUSH_OPTIONS = {
    // 检测更新的频率
    // 当前设置为：每次应用激活时
    //checkFrequency: CodePush.CheckFrequency.ON_APP_RESUME,
    // 部署key
    deploymentKey: DEPLOYMENT_KEYS[Platform.OS].STAGING,
    // 安装模式
    // 当前模式：静默安装
    installMode: CodePush.InstallMode.IMMEDIATE,
    // 升级提示框
    updateDialog: {
        mandatoryContinueButtonLabel: '立即安装',
        mandatoryUpdateMessage: '重要更新，请务必安装',
        optionalIgnoreButtonLabel: '忽略',
        optionalInstallButtonLabel: '安装',
        optionalUpdateMessage: '有可用新版本，您想立即安装吗？',
        title: '有新版本啦!',
    },
};

export const Window = {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height
};

export const RefreshState = {
    Idle: 0,
    HeaderRefreshing: 1,
    FooterRefreshing: 2,
    NoMoreDataFooter: 3,
    NoMoreDataHeader: 4,
    Failure: 5,
};

export const catNav= [
    {
        id:1,
        name: '电影',
        bigTitle: '影院大片',
        bgImg: require('./pages/imgs/explorer/btn_movie.png'),
        textColor: '#C7B0FF',
        icon: require('./pages/imgs/mark_movie.png'),
        logo: require('./pages/imgs/home/quick_entrance_movie.png')
    },
    {
        id:2,
        name: '电视剧',
        bigTitle: '火热剧集',
        bgImg: require('./pages/imgs/explorer/btn_tv_show.png'),
        textColor: '#FFC76C',
        icon: require('./pages/imgs/mark_tv_chinese.png'),
        logo: require('./pages/imgs/home/quick_entrance_tv_play.png')
    },
    {
        id:4,
        name: '综艺',
        bigTitle: '热门综艺',
        bgImg: require('./pages/imgs/explorer/btn_entertainment.png'),
        textColor: '#FAFBFF',
        icon: require('./pages/imgs/mark_comedy.png'),
        logo: require('./pages/imgs/home/quick_entrance_entertainment.png')
    },
    {
        id:5,
        name: '动漫',
        bigTitle: '人气动漫',
        bgImg: require('./pages/imgs/explorer/btn_animation.png'),
        textColor: '#FF8C4D',
        icon: require('./pages/imgs/mark_animaiton.png'),
        logo: require('./pages/imgs/home/quick_entrance_animation.png')
    },
    //{id:6,  name: '小视频',  icon: require('./pages/imgs/mark_movie.png'),      logo: require('./pages/imgs/entrance_movie.png')},
    //{id:10, name: '其他',   icon: require('./pages/imgs/mark_other.png'),      logo: require('./pages/imgs/entrance_movie.png')}
];

export const  shortVideoNav = [
        {id:0,name:'推荐',type:"xigua", categoryUrl:'http://m.365yg.com/list/?count=20&ac=wap&format=json_raw&as=A1F59ABB69DF6C5&tag=video&cp=5AB94F263C956E1&min_behot_time='},
        {id:1,name:'社会',type:"pear",categoryUrl:'http://app.pearvideo.com/clt/jsp/v3/getCategoryConts.jsp?categoryId=1&start='},
        {id:2,name:'新知',type:"pear",categoryUrl:'http://app.pearvideo.com/clt/jsp/v3/getCategoryConts.jsp?categoryId=10&start='},
        {id:3,name:'世界',type:"pear",categoryUrl:'http://app.pearvideo.com/clt/jsp/v3/getCategoryConts.jsp?categoryId=2&start='},
        {id:4,name:'生活',type:"pear",categoryUrl:'http://app.pearvideo.com/clt/jsp/v3/getCategoryConts.jsp?categoryId=5&start='},
        {id:5,name:'科技',type:"pear",categoryUrl:'http://app.pearvideo.com/clt/jsp/v3/getCategoryConts.jsp?categoryId=8&start='},
        {id:6,name:'娱乐',type:"pear",categoryUrl:'http://app.pearvideo.com/clt/jsp/v3/getCategoryConts.jsp?categoryId=4&start='},
        {id:7,name:'财富',type:"pear",categoryUrl:'http://app.pearvideo.com/clt/jsp/v3/getCategoryConts.jsp?categoryId=3&start='},
        {id:8,name:'汽车',type:"pear",categoryUrl:'http://app.pearvideo.com/clt/jsp/v3/getCategoryConts.jsp?categoryId=31&start='},
        {id:9,name:'美食',type:"pear",categoryUrl:'http://app.pearvideo.com/clt/jsp/v3/getCategoryConts.jsp?categoryId=6&start='},
        {id:10,name:'体育',type:"pear",categoryUrl:'http://app.pearvideo.com/clt/jsp/v3/getCategoryConts.jsp?categoryId=9&start='},
        {id:11,name:'音乐',type:"pear",categoryUrl:'http://app.pearvideo.com/clt/jsp/v3/getCategoryConts.jsp?categoryId=59&start='},
        {id:12,name:'二次元',type:"pear",categoryUrl:'http://app.pearvideo.com/clt/jsp/v3/getCategoryConts.jsp?categoryId=17&start='},
        {id:13,name:'搞笑',type:"pear",categoryUrl:'http://app.pearvideo.com/clt/jsp/v3/getCategoryConts.jsp?categoryId=7&start='},
    ];


export const CALL_API = 'Call API';

export const CALL_STORAGE = 'CALL STORAGE';

// 启动密码
export const LAUNCH_PASSWORD = 'launchPassword';

// 观看历史
export const WATCHING_HISTORY = 'watchingHistory';

// 最大观看历史数
export const MAX_WATCHING_HISTORY = 20;

// 用户会话
export const USER_SESSION = 'userSession';

// 心跳请求的延迟
export const HEARTBEAT_DELAY = 10000;

// Deep Link 使用的协议
export const DEEPLINK_SCHEMA = 'xingren';

// 静态文件缓存名称
export const CACHE_DIR_PREFIX = 'agoutv';

export const NUM_PER_PAGE = 18;

// 最大搜索记录
export const MAX_SEARCH_HISTORY = 10;

// 搜索记录key
export const SEARCH_HISTORY = 'searchHistory';

// 我的订阅列表
export const SUBSCRIBE_SESSION = 'subScribeSession';

// 当前版本号
export const CURRENT_VERSION = 'currentVersion';

// 邀请好友限制
export const INVITE_LIMIT = 10;

// 公共图标 -  路径前缀
export const ICON_PREV_URL = 'http://download.xiyunkai.cn/icon/';





























