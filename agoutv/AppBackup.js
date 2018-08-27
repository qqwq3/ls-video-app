'use strict';
import React, { Component } from 'react';
import { Image, View, Text, StyleSheet, ActivityIndicator, Platform, Alert } from 'react-native';
import { Provider } from 'react-redux';
import * as Progress from 'react-native-progress';
import CodePush from "react-native-code-push";
import AppMetadata from 'react-native-app-metadata';
import {
    DEBUG,
    VERSION,
    BINARY_VERSION,
    LAUNCH_PASSWORD,
    CODEPUSH_OPTIONS,
    HEARTBEAT_DELAY,
    CHANNEL_KEY,
    DEEPLINK_SCHEMA
} from "./src/Constants";
import AgouTvApp from './src/container';
import * as api from "./src/middlewares/api";
import configureStore from './src/store/index';
import BinaryUpgrader from './src/BinaryUpgrader';
import SpreadInstance from './src/common/SpreadInstance';
import SplashScreen from 'react-native-smart-splash-screen';
import { updateFocus } from 'react-navigation-is-focused-hoc';
import { removeUserSession } from "./src/common/Storage";
import { AppPerformanceImprovement, statusBarSetPublic } from "./src/common/tool";
import clear from 'react-native-clear-cache';

const analyticsUtil = require('./src/common/AnalyticsUtil');
const staticServer = require('./src/StaticServer');

