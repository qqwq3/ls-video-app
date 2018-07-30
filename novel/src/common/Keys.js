
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

// 内部应用版本号
export const VERSION = AppMetadata.ShortVersion;

const DeviceInfo = require('react-native-device-info');
// 二进制包版本号
export const BINARY_VERSION = DeviceInfo.getVersion();


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













