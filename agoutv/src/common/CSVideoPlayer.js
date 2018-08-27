
// 视频播放组件简单封装

'use strict';

import React, { Component } from 'react';
import {
    TouchableOpacity,
    TouchableHighlight,
    ImageBackground,
    PanResponder,
    StyleSheet,
    Animated,
    Platform,
    Image,
    View,
    Text,
    Alert,
    Dimensions,
    ActivityIndicator,
    BackHandler,
    StatusBar
} from 'react-native';
import _ from 'lodash';
import Video from 'react-native-video';
import PropTypes from 'prop-types';
import Orientation from 'react-native-orientation';
import Slider from "react-native-slider";
import SystemSetting from 'react-native-system-setting';
import GestureRecognizer, { swipeDirections } from 'react-native-swipe-gestures';
import * as DeviceInfo from 'react-native-device-info';
import KeepAwake from 'react-native-keep-awake';
import moment from 'moment';
import accounting from 'accounting';
import { toHHMMSS } from "./tool";
import { saveCommon, removeCommon } from "./Storage";

const util = require('../common/Util');
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

class CSVideoPlayer extends Component<{}>{
    static propTypes = {
        isTopControl:                   PropTypes.bool,
        topTitleNumberOfLines:          PropTypes.number,
        topTitle:                       PropTypes.bool,
        playWhenInactive:               PropTypes.bool,
        shortVideoPlayer:               PropTypes.bool,
        middlePlayBtnDisplay:           PropTypes.bool,
        longShowControls:               PropTypes.bool,
        showBottomProgress:             PropTypes.string,
        clarityArr:                     PropTypes.array,
        clarityIndex:                   PropTypes.number,
        openClarityPanel:               PropTypes.func,
        timeRecord:                     PropTypes.bool,
        timeRecordValue:                PropTypes.number,
        screen :                        PropTypes.string,
        shortVideo:                     PropTypes.bool,
        saveInfo:                       PropTypes.bool,
        CSVideoPlayerComponentWillUnmount:  PropTypes.func,
    };
    static defaultProps = {
        toggleResizeModeOnFullscreen:   true,
        playInBackground:               false,
        playWhenInactive:               false,
        showOnStart:                    true,
        resizeMode:                     'cover',
        paused:                         false,
        repeat:                         false,
        volume:                         1,
        muted:                          false,
        title:                          '',
        rate:                           1,
        activityIndicatorSize:         'small',
        activityIndicatorColor:        'rgba(0,117,248,1)',
        isTopControl:                   false,
        topTitleNumberOfLines:          1,
        topTitle:                       false,
        shortVideoPlayer:               false,
        middlePlayBtnDisplay:           false,
        longShowControls:               false,
        showBottomProgress:             'hide',
        clarityArr:                     [],
        clarityIndex:                   0,
        timeRecord:                     false,
        timeRecordValue:                0,
        screen:                         'vertical', //horizontal
        shortVideo:                     false,
        saveInfo:                       false
    };
    constructor( props ) {
        super( props );
        this.state = {
            // Video
            resizeMode: this.props.resizeMode,
            paused: this.props.paused,
            muted: this.props.muted,
            volume: this.props.volume,
            rate: this.props.rate,
            // Controls
            isFullscreen: this.props.resizeMode === 'cover' || false,
            lastScreenPress: 0,
            showControls: this.props.showOnStart,
            volumePosition: 0,
            seekerPosition: 0,
            volumeOffset: 0,
            brightnessOffset: 0,
            playerProgressOffset: 0,
            seekerOffset: 0,
            loading: true,
            currentTime: 0,
            playableDuration: 0,
            error: false,
            duration: 0,
            // 底部控制栏选择
            bottomControlSelect: false,
            // 是否显示中间的播放按钮 - 执行动画时
            display: this.props.middlePlayBtnDisplay,
            // 是否为横屏
            isLandscape: false,
            // 是否显示底部视频进度条
            isBottomProgress: false,
            isClaritySwitch: false,
            // 是否锁屏
            isLockScreen: false,
            showVideoLockFLow: true,
            // 是否显示音量 - demo
            showVolume: false,
            // 是否显示亮度 - demo
            showBrightness: false,
            // 变化的音量比率值
            changeVolumeRatio: 0,
            // 变化的亮度比率值
            changeBrightnessRatio: 0,
            currentVolumeRatio: 0,
            currentBrightnessRatio: 0,
            playerProgressRatio: 0,
            // 当前网络状态
            networkStatus: true,
            // 手动滑动是否显示时间提示框
            showGestureTime: false,
            // 手动全屏滑动播放进度条 - 默认为0
            gestureFillPlayerProgressValue: 0,
            controlPPO: false,
            currentLiveSeconds:0,
        };
        this.opts = {
            playWhenInactive: this.props.playWhenInactive,
            playInBackground: this.props.playInBackground,
            repeat: this.props.repeat,
            title: this.props.title,
        };
        this.events = {
            onError: this._onError.bind( this ),
            onBack: this._onBack.bind( this ),
            onEnd:  this._onEnd.bind( this ),
            onScreenTouch: this._onScreenTouch.bind( this ),
            onLoadStart: this._onLoadStart.bind( this ),
            onProgress: this._onProgress.bind( this ),
            onLoad: this._onLoad.bind( this ),
            onPause: this.props.onPause,
            onPlay: this.props.onPlay,
            onBuffer: this._onBuffer.bind( this ),
        };
        this.methods = {
            toggleFullscreen: this._toggleFullscreen.bind( this ),
            togglePlayPause: this._togglePlayPause.bind( this ),
            toggleControls: this._toggleControls.bind( this ),
        };
        this.player = {
            controlTimeoutDelay: this.props.controlTimeout || 6000,
            seekPanResponder: PanResponder,
            brightnessPanResponder: PanResponder,
            controlTimeout: null,
            lockFlowControlTimout: null,
            volumeWidth: 150,
            iconOffset: 7,
            seekerWidth: 0,
            ref: Video,
        };
        const initialValue = this.props.showOnStart ? 1 : 0;
        // 动画初始值设置
        this.animations = {
            bottomControl: {
                marginBottom: new Animated.Value( 0 ),
                opacity: new Animated.Value( initialValue ),
            },
            topControl: {
                marginTop: new Animated.Value( 0 ),
                opacity: new Animated.Value( initialValue ),
            },
            video: {
                opacity: new Animated.Value( 1 ),
            },
            loader: {
                rotate: new Animated.Value( 0 ),
                MAX_VALUE: 360,
            },
            middlePlayer: {
                opacity: new Animated.Value( 1 )
            },
            clarityPanelRight: {
                distance: new Animated.Value( 0 ),
            },
            fullScreen: {
                width: new Animated.Value( util.SCREEN_WIDTH ),
                height: new Animated.Value( 200 ),
            },
            videoLockFLow: {
                opacity: new Animated.Value( 1 ),
            },
            unLockScreen: {
                left: new Animated.Value( 0 ),
            },
        };
        this.styles = {
            videoStyle: this.props.videoStyle || {},
            containerStyle: this.props.style || {}
        };
        // 当前播放时间
        this.currentPlayerTimeNumber = 0;
        this.gestureConfig = {
            velocityThreshold: 0.1,
            directionalOffsetThreshold: 80
        };
        // 设备电池量
        this.batteryLevel = 0;
        this.gestureStateX = 0;
        this.gestureBrightnessStateY = 0;
        this.gestureVolumeStateY = 0;
    }
    // render之前的回调
    componentWillMount() {
        const { screen } = this.props;
        let win = Dimensions.get('window');

        // 拿到设备电池量
        this._getDeviceBatteryLevel();

        // 视频横竖屏监听
        Orientation.addOrientationListener(this._orientationDidChange.bind(this));
        // 监听手机back键
        if(Platform.OS === 'android'){
            this.csBackHandler = BackHandler.addEventListener('hardwareBackPress',this._backHandler.bind(this));
        }

        // 如果一开始屏幕是竖向的
        if(screen === 'vertical'){
            this._fullScreenStyles = {
                fullScreen: {},
            };
        }

        // 如果一开始屏幕是横向的
        if(screen === 'horizontal'){
            this._fullScreenStyles = {
                fullScreen: {
                    width: Math.max(win.height, win.width),
                    height: Math.min(win.height, win.width)
                }
            };
            this._onEnterFullscreen();
        }
    }
    // props改变后回调
    componentWillReceiveProps(nextProps) {
        if (this.state.paused !== nextProps.paused) {
            this.setState({
                paused: nextProps.paused
            })
        }
    }
    // render执行完后的回调
    componentDidMount() {

    }
    // 卸载组件后回调
    componentWillUnmount() {
        const { CSVideoPlayerComponentWillUnmount } = this.props;

        // 清除视频横竖屏监听
        Orientation.removeOrientationListener(this._orientationDidChange.bind(this));
        // 清除手机back键监听
        if(Platform.OS === 'android'){
            this.csBackHandler && this.csBackHandler.remove();
        }

        this.clearControlTimeout();
        this.clearLockFlowTime();
        this.setState = () => {return};
        this.BTimer && clearTimeout(this.BTimer);
        this.VTimer && clearTimeout(this.VTimer);
        this._currentPlayerTime();

        const seconds = this._currentPlayerSeconds();
        CSVideoPlayerComponentWillUnmount && CSVideoPlayerComponentWillUnmount(seconds >= 0 ? seconds : 0, this.props.video);
    }
    // 当前播放了视频秒数
    _currentPlayerSeconds(){
        const { currentTime } = this.state;
        const { timeRecordValue } = this.props;
        const newTime = accounting.formatNumber(currentTime, 0, '');
        const oldTime = accounting.formatNumber(timeRecordValue || 0, 0, '');
        const changeTime = newTime - oldTime;
        return changeTime;
    }
    // 当前播放时间 - 处理
    _currentPlayerTime(){
        if(this.props.saveInfo){
            let type = this.props.video && this.props.video.type;
            let hexId = this.props.code;
            let episode = this.props.episode;

            // 电影
            if(Number(type) === 1){
                let currentPlayerTime = this.state.currentTime;
                let duration = this.state.duration;

                if(parseInt(currentPlayerTime) !== parseInt(duration)){
                    saveCommon(hexId, currentPlayerTime);
                }
                else{
                    removeCommon(hexId);
                }
            }
            // 其他（电视剧，综艺，动漫）
            else{
                let currentPlayerTime = this.state.currentTime;
                let duration = this.state.duration;

                if(parseInt(currentPlayerTime) !== parseInt(duration)){
                    saveCommon(hexId + episode, currentPlayerTime);
                }
                else{
                    removeCommon(hexId + episode);
                }
            }
        }
    }
    // 拿到设备电池量
    _getDeviceBatteryLevel(){
        DeviceInfo.getBatteryLevel().then(batteryLevel => {
            this.batteryLevel = batteryLevel;
        });
    }
    // 横竖屏监听函数
    _orientationDidChange(orientation){
        const win = Dimensions.get('window');

        // 横屏模式
        if(orientation === 'LANDSCAPE'){
            // 底部控制栏选择
            this.setState({bottomControlSelect: true});
            // 横屏模式
            this.setState({isLandscape: true});
            // 横屏模式下的视频填满度
            this.setState({resizeMode: 'contain'});

            // 设置样式
            this._fullScreenStyles = {
                fullScreen: {
                    width: Math.max(win.height, win.width),
                    height: Math.min(win.height, win.width)
                }
            };

            // 状态栏设置
            this._statusBarStart();
            // 用于外调判断是否横屏的方法
            if ( this.props.screenDirection && typeof this.props.screenDirection === 'function' ) {
                this.props.screenDirection(true);
            }
        }
        // 竖屏模式
        else{
            // 底部控制栏还原
            this.setState({bottomControlSelect: false});
            // 竖屏模式
            this.setState({isLandscape: false});

            // 还原样式
            this._fullScreenStyles = {
                fullScreen: {},
            };

            // 状态栏还原
            this._statusBarEnd();
            // 用于外调判断是否横屏的方法
            if ( this.props.screenDirection && typeof this.props.screenDirection === 'function' ) {
                this.props.screenDirection(false);
            }
        }
    }
    // 手机监听键的函数
    _backHandler(){
        const { isLandscape, isLockScreen, isFullscreen } = this.state;
        const { screen } = this.props;

        if(isLandscape){
            if(screen === 'vertical'){
                !isLockScreen && this._onExitFullscreen();
                this.setState({isFullscreen: !isFullscreen});
                return true;
            }
            else{
                this.events.onBack();
                this.setState({isFullscreen: !isFullscreen});
                return true;
            }
        }
        else{
            this.setState({isLandscape: false});
        }

        return false;
    }
    // 手机状态栏 - 初始
    _statusBarStart(){
        StatusBar.setHidden(true,'slide');
        if(Platform.OS === 'android'){
            StatusBar.setBackgroundColor('transparent',true);
        }
        else{

        }
        StatusBar.setTranslucent(true);
    }
    // 手机状态栏 - 结束
    _statusBarEnd(){
        const { shortVideo } = this.props;

        StatusBar.setHidden(false,'slide');
        if(shortVideo){
            if(Platform.OS === 'android'){
                StatusBar.setBackgroundColor('#FFFFFF',true);
            }
            else{

            }
            StatusBar.setBarStyle('dark-content',true);
        }
        else{
            if(Platform.OS === 'android'){
                StatusBar.setBackgroundColor('#000000',true);
            }
            else{

            }
            StatusBar.setBarStyle('light-content',true);
        }
        StatusBar.setTranslucent(false);
    }
    // 视频缓冲
    _onBuffer(data = {}){
        this.props._onBuffer && typeof this.props._onBuffer === 'function' && this.props._onBuffer(...arguments);
    }
    // 视频初始加载
    _onLoadStart() {
        let state = this.state;
        state.loading = true;
        this.setState( state );

        if ( this.props.onLoadStart && typeof this.props.onLoadStart === 'function' ) {
            this.props.onLoadStart(...arguments);
        }
    }
    // 视频加载完毕
    _onLoad( data = {} ) {
        let state = this.state;
        let currentPlayerTime = this.currentPlayerTimeNumber;
        const { timeRecord, timeRecordValue } = this.props;

        state.duration = data.duration;
        state.loading = false;

        // 时间记录对应切换
        if(timeRecord && timeRecordValue !== 0){
            this.seekTo(timeRecordValue);
        }

        // 清晰度对应的切换
        if(state.isClaritySwitch){
            this.seekTo(currentPlayerTime);
            state.isClaritySwitch = !state.isClaritySwitch;
        }

        // 操作栏控制
        if ( state.showControls ) {
            this.setControlTimeout();
        }

        // 视频加载完了后回调
        if ( this.props.onLoad && typeof this.props.onLoad === 'function' ) {
            this.props.onLoad(...arguments);
        }

        this.setState( state );
    }
    // 视频播放进度
    _onProgress( data = {} ) {
        let state = this.state;

        state.currentTime = data.currentTime;
        state.playableDuration = data.playableDuration;
        state.currentLiveSeconds = this._currentPlayerSeconds() || 0;

        if (this.props.onProgress && typeof this.props.onProgress === 'function' ) {
            this.props.onProgress(...arguments);
        }

        this.setState( state );
    }
    // 视频播放结束
    _onEnd() {
        const { isLandscape } = this.state;

        // 视频播放完了需要解锁
        if(isLandscape){
            this.setState({isLockScreen: false, isLandscape: false});
        }

        // 当前播放时间 - 处理
        if(this.props.saveInfo){
            let type = this.props.video && this.props.video.type;
            let hexId = this.props.code;
            let episode = this.props.episode;

            // 电影
            if(Number(type) === 1){
                removeCommon(hexId);
            }
            // 其他（电视剧，综艺，动漫）
            else{
                removeCommon(hexId + episode);
            }
        }

        this.props.onEnd && typeof this.props.onEnd === 'function' && this.props.onEnd();
    }
    // 视频播放出错
    _onError( err ) {
        let state = this.state;
        state.error = true;
        state.loading = false;

        this.setState( state );
        this.props.onError && typeof this.props.onError === 'function' && this.props.onError(err);
    }
    // 视频总屏点击 - 执行动画
    _onScreenTouch() {
        let state = this.state;
        const time = new Date().getTime();
        const delta =  time - state.lastScreenPress;

        // 双击暂停播放
        if ( delta < 300 ) {
            state.paused = !state.paused;
            return;
        }

        this.methods.toggleControls();
        state.lastScreenPress = time;

        this.setState( state );
        // 重新获取电池电量
        this._getDeviceBatteryLevel();
    }
    // 设置控制 - 动画时间
    setControlTimeout() {
        this.player.controlTimeout = setTimeout( ()=> {
            this._hideControls();
        }, this.player.controlTimeoutDelay );
    }
    // 清除控制 - 动画时间
    clearControlTimeout() {
        this.player.controlTimeout && clearTimeout( this.player.controlTimeout );
    }
    // 重置控制 - 动画时间
    resetControlTimeout() {
        this.clearControlTimeout();
        this.setControlTimeout();
    }
    // 动画 - 隐藏
    hideControlAnimation() {
            Animated.parallel([
            Animated.timing(
                this.animations.topControl.opacity,
                { toValue: 0 }
            ),
            Animated.timing(
                this.animations.topControl.marginTop,
                { toValue: -100 }
            ),
            Animated.timing(
                this.animations.bottomControl.opacity,
                { toValue: 0 }
            ),
            Animated.timing(
                this.animations.bottomControl.marginBottom,
                { toValue: -100 }
            ),
            Animated.timing(
                this.animations.middlePlayer.opacity,
                {
                    toValue: 0,
                    delay: 0,
                    duration: 400
                }
            ),
            Animated.timing(
                this.animations.unLockScreen.left,
                { toValue: -100 }
            ),
        ]).start(() => this.setState({display: false, isBottomProgress: true}));
    }
    // 动画 - 显示
    showControlAnimation() {
        Animated.parallel([
            Animated.timing(
                this.animations.topControl.opacity,
                { toValue: 1 }
            ),
            Animated.timing(
                this.animations.topControl.marginTop,
                { toValue: 0 }
            ),
            Animated.timing(
                this.animations.bottomControl.opacity,
                { toValue: 1 }
            ),
            Animated.timing(
                this.animations.bottomControl.marginBottom,
                { toValue: 0 }
            ),
            Animated.timing(
                this.animations.middlePlayer.opacity,
                {
                    toValue: 1 ,
                    delay: 0,
                    duration: 0
                }
            ),
            Animated.timing(
                this.animations.unLockScreen.left,
                { toValue: 0 }
            ),
        ]).start(() => this.setState({display: true, isBottomProgress: false}));
    }
    // 隐藏所有控制栏
    _hideControls() {
        let state = this.state;
        state.showControls = false;
        this.hideControlAnimation();
        this.setState( state );
    }
    // 显示所有控制栏
    _showControls(){
        let state = this.state;
        state.showControls = true;
        this.showControlAnimation();
        this.setState( state );
    }
    // 视频控制栏切换 - 显示或者隐藏
    _toggleControls() {
        let state = this.state;
        state.showControls = ! state.showControls;

        if ( state.showControls ) {
            this.showControlAnimation();
            if(this.props.longShowControls && state.paused){
                this.clearControlTimeout();
            }
            else{
                this.setControlTimeout();
            }
        }
        else {
            this.hideControlAnimation();
            this.clearControlTimeout();
        }

        this.setState( state );
    }
    // 视频全屏切换
    _toggleFullscreen() {
        const { isLandscape, isFullscreen } = this.state;

        this.setState({isFullscreen: !isFullscreen});

        if (this.props.toggleResizeModeOnFullscreen) {
            this.setState({resizeMode: isFullscreen === true ? 'cover' : 'contain'});
        }

        if (isLandscape) {
            this._onExitFullscreen && typeof this._onExitFullscreen === 'function' && this._onExitFullscreen();
            this.setState({currentTime: 0});
        }
        else {
            this._onEnterFullscreen && typeof this._onEnterFullscreen === 'function' && this._onEnterFullscreen();
            this.setState({currentTime: 0});
        }
    }
    // 视频暂停也播放切换
    _togglePlayPause() {
        let state = this.state;
        // 取到当前播放时间
        let currentPlayTime = this.currentPlayerTime();

        state.paused = !state.paused;

        if (state.paused) {
            typeof this.events.onPause === 'function' && this.events.onPause(currentPlayTime);
            if(this.props.longShowControls){
                this.clearControlTimeout();
            }
        }
        else {
            typeof this.events.onPlay === 'function' && this.events.onPlay();
            if(this.props.longShowControls){
                this.setControlTimeout();
            }
        }

        this.setState( state );
    }
    // 执行退出
    _onBack() {
        const { isLandscape, isFullscreen } = this.state;
        const { screen } = this.props;

        if(screen === 'horizontal'){
            this.props.onBack && typeof this.props.onBack === 'function' && this.props.onBack();
            this._onExitFullscreen();
        }

        if(screen === 'vertical'){
            if(isLandscape){
                this._onExitFullscreen();
                this.setState({isFullscreen: !isFullscreen});
            }
            else{
                this.props.onBack && typeof this.props.onBack === 'function' && this.props.onBack();
            }
        }
    }
    // 快进 or 快退 - 手动控制滑动条
    seekTo( time = 0 ) {
        let state = this.state;
        state.currentTime = time;
        this.player.ref.seek( time );
        this.setState( state );
    }
    // 公共方法 - demo + function
    renderControl( children, callback, style = {} ) {
        return (
            <TouchableHighlight
                underlayColor="transparent"
                activeOpacity={ 0.3 }
                onPress={()=>{
                    this.resetControlTimeout();
                    callback();
                }}
                style={[styles.controls.control, style]}
            >
                { children }
            </TouchableHighlight>
        );
    }
    // 头部栏右部分
    renderHeaderRight(){
        const { isLandscape } = this.state;
        const width: number = this.batteryLevel * 20;
        const time = moment().format("A h:mm");
        const batteryLevelPercentage = accounting.toFixed(Number((this.batteryLevel * 100)),0);
        const color = batteryLevelPercentage <= 10 ? 'red' : 'white';

        if(isLandscape){
            return (
                <View style={[styles.controls.headerRightBox]}>
                    <View style={{marginRight:10}}>
                        <Text style={{fontSize:12, color:'#FFF'}}>{ time }</Text>
                    </View>
                    <View style={{marginRight:5}}>
                        <Text style={{fontSize:12, color:'#FFF'}}>{ batteryLevelPercentage }%</Text>
                    </View>
                    <View style={[styles.controls.batteryLevelBox,{marginTop:2}]}>
                        <View style={[styles.controls.batteryLevelInner,{borderColor:color}]}>
                            <View style={[styles.controls.batteryLevel,{width: width,backgroundColor:color}]}/>
                        </View>
                        <View style={[styles.controls.batterHeader,{backgroundColor:color}]}/>
                    </View>
                </View>
            );
        }

        return null;
    }
    // 头部控制栏demo
    renderTopControls() {
        const { isTopControl } = this.props;
        const style = { paddingVertical:5, justifyContent:'flex-start' };

        // 显示头部状态栏
        if(isTopControl){
            return(
                <Animated.View style={[
                    styles.controls.top,
                    {
                        opacity: this.animations.topControl.opacity,
                        marginTop: this.animations.topControl.marginTop,
                    }
                ]}>
                    <ImageBackground
                        source={ require( './img/top-vignette.png' ) }
                        style={[ styles.controls.column ]}
                        imageStyle={[ styles.controls.vignette ]}>
                        <View style={[styles.controls.topControlGroup,style]}>
                            { this.renderBack() }
                            { this.renderTitle() }
                            { this.renderHeaderRight() }
                        </View>
                    </ImageBackground>
                </Animated.View>
            );
        }

        return null;
    }
    // 头部返回栏
    renderBack() {
        const style = {height:14,marginLeft:2};
        return this.renderControl(
            <Image source={ require( './img/back.png' ) } style={ [styles.controls.back,style] } resizeMode={'contain'}/>,
            this.events.onBack,
            {paddingHorizontal:15}
        );
    }
    // 全屏模式 - demo
    renderFullscreen() {
        let source = this.state.isLandscape ? require( './img/shrink.png' ) : require( './img/expand.png' );
        return this.renderControl(
            <Image source={ source } resizeMode={'contain'} style={{height:15}}/>,
            this.methods.toggleFullscreen,
            styles.controls.fullscreen
        );
    }
    // 时间戳比值
    timeStapRatio(){
        const { currentTime, duration } = this.state;
        let ratio = 0;

        if(currentTime !== 0 && duration !== 0){
            ratio = currentTime / duration;
            if(isNaN(ratio)){
                ratio = 0;
            }
        }

        return ratio;
    }
    // 时间被手动改变
    timeSlider(value = {}){
        let win = Dimensions.get('window');
        const { duration, controlPPO } = this.state;
        let changedCurrentTime = (duration !== 0 && duration * value) || 0;
        let playerProgressOffset =(Math.max(win.width,win.height) - 40) * value;

        this.seekTo(changedCurrentTime);
        this.setState({gestureFillPlayerProgressValue: value});
        if(controlPPO){
            this.setState({playerProgressOffset});
        }
    }
    // 时间滑动条控制 - 手指释放后执行
    onSlidingComplete(){
        this.setControlTimeout();
        this.setState({paused: false, showGestureTime: false, controlPPO: false});
    }
    // 时间滑动条控制 - 手指释放前执行
    onSlidingStart(){
        this.clearControlTimeout();
        this.setState({paused: true, showGestureTime: true, controlPPO: true});
    }
    // 视频底部控制栏
    renderBottomControls() {
        const { bottomControlSelect, isLandscape } = this.state;
        const { shortVideoPlayer } = this.props;
        const currentTime = (this.currentPlayerTime() !== undefined && this.currentPlayerTime()) || '00:00:00';
        const totalTime = (this.totalPlayerTime() !== undefined && this.totalPlayerTime()) || '00:00:00';
        const source = this.state.paused ? require( './img/play.png' ) : require( './img/pause.png' );
        const clarityIndex = (isLandscape && this.props.clarityIndex) || 0;
        const clarityArr = (isLandscape && this.props.clarityArr) || [];
        const videoProfile = isLandscape && (clarityArr.length !== 0 && clarityArr[clarityIndex].videoProfile);
        const iconBottomVignette = require( './img/bottom-vignette.png' );
        const iconNextNodes = require('./img/icon_next_episode.png');
        const value = this.timeStapRatio() || 0;
        const { screen } = this.props;

        // 横屏是的底部状态栏
        if(bottomControlSelect){
            return(
                <Animated.View style={[
                    styles.controls.bottom,
                    {
                        opacity: this.animations.bottomControl.opacity,
                        marginBottom: this.animations.bottomControl.marginBottom,
                    }
                ]}>
                    <ImageBackground
                        source={iconBottomVignette}
                        style={[styles.controls.column]}
                        imageStyle={[styles.controls.vignette]}
                    >
                        <View style={[styles.seekbar.container,{height:40,marginBottom:-10}]}>
                            <Slider
                                minimumTrackTintColor={'rgb(0,117,248)'}
                                maximumTrackTintColor={'rgba(255,255,255,0.7)'}
                                thumbTintColor={'rgb(0,117,248)'}
                                thumbTouchSize={{width:40,height:40}}
                                trackStyle={{height: 2}}
                                thumbStyle={{width:16,height:16,backgroundColor:'#FFF',elevation:4}}
                                style={{height:40,width:'100%'}}
                                debugTouchArea={false}
                                value={value}
                                onValueChange={value => this.timeSlider(value)}
                                onSlidingStart={() => this.onSlidingStart()}
                                onSlidingComplete={() => this.onSlidingComplete()}
                            />
                        </View>
                        <View style={[styles.controls.landBottomBox]}>
                            <TouchableOpacity
                                activeOpacity={0.3}
                                onPress={this.landTogglePlayPause.bind(this)}
                                style={[styles.controls.landPlayerTouch]}
                            >
                                <Image source={ source } style={{height:16}} resizeMode={'contain'} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={this.quiteNextNodes.bind(this)}
                                activeOpacity={0.3}
                                style={{height:40,width:48,alignItems:'center',flexDirection:'row',paddingBottom:6}}
                            >
                                <Image source={iconNextNodes} style={{height:16,width:16}} resizeMode={'contain'} />
                            </TouchableOpacity>

                            <View style={[styles.controls.landPlayerTimeBox,{paddingBottom:6}]}>
                                <Text style={[styles.controls.timerText]}>{ currentTime }</Text>
                                <Text style={[styles.controls.timerText,{marginHorizontal:4}]}>/</Text>
                                <Text style={[styles.controls.timerText]}>{ totalTime }</Text>
                            </View>
                            <View style={[styles.controls.landBottomFullContrl,{paddingBottom:6}]}>
                                { screen === 'vertical' ? this.renderFullscreen() : null }
                            </View>
                            {
                                videoProfile ?
                                <TouchableOpacity
                                    onPress={this.openSwitchClarityPanel.bind(this)}
                                    activeOpacity={0.30}
                                    style={[styles.controls.landBottomQxdContrl,{paddingBottom:6}]}
                                >
                                    <Text style={[styles.controls.timerText,{fontSize:12}]}>{ videoProfile }</Text>
                                </TouchableOpacity> : null
                            }
                        </View>
                    </ImageBackground>
                </Animated.View>
            );
        }
        // 竖屏是的底部状态栏
        else{
            return(
                <Animated.View style={[
                    styles.controls.bottom,
                    {
                        opacity: this.animations.bottomControl.opacity,
                        marginBottom: this.animations.bottomControl.marginBottom,
                    }
                ]}>
                    <ImageBackground
                        source={ require( './img/bottom-vignette.png' ) }
                        style={[styles.controls.column,{height:40,flexDirection:'row',position:'relative'}]}
                        imageStyle={[styles.controls.vignette]}
                    >
                        <View style={[styles.controls.timerBox,{paddingLeft:10}]}>
                            <Text style={[styles.controls.timerText,{textAlign:'left'}]}>{ currentTime }</Text>
                        </View>
                        <View style={[styles.controls.verProccess,shortVideoPlayer && {right:40,left:40}]}>
                            <Slider
                                minimumTrackTintColor={'rgb(0,117,248)'}
                                maximumTrackTintColor={'rgba(255,255,255,0.7)'}
                                thumbTintColor={'rgb(0,117,248)'}
                                thumbTouchSize={{width:40,height:40}}
                                trackStyle={{height: 2}}
                                thumbStyle={{width:16,height:16,backgroundColor:'#FFF',elevation:4}}
                                style={{height:40,width:'100%'}}
                                debugTouchArea={false}
                                value={value}
                                onValueChange={value => this.timeSlider(value)}
                                onSlidingStart={() => this.onSlidingStart()}
                                onSlidingComplete={() => this.onSlidingComplete()}
                            />
                        </View>
                        <View style={{flexDirection:'row'}}>
                            <View style={[styles.controls.timerBox,shortVideoPlayer && {paddingRight:10}]}>
                                <Text style={[styles.controls.timerText,{textAlign:'right'}]}>{ totalTime }</Text>
                            </View>
                            {
                                !shortVideoPlayer &&
                                <View style={[{height:40,justifyContent:'center',alignItems:'center'}]}>
                                    { this.renderFullscreen() }
                                </View>
                            }
                        </View>
                    </ImageBackground>
                </Animated.View>
            );
        }
    }
    // 快捷键 - 下一集
    quiteNextNodes(){

    }
    // 打开切换清晰度面板
    openSwitchClarityPanel(){
        const { isLandscape, paused, currentTime } = this.state;

        // this.setState({paused: !paused, isClaritySwitch: true});
        this.setState({isClaritySwitch: true});
        this.resetControlTimeout();

        // 如果是横屏模式
        if(isLandscape){
            this.currentPlayerTimeNumber = currentTime;
            this.props.openClarityPanel && typeof this.props.openClarityPanel === 'function' && this.props.openClarityPanel();
        }
    }
    // 横屏下的播放按钮方法控制
    landTogglePlayPause(){
        this.methods.togglePlayPause();
        this.resetControlTimeout();
    }
    // 获得总播放时间
    totalPlayerTime(){
        const { duration } = this.state;
        const { shortVideoPlayer } = this.props;

        if(shortVideoPlayer){
            return this.formatTime(duration);
        }

        return toHHMMSS(duration);
    }
    // 获得播放当前时间
    currentPlayerTime(){
        const { currentTime } = this.state;
        const { shortVideoPlayer } = this.props;

        if(shortVideoPlayer){
            return this.formatTime(currentTime);
        }

        return toHHMMSS(currentTime);
    }
    // 视频播放时间的另一种形式
    formatTime( time = 0 ) {
        time = Math.min(
            Math.max( time, 0 ),
            this.state.duration
        );

        const formattedMinutes = _.padStart( Math.floor( time / 60 ).toFixed( 0 ), 2, 0 );
        const formattedSeconds = _.padStart( Math.floor( time % 60 ).toFixed( 0 ), 2 , 0 );

        return `${ formattedMinutes }:${ formattedSeconds }`;
    }
    // 头部文字内容
    renderTitle() {
        const { topTitleNumberOfLines } = this.props;
        if ( this.opts.title ) {
            return (
                <View style={[styles.controls.control, styles.controls.title,{alignItems:'flex-start'}]}>
                    <Text style={[styles.controls.text, styles.controls.titleText]} numberOfLines={ topTitleNumberOfLines }>
                        { this.opts.title || '' }
                    </Text>
                </View>
            );
        }
        return null;
    }
    // 视频加载动画
    renderLoader() {
        const { activityIndicatorSize, activityIndicatorColor } = this.props;

        if(this.props.clarityStatus){
            return (
                <View style={[styles.loader.container,{zIndex: 9999}]}>
                    <Text style={{fontSize:15, color:'#fff'}}><Text style={{color:'rgb(0,117,248)'}}>清晰度</Text>切换中，请稍等...</Text>
                </View>
            );
        }

        if (this.state.loading) {
            return (
                <View style={[styles.loader.container,{zIndex: 9999,backgroundColor:'#000000'}]}>
                    <ActivityIndicator size={activityIndicatorSize} color={activityIndicatorColor}/>
                </View>
            );
        }

        return null;
    }
    // 视频播放出错
    renderError() {
        if ( this.state.error ) {
            return (
                <View style={[styles.error.container]}>
                    <Image source={ require( './img/error-icon.png' ) } resizeMode={'contain'} style={ styles.error.icon } tintColor={'rgb(0,117,248)'} />
                    <Text style={[styles.error.text,{color:'rgb(0,117,248)'}]}>
                        视频播放出错啦，请换一个播放吧！
                    </Text>
                </View>
            );
        }
        return null;
    }
    // 中间的播放控制按钮
    renderPlayer(){
        const { bottomControlSelect, paused, display } = this.state;
        let source = paused ? require('./img/icon_play_circle.png') : require('./img/icon_pause_circle.png');

        // 如果底部状态栏是之前默认的
        if(!bottomControlSelect){
            if(display){
                return (
                    <Animated.View style={[styles.middlePlayer.box,styles.middlePlayer.view,{opacity: this.animations.middlePlayer.opacity}]}>
                        <TouchableOpacity activeOpacity={0.3} style={styles.middlePlayer.box} onPress={this.middlePlayer.bind(this)}>
                            <Image source={source} resizeMode={'contain'} style={styles.middlePlayer.image}/>
                        </TouchableOpacity>
                    </Animated.View>
                );
            }
            return null;
        }
        return null;
    }
    // 中间的播放控制按钮对应的方法
    middlePlayer(){
        if(this.props.longShowControls){
            this.methods.togglePlayPause();
        }
        else{
            this.resetControlTimeout();
            this.methods.togglePlayPause();
        }
    }
    // 进入全屏
    _onEnterFullscreen(){
        Orientation.lockToLandscape();
        let animatedWidth = this.animations.fullScreen.width, animatedHeight = this.animations.fullScreen.height;
        let win = Dimensions.get('window');

        Animated.parallel([
            Animated.timing(animatedWidth, {
                toValue: win.height,
                delay: 0,
                duration: 0
            }),
            Animated.timing(animatedHeight, {
                toValue: win.width,
                delay: 0,
                duration: 0
            })
        ]).start();
    }
    // 退出全屏
    _onExitFullscreen(){
        Orientation.lockToPortrait();
        let animatedWidth = this.animations.fullScreen.width, animatedHeight = this.animations.fullScreen.height;

        Animated.parallel([
            Animated.timing(animatedWidth, {
                toValue: util.SCREEN_WIDTH,
                delay: 0,
                duration: 0
            }),
            Animated.timing(animatedHeight, {
                toValue: 200,
                delay: 0,
                duration: 0
            })
        ]).start();
    }
    // 头部文字标题
    renderTopTitle(){
        const { topTitle } = this.props;
        let source = require('../pages/imgs/screen_gradient_top.png');
        let animated = {
            opacity: this.animations.topControl.opacity,
            marginTop: this.animations.topControl.marginTop,
        };

        if(topTitle){
            return (
                <Animated.View style={[styles.controls.topTitle,animated]}>
                    <ImageBackground source={source} imageStyle={{resizeMode:'stretch'}} style={[styles.controls.topTitleImageBack]}>
                        { this.renderTitle() }
                    </ImageBackground>
                </Animated.View>
            );
        }
        return null;
    }
    // 底部时间进度条
    renderBottomProgress(){
        const { showBottomProgress } = this.props;
        const { isBottomProgress, currentTime, duration, playableDuration, isLandscape } = this.state;
        let win = Dimensions.get('window');
        // 获得当前视频播放时间戳
        let currentTimeStamp = (currentTime && Number(currentTime)) || 0;
        // 获得当前视频播放缓冲时间戳
        let currentBufferTimeStamp = (playableDuration && Number(playableDuration)) || 0;
        // 获得当前视频播放总时间戳
        let durationTimeStamp = (duration && Number(duration)) || 0;
        // 当前时间与总时间的比值
        let timeRatio = currentTimeStamp / durationTimeStamp;
        // 当前缓冲时间与总时间的比值
        let bufferTimeRatio = currentBufferTimeStamp / durationTimeStamp;
        // 当前播放的进度条的距离
        let currentPlayerDistance = (timeRatio * win.width) || 0;
        // 当前缓冲条距离
        let currentBufferDistance = (bufferTimeRatio * win.width) || 0;

        // 显示
        if(showBottomProgress === 'show'){
            if(isBottomProgress && !isLandscape){
                return (
                    <View style={[styles.controls.bottomProgress]}>
                        <View style={[styles.seekbar.fill, {width: currentPlayerDistance, height:2.5, borderRadius: 0, backgroundColor: this.props.seekColor || 'rgb(0,117,248)'}]}/>
                        <View style={[styles.seekbar.buffer,{width: currentBufferDistance,backgroundColor:'#cccccc',}]} />
                    </View>
                );
            }
            return null;
        }

        // 隐藏
        if(showBottomProgress === 'hide'){
            return null;
        }
    }
    // 锁屏
    renderLockScreen(){
        const { isLandscape, isLockScreen, showVideoLockFLow } = this.state;
        let sourceUnlock = require('./img/icon_unlock.png');
        let sourceLock = require('./img/icon_lock.png');
        let animatedOpacity = this.animations.videoLockFLow.opacity;
        let animateLeft = this.animations.unLockScreen.left;

        if(isLandscape){
            return (
                isLockScreen ?
                <TouchableOpacity onPress={this.clickOtherArea.bind(this)} activeOpacity={1} style={[styles.lock.containerCS]}>
                    {
                        showVideoLockFLow ?
                        <AnimatedTouchableOpacity onPress={this.lockSwitch.bind(this)} activeOpacity={1} style={[styles.lock.box,styles.lock.boxCS,{opacity:animatedOpacity}]}>
                            <Image source={sourceLock} resizeMode={'contain'} style={{height:18}}/>
                        </AnimatedTouchableOpacity> : <View/>
                    }
                </TouchableOpacity> :
                <AnimatedTouchableOpacity onPress={this.lockSwitch.bind(this)} activeOpacity={0.75} style={[styles.lock.container,{left: animateLeft}]}>
                    <View style={[styles.lock.box]}>
                        <Image source={sourceUnlock} resizeMode={'contain'} style={{height:18}}/>
                    </View>
                </AnimatedTouchableOpacity>
            );
        }

        return null;
    }
    // 点击锁屏后的 - 其他区间
    clickOtherArea(){
        let state = this.state;

        if(state.showVideoLockFLow){
            this.hideLockFlow();
            this._hideControls();
            this.clearControlTimeout();
        }
        else{
            this.showLockFlow();
        }

        this.reSetLockFlowTime();
    }
    // 锁屏和视频流 - 隐藏
    setLockFlowTime(){
        this.player.lockFlowControlTimout = setTimeout( ()=> {
                this.hideLockFlow();
        }, this.player.controlTimeoutDelay);
    }
    // 锁屏和视频流 - 清除
    clearLockFlowTime(){
        this.player.lockFlowControlTimout && clearTimeout( this.player.lockFlowControlTimout );
    }
    // 锁屏和视频流 - 重置
    reSetLockFlowTime(){
        this.clearLockFlowTime();
        this.setLockFlowTime();
    }
    // 显示锁屏和视频流宽度调节的元素
    showLockFlow(){
        let opacity = this.animations.videoLockFLow.opacity;
        this.setState({ showVideoLockFLow: true });
        Animated.timing(opacity,{
            toValue: 1,
            delay: 0,
            duration: 600
        }).start(() => {});
    }
    // 隐藏锁屏和视频流宽度调节的元素
    hideLockFlow(){
        let opacity = this.animations.videoLockFLow.opacity;
        Animated.timing(opacity,{
            toValue: 0,
            delay: 0,
            duration: 600
        }).start(() => this.setState({ showVideoLockFLow: false }));
    }
    // 锁屏切换
    lockSwitch(){
        let state = this.state;
        state.isLockScreen = !state.isLockScreen;

        if(state.isLockScreen){
            this._hideControls();
            this.resetControlTimeout();
            this.setLockFlowTime();
        }
        else{
            this._showControls();
            this.resetControlTimeout();
            this.clearLockFlowTime();
        }

        this.setState( state );
    }
    // 空方法
    empty(){
        return null;
    }
    // 切换视频流的样式宽度 - demo
    renderSwitchVideoFlow(){
        const { isLandscape, isLockScreen, resizeMode, showVideoLockFLow } = this.state;
        let backgroundColorA = resizeMode === 'contain' ? 'rgba(0,117,248,1)' : 'rgba(0,0,0,0.35)';
        let backgroundColorB = resizeMode === 'contain' ? 'rgba(0,0,0,0.35)' : 'rgba(0,117,248,1)';
        let colorA = resizeMode === 'contain' ? '#ffffff' : 'rgba(0,117,248,1)';
        let colorB = resizeMode === 'contain' ? 'rgba(0,117,248,1)' : '#ffffff';
        let animatedOpacity = this.animations.videoLockFLow.opacity;

        if(isLandscape){
            return (
                isLockScreen ?
                (   showVideoLockFLow ?
                    <Animated.View style={[styles.switchVideoFlow.container,{opacity:animatedOpacity}]}>
                        <TouchableOpacity
                            activeOpacity={1}
                            style={[styles.switchVideoFlow.box,{backgroundColor:backgroundColorB,borderTopLeftRadius:25,borderBottomLeftRadius:25}]}
                            onPress={this.svfFull.bind(this)}
                        >
                            <Text style={[{color:colorB},styles.switchVideoFlow.font]}>100%</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={1}
                            style={[styles.switchVideoFlow.box,{backgroundColor:backgroundColorA,borderTopRightRadius:25,borderBottomRightRadius:25}]}
                            onPress={this.svfContain.bind(this)}
                        >
                            <Text style={[{color:colorA},styles.switchVideoFlow.font]}>全屏</Text>
                        </TouchableOpacity>
                    </Animated.View> : null
                ) : null
            );
        }

        return null;
    }
    // 视频流 - cover
    svfFull(){
        let state = this.state;

        state.resizeMode = 'cover';
        this.setState( state );
    }
    // 视频流 - contain
    svfContain(){
        let state = this.state;

        state.resizeMode = 'contain';
        this.setState( state );
    }
    // 公共方法 - 音量 + 亮度 + 快进/快退
    publicLayer(
        logoDemo : any = null,
        value : number = 0,
        onValueChange: Function,
        onSlidingStart: Function,
        onSlidingComplete: Function
    ){
        return (
            <View style={[styles.gestures.csLayer]}>
                { logoDemo }
                <Slider
                    minimumTrackTintColor={'rgb(0,117,248)'}
                    maximumTrackTintColor={'rgba(255,255,255,0.7)'}
                    thumbTintColor={'rgb(0,117,248)'}
                    thumbTouchSize={{width:0,height:0}}
                    trackStyle={{height: 2}}
                    thumbStyle={{width:0,height:0}}
                    style={{height:3,width:'100%',marginTop:5}}
                    debugTouchArea={false}
                    value={value}
                    onValueChange={e => onValueChange ? onValueChange(e) : {}}
                    onSlidingStart={_ => onSlidingStart ? onSlidingStart() : {}}
                    onSlidingComplete={_ => onSlidingComplete ? onSlidingComplete() : {}}
                />
            </View>
        );
    }
    // 音量 - demo
    renderVolumeLayer(){
        let state = this.state;
        let iconVolume = (<Image source={require('./img/icon_speaker.png')} style={styles.gestures.csLayerImg} resizeMode={'contain'}/>);

        if(state.isLandscape){
            return (
                state.showVolume ? this.publicLayer
                (
                    iconVolume,
                    state.changeVolumeRatio,
                    (changeValue) => {},
                    () => {},
                    () => {},
                ) : null
            );
        }

        return null;
    }
    // 亮度 - demo
    renderBrightnessLayer(){
        let state = this.state;
        let brightness = (<Image source={require('./img/icon_sun.png')} style={styles.gestures.csLayerImg} resizeMode={'contain'}/>);

        if(state.isLandscape){
            return (
                state.showBrightness ? this.publicLayer
                (
                    brightness,
                    state.changeBrightnessRatio,
                    (changeValue) => {},
                    () => {},
                    () => {},
                ) : null
            );
        }

        return null;
    }
    // 音量滑动 - 方法
    onSwipeVolume(gestureName, gestureState) {
        const {SWIPE_UP, SWIPE_DOWN, SWIPE_LEFT, SWIPE_RIGHT} = swipeDirections;
        switch (gestureName) {
            case SWIPE_UP: this.onSwipeVolumeUp(gestureState);
                break;
            case SWIPE_DOWN: this.onSwipeVolumeDown(gestureState);
                break;
            case SWIPE_LEFT: this.onSwipeVolumeLeft(gestureState);
                break;
            case SWIPE_RIGHT: this.onSwipeVolumeRight(gestureState);
                break;
        }
    }
    // 亮度滑动 - 方法
    onSwipeBrightness(gestureName, gestureState){
        const { SWIPE_UP, SWIPE_DOWN, SWIPE_LEFT, SWIPE_RIGHT } = swipeDirections;
        switch (gestureName) {
            case SWIPE_UP: this.onSwipeBrightnessUp(gestureState);
                break;
            case SWIPE_DOWN: this.onSwipeBrightnessDown(gestureState);
                break;
            case SWIPE_LEFT: this.onSwipeBrightnessLeft(gestureState);
                break;
            case SWIPE_RIGHT: this.onSwipeBrightnessRight(gestureState);
                break;
        }
    }
    // 亮度调节向上滑
    onSwipeBrightnessUp(gestureState){
        this.rollbackBrightnessControl(gestureState);
    }
    // 亮度调节向下滑
    onSwipeBrightnessDown(gestureState){
        this.rollbackBrightnessControl(gestureState);
    }
    // 亮度调节控制公共方法
    brightnessProgressControl(direction: string) {
        const { currentBrightnessRatio } = this.state;
        let win = Dimensions.get('window');
        let position: number = 0;

        // 向下
        if(direction === 'down'){
            if(this.state.brightnessOffset === 0){
                position = win.height * currentBrightnessRatio - 10;
            }
            else{
                position = this.state.brightnessOffset - 10; // this.state.brightnessOffset - Math.abs(gestureState.dy);
            }
        }

        // 向上
        if(direction === 'up'){
            if(this.state.brightnessOffset === 0){
                position = win.height * currentBrightnessRatio + 10;
            }
            else{
                position = this.state.brightnessOffset + 10; // this.state.brightnessOffset + Math.abs(gestureState.dy);
            }
        }

        this.setBrightnessPosition( position );
        this.setState({showBrightness: true});
        this.BTimer && clearTimeout(this.BTimer);
        // 设置亮度
        this.state.showBrightness && SystemSetting.setAppBrightness(this.state.changeBrightnessRatio);
    }
    // 亮度调节向左滑
    onSwipeBrightnessLeft(gestureState){
        this.rollbackGestureControl(gestureState);
    }
    // 亮度调节向右滑
    onSwipeBrightnessRight(gestureState){
        this.rollbackGestureControl(gestureState);
    }
    // 亮度调节来回拖动控制
    rollbackBrightnessControl(gestureState){
        if(this.gestureBrightnessStateY > gestureState.moveY){
            this.brightnessProgressControl('up');
            this.gestureBrightnessStateY = gestureState.moveY;
        }
        else{
            this.brightnessProgressControl('down');
            this.gestureBrightnessStateY = gestureState.moveY;
        }
    }
    // 音量调节来回拖动控制
    rollbackVolumeControl(gestureState){
        if(this.gestureVolumeStateY > gestureState.moveY){
            this.volumeProgressControl('up');
            this.gestureVolumeStateY = gestureState.moveY;
        }
        else{
            this.volumeProgressControl('down');
            this.gestureVolumeStateY = gestureState.moveY;
        }
    }
    // 播放调节来回拖动控制
    rollbackGestureControl(gestureState){
        if(this.gestureStateX > gestureState.moveX){
            this.playerProgressControl('left');
            this.gestureStateX = gestureState.moveX;
        }
        else{
            this.playerProgressControl('right');
            this.gestureStateX = gestureState.moveX;
        }
    }
    // 视频播放进度公共方法
    playerProgressControl(direction: string) {
        const { playerProgressOffset, playerProgressRatio, showVolume, showBrightness } = this.state;
        let win = Dimensions.get('window');
        let position: number = 0;

        if(showVolume || showBrightness){
            return null;
        }

        // 向左
        if (direction === 'left') {
            if(playerProgressOffset === 0){
                position = (win.width - 40) * playerProgressRatio - 1;
            }
            else{
                position = playerProgressOffset - 1;
            }
        }

        // 向右
        if(direction === 'right'){
            if(playerProgressOffset === 0){
                position = (win.width - 40) * playerProgressRatio + 1;
            }
            else{
                position = playerProgressOffset + 1;
            }
        }

        this.setPlayerProgressPosition(position);

        let value = playerProgressOffset / (win.width - 40);
        this.timeSlider(value);
        this.setState({showBrightness: false, showVolume: false, showGestureTime: true, paused: true});
    }
    // 音量调节向上滑
    onSwipeVolumeUp(gestureState){
        this.rollbackVolumeControl(gestureState);
    }
    // 音量调节向下滑
    onSwipeVolumeDown(gestureState){
        this.rollbackVolumeControl(gestureState);
    }
    // 音量调节控制公共方法
    volumeProgressControl(direction: string){
        const { currentVolumeRatio } = this.state;
        let win = Dimensions.get('window');
        let position: number = 0;

        // 向下
        if(direction === 'down'){
            if(this.state.volumeOffset === 0){
                position = win.height * currentVolumeRatio - 10;
            }
            else{
                position = this.state.volumeOffset - 10;
            }
        }

        // 向上
        if(direction === 'up'){
            if(this.state.volumeOffset === 0){
                position = win.height * currentVolumeRatio + 10;
            }
            else{
                position = this.state.volumeOffset + 10;
            }
        }

        this.setvolumePosition( position );
        this.setState({showVolume: true});
        this.VTimer && clearTimeout(this.VTimer);
        // 设置音量
        this.state.showVolume && SystemSetting.setVolume(this.state.changeVolumeRatio,{type: 'music', playSound: true, showUI: false});
    }
    // 音量调节向左滑
    onSwipeVolumeLeft(gestureState){
        this.rollbackGestureControl(gestureState);
    }
    // 音量调节向右滑
    onSwipeVolumeRight(gestureState){
        this.rollbackGestureControl(gestureState);
    }
    // 设置音量路径值
    setvolumePosition(position: number = 0){
        let win = Dimensions.get('window');
        let state = this.state;

        position = this.constrainToMinMax(position);
        state.changeVolumeRatio = (position / win.height);
        state.volumeOffset = position;

        this.setState( state );
    }
    // 设置播放进度路径值
    setPlayerProgressPosition(position: number = 0){
        let win = Dimensions.get('window');
        let state = this.state;

        position = this.constrainToMinMax(position,'leftOrRight');
        state.playerProgressRatio = position / (win.width - 40);
        state.playerProgressOffset = position;

        this.setState(state);
    }
    // 设置亮度路径值
    setBrightnessPosition(position = 0){
        let win = Dimensions.get('window');
        let state = this.state;

        position = this.constrainToMinMax(position);
        state.changeBrightnessRatio = (position / win.height); // + state.currentBrightnessRatio;
        state.brightnessOffset = position;

        this.setState( state );
    }
    // 公共方法 - 处理手势上下滑动距离
    constrainToMinMax(val = 0, direction: string = 'upOrDown' ) {
        let win = Dimensions.get('window');

        if (val <= 0) {
            return 0;
        }
        else if (val >= (direction === 'upOrDown' ? win.height : (win.width - 40))) {
            return (direction === 'upOrDown' ? win.height : (win.width - 40));
        }
        return val;
    }
    // 点击 - 音量调节和亮度调节区域
    gestureRecognizerClick(gestureState){
        this.events.onScreenTouch();
        this.BTimer && clearTimeout(this.BTimer);
        this.VTimer && clearTimeout(this.VTimer);
    }
    // 手指刚按下 - 音量
    async responderGrantVolume(evt, gestureState){
        // 当前音量比率值
        let currentVolumeRatio = await SystemSetting.getVolume('music');
        this.setState({currentVolumeRatio: currentVolumeRatio, showBrightness: false});
        this.BTimer && clearTimeout(this.BTimer);
        this.gestureStateX = gestureState.x0;
        this.gestureVolumeStateY = gestureState.y0;
    }
    // 手指离开的一些处理 - 音量
    responderReleaseVolume(evt, gestureState){
        this.VTimer = setTimeout(() => {
            this.setState({showVolume: false});
        },2000);
        this.setState({showGestureTime: false, paused: false});
    }
    // 手指刚按下 - 亮度
    async responderGrantBrightness(evt, gestureState){
        // 当前亮度比率值
        let currentBrightnessRatio = await SystemSetting.getBrightness();
        // 获取当前视频播放的进度的比率
        let playerProgressRatio = this.timeStapRatio();

        this.setState({
            currentBrightnessRatio: currentBrightnessRatio,
            showVolume: false,
            playerProgressRatio: playerProgressRatio
        });
        this.VTimer && clearTimeout(this.VTimer);
        this.gestureStateX = gestureState.x0;
        this.gestureBrightnessStateY = gestureState.y0;
    }
    // 手指离开的一些处理 - 亮度
    responderReleaseBrightness(evt, gestureState){
        this.BTimer = setTimeout(() => {
            this.setState({showBrightness: false});
        },2000);
        this.setState({showGestureTime: false, paused: false});
    }
    // 音量 - 亮度 - 快进/快退 - 调节
    renderAdjustControl(){
        let state = this.state;
        let config = this.gestureConfig;

        //暂时处理横屏模式下的
        if(state.isLandscape){
            return (
                <View style={[styles.gestures.adjustControlContent]}>
                    <GestureRecognizer
                        config={config}
                        onSwipe={(direction, state) => this.onSwipeBrightness(direction, state)}
                        onPress={(gestureState) => this.gestureRecognizerClick(gestureState)}
                        responderGrant={(evt, gestureState) => this.responderGrantBrightness(evt, gestureState)}
                        responderRelease={(evt, gestureState) => this.responderReleaseBrightness(evt, gestureState)}
                        style={[styles.gestures.adjustBox,{backgroundColor:'transparent'}]}
                    />
                    <GestureRecognizer
                        config={config}
                        onSwipe={(direction, state) => this.onSwipeVolume(direction, state)}
                        onPress={(gestureState) => this.gestureRecognizerClick(gestureState)}
                        responderGrant={(evt, gestureState) => this.responderGrantVolume(evt, gestureState)}
                        responderRelease={(evt, gestureState) => this.responderReleaseVolume(evt, gestureState)}
                        style={[styles.gestures.adjustBox,{backgroundColor:'transparent'}]}
                    />
                </View>
            );
        }

        // 竖屏模式下的暂时不做处理
        return null;
    }
    // 缓存加载 - demo
    renderBuffer(){
        const { currentTime, playableDuration, showGestureTime, paused } = this.state;

        if(currentTime !== 0 && playableDuration !== 0 && currentTime >= playableDuration && !showGestureTime){
            return (
                <View style={styles.buffer.box}>
                    <Text style={styles.buffer.text}>努力加载中，请稍等...</Text>
                    {/*<ActivityIndicator size={'small'} color={'rgb(0,117,248)'}/>*/}
                </View>
            );
        }
        return null;
    }
    // 时间手动滑动 - demo
    renderGestureTime(){
        const {
            showGestureTime,
            showVolume,
            showBrightness,
            currentTime,
            duration,
            isLandscape,
            gestureFillPlayerProgressValue
        } = this.state;
        const CTime = (this.currentPlayerTime() !== undefined && this.currentPlayerTime()) || '00:00:00';
        const DTime = (this.totalPlayerTime() !== undefined && this.totalPlayerTime()) || '00:00:00';
        const CTimeShort = this.formatTime(currentTime) || '00:00';
        const DTimeShort = this.formatTime(duration) || '00:00';
        const width = 240 * gestureFillPlayerProgressValue;

        if(showGestureTime && !showVolume && !showBrightness){
            if(isLandscape){
                return (
                    <View style={styles.gestureTime.timeContent}>
                        <View style={styles.gestureTime.timeInner}>
                            <Text style={[styles.gestureTime.text,{fontSize:20}]}>
                                <Text style={{color:'rgb(0,117,248)'}}>{ CTimeShort }</Text> / { DTime }
                            </Text>
                            <View style={styles.gestureTime.timeProgress}>
                                <View style={[styles.gestureTime.timeInnerProgress,{width:width}]}/>
                            </View>
                        </View>
                    </View>
                );
            }

            return (
                <View style={styles.gestureTime.content}>
                    <Text style={styles.gestureTime.text}>
                        <Text style={{color:'rgb(0,117,248)'}}>{ CTimeShort }</Text> / { DTime }
                    </Text>
                </View>
            );
        }

        return null;
    }
    // 观看提示
    renderViewPrompt(){
        const { currentLiveSeconds } = this.state;
        const iconBottomVignette = require('./img/bottom-vignette.png');
        const { taskData } = this.props;
        const data = taskData && taskData.taskCenterInfo && taskData.taskCenterInfo.data;
        const status = this.isLogout() ? false : (data ? data.task[3].status : false);
        const seconds = data ? Number(data.task[3].seconds) : 0;

        if((currentLiveSeconds + seconds) >= 300 && (currentLiveSeconds + seconds) <= 305 && !status){
            return (
                <ImageBackground
                    source={iconBottomVignette}
                    imageStyle={[styles.controls.vignette]}
                    style={styles.prompt.box}
                >
                    <Text style={styles.prompt.boxText}>今日你已成功观看5分钟，已获得金币和经验值</Text>
                </ImageBackground>
            );
        }

        return null;
    }
    // 检测用户是否退出
    isLogout(){
        const { userData } = this.props;

        if(userData && !userData.login || !userData){
            return true;
        }

        return false;
    }
    // 保持长亮 - demo
    renderKeepAwake(){
        return (<KeepAwake/>);
    }
    render() {
        return (
            <AnimatedTouchableOpacity
                activeOpacity={1}
                onPress={!this.state.isLockScreen ? this.events.onScreenTouch : this.empty.bind(this)}
                style={[ styles.player.container,this.animations.fullScreen,this.styles.containerStyle]}
            >
                <Video
                    { ...this.props } // 视频相关的其他属性
                    repeat={this.props.repeat}   // 是否重复播放
                    ref={ videoPlayer => this.player.ref = videoPlayer }
                    resizeMode={ this.state.resizeMode }  // 视频的自适应伸缩铺放行为
                    volume={ this.state.volume } // 声音的放大倍数，0 代表没有声音，就是静音muted, 1 代表正常音量 normal，更大的数字表示放大的倍数
                    paused={ this.state.paused } // true代表暂停，默认为false
                    muted={ this.state.muted }   // true代表静音，默认为false.
                    rate={ this.state.rate }     // 控制暂停/播放，0 代表暂停paused, 1代表播放normal.
                    onLoadStart={ this.events.onLoadStart } // 视频初始加载
                    onProgress={ this.events.onProgress } // 视频播放的进度控制
                    onError={ this.events.onError } // 视频播放出错
                    onLoad={ this.events.onLoad } // 视频加载完成
                    onEnd={ this.events.onEnd } // 视频播放结束
                    onBuffer={ this.events.onBuffer } // 视频缓冲
                    style={[ styles.player.video,this._fullScreenStyles.fullScreen || {},this.styles.videoStyle]} // 视频的样式控制
                    source={ this.props.source } // 播放的资源
                    playInBackground={this.props.playInBackground} // 背面播放控制
                    rotation={0}  // 视频旋转控制 - 0
                />
                { this.renderError() }
                { this.renderLoader() }
                { this.renderTopControls() }
                { this.renderBottomControls() }
                { this.renderPlayer() }
                { this.renderTopTitle() }
                { this.renderBottomProgress() }
                { this.renderLockScreen() }
                { this.renderSwitchVideoFlow() }
                { this.renderVolumeLayer() }
                { this.renderBrightnessLayer() }
                { this.renderAdjustControl() }
                { this.renderGestureTime() }
                { this.renderKeepAwake() }
            </AnimatedTouchableOpacity>
        );
    }
}

