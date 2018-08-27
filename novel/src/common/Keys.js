
'use strict';
import { Platform } from 'react-native';
import CodePush from 'react-native-code-push';
import AppMetadata from 'react-native-app-metadata';

// 配置中渠道key
export const CHANNEL_KEY = 'UMENG_CHANNEL';

// 数据请求 - key
export const CALL_API = 'CALL API';

// 本地储存 - key
export const CALL_STORAGE = 'CALL STORAGE';

// 定义用户key
export const USER_SESSION = 'userSession';

// 定义用户选择男女的key
export const SEX = 'sex';

// 公共页数控制
export const PAGE_CONTROL = 12;

// 评论页数控制
export const PAGE_CONTROL_COMMENTS = 15;

// 章节目录页数控制
export const PAGE_CATALOG = 20;

// 加载40页
export const DOUBLE_PAGE_CATALOG = 40;

// 内部应用版本号
export const VERSION = AppMetadata.ShortVersion;

const DeviceInfo = require('react-native-device-info');
// 二进制包版本号
export const BINARY_VERSION = DeviceInfo.getVersion();

// 热更新用到的部署key
export const DEPLOYMENT_KEYS = {
    android: {
        STAGING:'24c00PNUrEM2pfScI-FiL7SwyltQ0a807393-7289-4bba-ba4a-430561def6a',
        PRODUCTION: 'sZXVs0UYVhtSKY2Gt5c9_4XLd4h40a807393-7289-4bba-ba4a-430561def6a',
    },
    ios: {
        STAGING: null,
        PRODUCTION: null
    },
};













