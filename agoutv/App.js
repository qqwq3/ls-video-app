
'use strict';

import React, { Component } from 'react';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import { Provider } from 'react-redux';
import SplashScreen from 'react-native-smart-splash-screen';
import CodePush from "react-native-code-push";
import Router from './src/container/index';
import { updateFocus } from 'react-navigation-is-focused-hoc';
import { AppPerformanceImprovement, statusBarSetPublic } from "./src/common/tool";
import configureStore from './src/store/index';

const analyticsUtil = require('./src/common/AnalyticsUtil');
const staticServer = require('./src/StaticServer');

class App extends Component{
    constructor(props) {
        super(props);
        this.state = {
            store: false,
            isNetwork: true
        };
    }
    async componentWillMount() {
        // 关闭启动页动画
        this._closeSplashScreen();
        // 设置设备状态栏
        this._starsBarSet();
        // 打包后提升App的性能
        AppPerformanceImprovement();
    }
    componentDidMount() {
        this._pageStart();

        // 开启本地服务器
        staticServer.run();

        // 设置store
        this.setState({store: configureStore(() => {})});
    }
    componentWillUnmount() {
        this._pageEnd();

        // 关闭本地服务器
        staticServer.stop();
    }
    // 状态栏初始设置
    _starsBarSet(){
        statusBarSetPublic && statusBarSetPublic('#FFFFFF','dark-content',true);
    }
    // 页面初始化
    _pageStart(){
        try {analyticsUtil.pageStart('Setup');}
        catch (e) {console.log('app-componentDidMount-fail', e)}
    }
    // 页面初始化结束
    _pageEnd(){
        try {analyticsUtil.pageEnd('Setup')}
        catch (e) {console.log(e);}
    }
    // 关闭启动屏幕
    _closeSplashScreen(){
        SplashScreen.close({
            animationType: SplashScreen.animationType.scale,
            duration: 500,
            delay: 300,
        });
    }
    render() {
        const { store } = this.state;

        if(store === false){
            return (
                <View style={[styles.loading]}>
                    <ActivityIndicator size={'small'} color={'rgb(0,117,248)'}/>
                </View>
            );
        }

        return (
            <Provider store={store}>
                <Router onNavigationStateChange={(prevState, currentState) => updateFocus(currentState)}/>
            </Provider>
        );
    }
}

let codePushOptions = { checkFrequency: CodePush.CheckFrequency.MANUAL };
App = CodePush(codePushOptions)(App);
export default App;

const styles = StyleSheet.create({
    loading:{
        flex:1,
        justifyContent:'center',
        alignItems:"center",
        backgroundColor:'#FFFFFF'
    },
});