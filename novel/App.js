
'use strict';

import React, { Component } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import SplashScreen from 'react-native-smart-splash-screen';
import * as Progress from 'react-native-progress';
import CodePush from "react-native-code-push";
import AppMetadata from 'react-native-app-metadata'
import { Provider } from 'react-redux';
import { consoleDestroy, setStatusBar, setAppBrightness } from "./src/common/Tool";
import { ScaledSheet, BackgroundColor } from './src/common/Style';
import Router from './src/Route/Index';
import configureStore from './src/store/Index';
import { VERSION } from "./src/common/Keys";
import * as api from './src/common/Api';
import { sex } from "./src/common/Icons";
import BinaryUpgrader from './src/common/BinaryUpgrader';
import { commonLoad } from "./src/common/Storage";

type Props = {};

class App extends Component<Props> {
    constructor(props){
        super(props);
        this.state = {
            isLoading: true,
            tipText: '当前版本：' + VERSION,
            store: configureStore(() => { this.initialization() }),
        };
        this.sexArr = [
            {
                image: sex.boy,
                name: '男生小说'
            },
            {
                image: sex.girl,
                name: '女生小说'
            }
        ];
        this.codePushDownloadDidProgress = this.codePushDownloadDidProgress.bind(this);
        this.codePushStatusDidChange = this.codePushStatusDidChange.bind(this);
        this.binaryPushStatusDidChange = this.binaryPushStatusDidChange.bind(this);
    }
    async componentWillMount(){
        // 打包时清除所有console
        consoleDestroy && consoleDestroy();

        // 状态栏设置
        setStatusBar && setStatusBar('#FFFFFF',true);

        // 设置日间或者夜间模式
        this.modeAutoChange();
    }
    // 设置日间或者夜间模式 - function
    async modeAutoChange(){
        let mode = await commonLoad('modeChange');

        if(mode){
            mode.value ?  setAppBrightness(0.05) : setAppBrightness(0.20);
        }
        else{
            setAppBrightness(0.20);
        }
    }
    componentDidMount() {
        // 关闭启动动画图
        this._splashScreen(500, 500);
    }
    // 关闭启动动画图 - function
    _splashScreen(duration: number | string = 500, delay: number | string = 500){
        SplashScreen.close({
            animationType: SplashScreen.animationType.scale,
            duration: duration,
            delay: delay
        });
    }
    // 初始化 - function
    async initialization(){
        // 全局启动配置
        global.launchSettings = {
            // 获取渠道
            channelID: '',//await AppMetadata.getAppMetadataBy(CHANNEL_KEY),
            agentTag: __DEV__ ? 10 : await AppMetadata.getWalleAppMetadata(),
        };

        let result = await api.launch();

        if (parseInt(result.code) === 0) {
            // 加入全局配置
            global.launchSettings = {
                ...launchSettings,
                ...result.data
            };
            this.checkBinaryVersion();
            //this.setState({isLoading: false});
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
        //CodePush.sync(CODEPUSH_OPTIONS, this.codePushStatusDidChange, this.codePushDownloadDidProgress);
        this.launch();
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
                    <ActivityIndicator color={BackgroundColor.bg_f3916b} style={styles.loading} />
                    {this.state.tipText ? <Text style={styles.tip}>{ tipText }</Text> : null}
                    {this.state.downloadProgress > 0 ? downloadProgressBar : null}
                </View>
            );
        }

        return (
            <Provider store={store}>
                <Router/>
            </Provider>
        );
    }
}

export default App;

const styles = ScaledSheet.create({
    background: {
        backgroundColor: '#fff',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    ActivityIndicatorView:{
        width:80,
        height:80,
        backgroundColor:'rgba(0,0,0,0.6)',
        borderRadius:6,
        justifyContent:"center",
        alignItems:'center'
    },
    image: {
        width: '120@s',
        height: '120@vs',
        marginBottom: '20@ms',
    },
    jumpRow: {
        position: 'relative',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: '40@ms',
    },
    jumpBox: {
        height: '50@vs',
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingRight: '15@ms',
    },
    selectTitle: {
        marginVertical: '60@ms',
    },
    errorMes: {
        marginHorizontal: '15@ms',
    },
    emptyView: {
        width: '100%',
        height: '20@vs',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    welcome: {
        fontSize: '20@ms',
        textAlign: 'center',
        margin: '10@ms',
    },
    loading: {
        position: 'absolute',
        bottom: 100,
    },
    tip: {
        color: 'rgb(64,64,64)',
        fontSize: 14,
        position:'absolute',
        bottom: 40
    },
    progressBar: {
        position: 'absolute',
        bottom: 30,
    },
});