export default CSVideoPlayer;

const styles = {
    prompt: StyleSheet.create({
        box:{
            position:'absolute',
            left:0,
            bottom:0,
            width:'100%',
            zIndex:999,
            padding: 15,
            flexDirection:'row',
            justifyContent:'center'
        },
        boxText:{
            fontSize:14,
            color:'rgb(0,117,248)'
        }
    }),
    gestureTime: StyleSheet.create({
        timeContent:{
            position:'absolute',
            left:0,
            top:0,
            bottom:0,
            right:0,
            backgroundColor:'rgba(0,0,0,0.35)',
            zIndex:10
        },
        timeInnerProgress:{
            height: 3,
            backgroundColor:'rgb(0,117,248)',
            position:'absolute',
            top:0,
            left:0,
            borderRadius: 10,
            overflow:'hidden'
        },
        timeInner:{
            position:'absolute',
            top:0,
            width:240,
            left:'50%',
            marginLeft:-120,
            alignItems:'center',
            paddingTop:40,
            overflow:'hidden'
        },
        timeProgress:{
            height:3,
            width:240,
            backgroundColor:'rgba(255,255,255,0.75)',
            borderRadius:10,
            overflow:'hidden',
            marginTop:20,
            position:'relative'
        },
        content: {
            position:'absolute',
            left:"50%",
            top:'50%',
            marginLeft:-73,
            marginTop:-40,
            width:146,
            height:80,
            backgroundColor:'rgba(0,0,0,0.75)',
            borderRadius:6,
            overflow:'hidden',
            justifyContent:'center',
            alignItems:'center',
            zIndex: 800,
            flexDirection: 'row'
        },
        text: {
            fontSize: 15,
            color: '#FFFFFF'
        },
    }),
    buffer: StyleSheet.create({
        box: {
            position:'absolute',
            left:0,
            top:0,
            right:0,
            bottom:0,
            zIndex:500,
            backgroundColor:'rgba(0,0,0,0.4)',
            justifyContent:'center',
            alignItems:'center'
        },
        text:{
            color:'#fff',
            fontSize:15
        },
    }),
    gestures: StyleSheet.create({
        adjustControlContent: {
            position:'absolute',
            left:0,
            top:0,
            right:0,
            bottom:0,
            zIndex:600,
            flexDirection:'row',
        },
        adjustBox:{
            flex: 1
        },
        common: {
            position:'absolute',
            top:0,
            bottom:0,
            zIndex:600
        },
        csLayerImg: {
            marginTop:20,
            marginBottom: 15,
        },
        csLayer: {
            position:'absolute',
            zIndex:9999,
            backgroundColor:'rgba(0,0,0,0.5)',
            width:120,
            height:80,
            left:'50%',
            top:'50%',
            marginTop:-40,
            marginLeft:-60,
            borderRadius:6,
            overflow:'hidden',
            alignItems: 'center',
            paddingHorizontal: 15
        },
    }),
    switchVideoFlow: StyleSheet.create({
        font: {
            fontSize: 14
        },
        container: {
            position:'absolute',
            left:"50%",
            top:10,
            height:35,
            zIndex:99999,
            borderRadius:25,
            width:120,
            marginLeft:-60,
            flexDirection:'row',
            overflow:'hidden'
        },
        box:{
            flex:1,
            justifyContent:'center',
            alignItems:'center',
        },
    }),
    lock: StyleSheet.create({
        container: {
            position:'absolute',
            left:0,
            justifyContent:'center',
            alignItems:'center',
            top:'50%',
            marginTop:-50,
            width:100,
            height:100,
            zIndex:9999,
            borderRadius:60
        },
        boxCS: {
            position: 'absolute',
            top: '50%',
            left: 27.5,
            marginTop: -22.5,
        },
        box: {
            width:45,
            justifyContent:'center',
            alignItems:'center',
            height:45,
            borderRadius:45,
            backgroundColor:'rgba(0,0,0,0.4)'
        },
        containerCS: {
            position:'absolute',
            left: 0,
            bottom: 0,
            right: 0,
            top: 0,
            zIndex: 9999,
            overflow:'hidden'
        }
    }),
    clarity: StyleSheet.create({
        content:{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            top: 0,
            zIndex: 999,
        },
        slider:{
            position:'absolute',
            top:0,
            bottom:0,
            width: 160,
            backgroundColor: 'rgba(0,0,0,0.7)',
        }
    }),
    middlePlayer: StyleSheet.create({
        view:{
            position: 'absolute',
            zIndex: 666,
            top: '50%',
            left: '50%',
            marginTop: -25,
            marginLeft: -25,
        },
        box: {
            width: 50,
            height :50,
            justifyContent: 'center',
            alignItems: 'center'
        },
        image: {
            width: 40,
            height: 40
        },
    }),
    player: StyleSheet.create({
        container: {
            backgroundColor: '#000000',
            minHeight: 200,
            position: 'relative',
            overflow: 'hidden'
        },
        video: {
            overflow: 'hidden',
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            zIndex: 10
        },
    }),
    error: StyleSheet.create({
        container: {
            backgroundColor: 'rgba( 0, 0, 0, 0.5 )',
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1002,
        },
        icon: {
            marginBottom: 16,
        },
        text: {
            backgroundColor: 'transparent',
            color: '#f27474'
        },
    }),
    loader: StyleSheet.create({
        container: {
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor:'rgba(0,0,0,0.4)',
            zIndex:1000
        },
    }),
    controls: StyleSheet.create({
        headerRightBox:{
            position:'absolute',
            top:0,
            right:0,
            zIndex:10,
            width:140,
            bottom:0,
            flexDirection:'row',
            alignItems:'center',
            justifyContent:'flex-end'
        },
        batteryLevelBox:{
            height:10,
            width:22,
            position:'relative',
            flexDirection:'row',
            marginRight:20
        },
        batteryLevelInner:{
            height:10,
            width:20,
            borderWidth: 0.5,
            alignItems:'center',
            flexDirection:'row',
        },
        batteryLevel:{
            height:9.5
        },
        batterHeader:{
            height:4,
            width:2,
            backgroundColor:'#FFF',
            position:'absolute',
            top:'50%',
            left:20,
            marginTop:-2
        },
        bottomProgress:{
            position:'absolute',
            left:0,
            width:'100%',
            height:2.5,
            backgroundColor:'rgba(0,0,0,0.35)',
            zIndex:666,
            bottom:0
        },
        landBottomQxdContrl:{
            width:60,
            height:40,
            position:'absolute',
            top:0,right:60,
            flexDirection:'row',
            alignItems:'center',
            justifyContent:'flex-end'
        },
        landBottomFullContrl:{
            height:40,
            width:60,
            paddingLeft:14,
            position:'absolute',
            top:0,right:0,
            flexDirection:'row',
            alignItems:'center'
        },
        landPlayerTimeBox:{
            height:40,
            flexDirection:'row',
            alignItems:'center'
        },
        landPlayerTouch:{
            height:40,
            width:60,
            paddingBottom:6,
            paddingLeft:20,
            flexDirection:'row',
            alignItems:'center',
        },
        landBottomBox:{
            height:40,
            flexDirection:'row',
            width:'100%',
            overflow:'hidden',
            position:'relative'
        },
        topTitle:{
            position:'absolute',
            width: '100%',
            left:0,
            top:0,
            overflow:"hidden",
            right:0,
            zIndex:666
        },
        topTitleImageBack:{
            width:'100%',
            overflow:'hidden',
            padding:10
        },
        verProccess:{
            height:40,
            flexDirection:'row',
            alignItems:'center',
            justifyContent:'center',
            position:'absolute',
            left:60,
            right:90,
            top:0,
            bottom:0,
            paddingHorizontal:6
        },
        timerBox:{
            height:40,
            width:60,
            justifyContent:'center'
        },
        row: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: null,
            width: null,
        },
        column: {
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: null,
            width: null,
        },
        vignette: {
            resizeMode: 'stretch'
        },
        control: {
            padding: 12,
        },
        text: {
            backgroundColor: 'transparent',
            color: '#FFF',
            fontSize: 14,
            textAlign: 'center',
        },
        pullRight: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
        },
        top: {
            alignItems: 'stretch',
            justifyContent: 'flex-start',
            position: 'relative',
            zIndex: 666,
            height: 50,
            width: '100%'
        },
        bottom: {
            alignItems: 'stretch',
            justifyContent: 'flex-end',
            position:'absolute',
            width: '100%',
            height: 80,
            left: 0,
            bottom:0,
            zIndex:666,
        },
        topControlGroup: {
            alignSelf: 'stretch',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexDirection: 'row',
            width: null,
        },
        bottomControlGroup: {
            alignSelf: 'stretch',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 0,
            marginHorizontal:20
        },
        back:{

        },
        volume: {
            flexDirection: 'row',
        },
        fullscreen: {
            flexDirection: 'row',
        },
        playPause: {
            position: 'relative',
            width: 80,
            zIndex: 0
        },
        title: {
            alignItems: 'center',
            flex: 0.8,
            flexDirection: 'column',
            padding: 0,
        },
        titleText: {
            textAlign: 'left',
            fontSize: 15,
        },
        timer: {
            width: 80,
        },
        timerText: {
            backgroundColor: 'transparent',
            color: '#FFF',
            fontSize: 11
        },
    }),
    volume: StyleSheet.create({
        container: {
            alignItems: 'center',
            justifyContent: 'flex-start',
            flexDirection: 'row',
            height: 1,
            marginLeft: 20,
            marginRight: 20,
            width: 150,
        },
        track: {
            backgroundColor: '#333',
            height: 1,
            marginLeft: 7,
        },
        fill: {
            backgroundColor: '#FFF',
            height: 1,
        },
        handle: {
            position: 'absolute',
            marginTop: -24,
            marginLeft: -24,
            padding: 16,
        }
    }),
    seekbar: StyleSheet.create({
        container: {
            alignSelf: 'stretch',
            height: 28,
            marginLeft: 20,
            marginRight: 20
        },
        track: {
            backgroundColor: 'rgba(255,255,255,0.5)',
            height: 2.5,
            position: 'relative',
            top: 14,
            width: '100%',
            borderRadius: 2.5,
        },
        fill: {
            backgroundColor: '#FFF',
            height: 2.5,
            width: '100%',
            borderRadius: 2.5,
            position: 'relative',
            zIndex: 10
        },
        buffer:{
            height:2.5,
            left:0,
            bottom:0,
            zIndex:9,
            position:'absolute'
        },
        handle: {
            position: 'absolute',
            marginLeft: -7,
            height: 28,
            width: 28,
            zIndex: 667
        },
        circle: {
            borderRadius: 12,
            position: 'relative',
            top: 8,
            left: 0,
            height: 12,
            width: 12,
        },
    })
};