class App extends Component<{}> {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            //selectedTab:'home',
            store: configureStore(() => {
                this.initialize()
            }),
            tipText: '当前版本：' + VERSION,
            downloadProgress: 0
        };

        this.codePushDownloadDidProgress = this.codePushDownloadDidProgress.bind(this);
        this.codePushStatusDidChange = this.codePushStatusDidChange.bind(this);
        this.binaryPushStatusDidChange = this.binaryPushStatusDidChange.bind(this);
    }

    componentWillMount() {
        // 关闭启动屏幕
        SplashScreen.close({
            animationType: SplashScreen.animationType.scale,
            duration: 500,
            delay: 100,
        });
        // 设置设备状态栏
        this._starsBarSet();
        // 打包后提升App的性能
        AppPerformanceImprovement && AppPerformanceImprovement();
    }
    // 状态栏初始设置
    _starsBarSet(){
        statusBarSetPublic && statusBarSetPublic('#FFFFFF','dark-content',true);
    }
    componentDidMount() {
        // 开启本地服务器
        staticServer.run();

        try {
            analyticsUtil.pageStart('Setup');
        } catch (e) {
            console.log('app-componentDidMount-fail', e);
        }

    }

    componentWillUnmount() {
        // 关闭本地服务器
        staticServer.stop();

        try {
            analyticsUtil.pageEnd('Setup');
        } catch (e) {
            console.log(e);
        }
    }

    async initialize() {
        // 全局启动配置
        global.launchSettings = {
            // 获取渠道
            channelID: await AppMetadata.getAppMetadataBy(CHANNEL_KEY),
            // 是否是安卓
            isAndroid: Platform.OS === 'android',
            // 读取接口主机地址
            apiHosts: await api.loadHosts(),
        };

        let result = await api.launch();

        // 活动提示窗
        // if(result.data && result.data.initialMessages && result.data.initialMessages.length !== 0){
        //     Alert.alert(result.data.initialMessages[0].title,result.data.initialMessages[0].content,[
        //         {text:'关闭', onPress: () => {  }}
        //     ]);
        // }

        if (parseInt(result.code) === 0) {
            // 用户是否来自中国
            //result.data.isChina = await api.isChina(result.data.ip);
            result.data.isChina = await storage.load({key: 'isChina', id: result.data.ip});
            // 生成推广实例
            result.data.spi = SpreadInstance.create(result.data.spi);
            // 加载过的一次性公告列表
            result.data.loadedInitialMessages = await storage.load({key: 'loadedInitialMessages'});
            // 加入全局配置
            global.launchSettings = {
                ...launchSettings,
                ...result.data,
                // 计算与服务器的时间差
                deltaSeconds: result.time - parseInt(Date.now() / 1000),
            };

            // 是清除 - 缓存
            if(global.launchSettings.isClear){
                // 删除本地用户信息
                removeUserSession && removeUserSession();
                // 清除应用缓存
                clear.runClearCache(() => {
                    // 清除redux相关的缓存
                    global.persistStore && global.persistStore.purge();
                });
            }
            // 不清楚 - 缓存
            else{

            }

            // 检查二进制包是否有更新
            // this.checkJSBundleVersion();
            this.checkBinaryVersion();
        }
        else {
            let errorMes = result.message;
            if (parseInt(result.code) === 504) {
                if (!errorMes) {
                    errorMes = '网络不给力，请求超时啦';
                }
                this.setState({tipText: errorMes});
            }
            else if(parseInt(result.code) === 500){
                if (!errorMes) {
                    errorMes = '服务器内部出错啦';
                }
                this.setState({tipText: errorMes});
            }
            else {
                this.setState({tipText: '初始化错误：' + result.message});
            }
        }
    }

    checkBinaryVersion() {
        BinaryUpgrader.getInstance().check(this.binaryPushStatusDidChange, this.codePushDownloadDidProgress);
    }

    checkJSBundleVersion() {
        CodePush.sync(CODEPUSH_OPTIONS, this.codePushStatusDidChange, this.codePushDownloadDidProgress);
    }

    binaryPushStatusDidChange(status) {
        //console.log('binaryPushStatusDidChange', status);
        switch (status) {
            case CodePush.SyncStatus.UP_TO_DATE: //当前已是最新版
                this.setState({tipText: '当前版本：' + VERSION});
                return this.checkJSBundleVersion();
            case CodePush.SyncStatus.UPDATE_IGNORED: //用户忽略升级
                this.setState({tipText: '当前版本：' + VERSION});
                return this.launch();
            case CodePush.SyncStatus.UPDATE_INSTALLED: // 更新成功安装
                this.setState({tipText: '更新完成'});
                return this.checkJSBundleVersion();
            case CodePush.SyncStatus.CHECKING_FOR_UPDATE: // 正在检查更新
                return this.setState({tipText: '正在检查更新...'});
            case CodePush.SyncStatus.INSTALLING_UPDATE: // 正在安装更新
                return this.setState({tipText: '正在安装更新...', downloadProgress: 0,});
            case CodePush.SyncStatus.UNKNOWN_ERROR: // 未知错误
                this.setState({tipText: '发生未知错误，更新失败'});
                return this.launch();
            case CodePush.SyncStatus.AWAITING_USER_ACTION: // 等待用户动作
                return this.setState({tipText: '发现有可用新版本'});
            case CodePush.SyncStatus.SYNC_IN_PROGRESS: // 同步进行中
            case CodePush.SyncStatus.DOWNLOADING_PACKAGE: //正在下载更新包
                // 不作处理
                return;
        }
        this.launch();
    }

    codePushStatusDidChange(status) {
        //console.log('codePushStatusDidChange', status);
        switch (status) {
            case CodePush.SyncStatus.UP_TO_DATE: //当前已是最新版
            case CodePush.SyncStatus.UPDATE_IGNORED: //用户忽略升级
                this.setState({tipText: '当前版本：' + VERSION});
                return this.launch();
            case CodePush.SyncStatus.UPDATE_INSTALLED: // 更新成功安装
                this.setState({tipText: '更新完成'});
                return CodePush.restartApp(false);
            case CodePush.SyncStatus.CHECKING_FOR_UPDATE: // 正在检查更新
                return this.setState({tipText: '正在检查更新...'});
            case CodePush.SyncStatus.INSTALLING_UPDATE: // 正在安装更新
                return this.setState({tipText: '正在安装更新...', downloadProgress: 0,});
            case CodePush.SyncStatus.UNKNOWN_ERROR: // 未知错误
                this.setState({tipText: '发生未知错误，更新失败'});
                return this.launch();
            case CodePush.SyncStatus.AWAITING_USER_ACTION: // 等待用户动作
                return this.setState({tipText: '发现有可用新版本'});
            case CodePush.SyncStatus.SYNC_IN_PROGRESS: // 同步进行中
            case CodePush.SyncStatus.DOWNLOADING_PACKAGE: //正在下载更新包
                // 不作处理
                return;
        }
        this.launch();
    }

    codePushDownloadDidProgress(progress) {
        //console.log('codePushDownloadDidProgress', progress);
        if (typeof progress === 'object') {
            // 进度提示
            this.setState({
                tipText: '正在下载更新：' + progress.receivedBytes + '/' + progress.totalBytes,
                // 更新下载进度
                downloadProgress: progress.receivedBytes / progress.totalBytes,
            });
        } else {
            this.setState({
                tipText: '正在下载更新：' + progress + '%',
                downloadProgress: progress / 100,
            });
        }
    }

    async launch() {
        this.setState({isLoading: false});
    }

    render() {
        const {store, isLoading, downloadProgress, tipText} = this.state;

        if (isLoading) {
            const downloadProgressBar = (
                <Progress.Bar
                    color="#0076F8"
                    borderColor="#0076F8"
                    progress={downloadProgress}
                    style={styles.progressBar}
                    width={120}
                />
            );
            return (
                <View style={styles.background}>
                    {downloadProgress > 0 ? null :
                        <View style={styles.ActivityIndicatorView}>
                            <ActivityIndicator color={'#ffffff'} size={'small'} style={styles.loading}/>
                        </View>
                    }
                    {tipText ? <Text style={styles.tip}>{tipText}</Text> : null}
                    {downloadProgress > 0 ? downloadProgressBar : null}
                </View>
            );
        }

        return (
            <Provider store={store}>
                <AgouTvApp onNavigationStateChange={(prevState, currentState) => updateFocus(currentState)} />
            </Provider>
        );
    }
}

let codePushOptions = { checkFrequency: CodePush.CheckFrequency.MANUAL };
App = CodePush(codePushOptions)(App);
export default App;

const styles = StyleSheet.create({
    ActivityIndicatorView:{
        width:80,
        height:80,
        backgroundColor:'rgba(0,0,0,0.6)',
        borderRadius:6,
        justifyContent:"center",
        alignItems:'center'
    },
    background: {
        backgroundColor: '#fff',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    logo: {
        marginBottom: 20
    },
    loading: {
        //marginBottom: 20
    },
    tip: {
        color: 'rgb(64,64,64)',
        fontSize: 14,
        position:'absolute',
        bottom: 40
    },
    progressBar: {

    },
});