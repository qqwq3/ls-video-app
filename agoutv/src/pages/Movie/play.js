
/*播放详情*/

'use strict';

import React,{ Component } from 'react';
import { StyleSheet, View, ActivityIndicator, TouchableOpacity, Image, Text, Animated } from 'react-native';
import { connect } from 'react-redux';
import Immutable from 'immutable';
import KeepAwake from 'react-native-keep-awake';
import PropTypes from 'prop-types';
import { Loading } from '../../components/XingrenEasyLoading';
import {
    loadVideoDetail,
    addSubscribe,
    deleteSubscribe,
    addFav,
    deleteFav,
    deleteSeriaFav,
    addSeriaFav,
    loadStreams,
    loadStreamsWithUrl,
    playVideo,
    downVideo,
    loadSessionStatus,
    download
} from '../../actions/video';
import { MovieDetail } from "./movieDetail";
import CSVideoPlayer from '../../common/CSVideoPlayer';
import { saveCommon, loadCommon } from '../../common/Storage';
import { checkNetworkState, netInfoAddEventListener, getCurrentNetInfo, statusBarSetPublic } from "../../common/tool";
import { addTask } from '../../actions/task';

const util = require('../../common/Util');
const PlayStatus = {
    Stop: 'Stop',
    Loading: 'Loading',
    Check: 'Check',
    Start: 'Start',
    Playing: 'Playing',
    End: 'End',
    Error: 'Error',
    Disabled: 'Disabled',
    TimesUsedUp: 'TimesUsedUp',
};
const clarityBoxWidth = 160;

class MoviePlayScreen extends Component {
    static navigationOptions = {
        header: null,
        tabBarVisible: false,
    };
    static propTypes = {
        code: PropTypes.string.isRequired,
        video: PropTypes.object,
        episode: PropTypes.number,
    };
    static defaultProps = {
        code: '',
        video: {},
    };
    constructor(props) {
        super(props);
        this._renderInfo = this._renderInfo.bind(this);
        this._renderLoading = this._renderLoading.bind(this);
        // 当前状态
        this.status = PlayStatus.Stop;
        // 状态变更时间
        this.statusTime = Date.now();
        this.state = {
            IsShowArrow: true,
            defaultNode: null,
            // 是否显示播放按钮 - 默认为显示
            showPlayBut: true,
            // 判断是否横屏的状态
            isLandscape: false,
            // 是否显示对应的提示 - 没有券
            isQuPrompt: false,
            // 视频加载出错
            isVideoError: false,
            // 视频清晰度对应的索引值 - 默认为零
            clarityIndex: 0,
            // 清晰度箱子是否可见
            isClarityVisible: false,
            // 当前时间记录状态管理
            isCurrentStatus: false,
            networkStatus: true,
            // 拿到视频播放清晰度集合
            clarity:[],
            paused: false,
            // 网络类型
            networkType: 'wifi',
            // 网络类型值
            effectiveType: '',
            // 清晰度提示状态是否显示
            clarityStatus: false,
        };
        // 拿到视频播放清晰度集合 - 默认为空
        this.clarity = [];
        // 动画集合
        this.animateds = {
            // 清晰度
            clarityRightDistance: new Animated.Value(0)
        };
        // 当前播放时间记录
        this.currentPlayerRecord = 0;
        // 当前播放清晰度记录
        this.currentPlayerClarity = 0;
        this.timer = 0;
    }
    componentWillMount()  {
        const { code } = this.props;

        // 加载详情数据
        this.loadDetail(code);
        // 设置状态栏
        this._statusBarSet();
        // 检测网络
        this._checkNetwork();
        // 网络监听
        this.netInfoListener = netInfoAddEventListener('connectionChange',this.networkHandler.bind(this));
        // 打开这个组件获取当前网络类型
        this._networkType();
        // 取到当前视频的本地清晰度索引
        this._loadCurrentClarity(code);
        // 清除计数器
        this._closeTimer();
    }
    componentWillUnmount() {
        const { video } = this.props;
        let src = video && video.src;

        // 状态栏还原
        this._statusBarReduction();
        // 卸载组件时一系列警告处理
        this.setState = () => { return };
        //清除网络监听
        this.netInfoListener && this.netInfoListener.remove();
    }
    async componentWillReceiveProps(nextProps) {
        if (nextProps.video.spi && nextProps.video.spi.timeUpdated > this.statusTime) {
            this._changeStatus(PlayStatus.Start);
            this._loadVideo(nextProps.video);
            this.setState({IsShowArrow: false, showPlayBut: false});
        }
    }
    // 打开计时器
    _openTimer(){
        this.viewTimer = setInterval(() => {
            this.timer += 1;
        },1000);
    }
    // 关闭计时器
    _closeTimer(){
        this.viewTimer && clearInterval(this.viewTimer);
        this.timer = 0;
    }
    // 取到当前视频的本地清晰度索引
    async _loadCurrentClarity(code){
        this.currentPlayerClarity = await loadCommon(code + 'clarity');

        if(this.currentPlayerClarity !== null){
            return this.setState({clarityIndex: this.currentPlayerClarity.index});
        }

        return this.setState({clarityIndex: 0});
    }
    // 网络监听对应的方法
    networkHandler(status){
        const { isLandscape } = this.state;

        // 如果监听到网络恢复
        if(status === true){
            isLandscape && this.CSVideoPlayerRef.methods.toggleFullscreen();
            this._networkType();
        }
        // 更新网络状态值
        this.setState({networkStatus: status});
    }
    // 网络类型检测
    _networkType(){
        getCurrentNetInfo(res => {
            this.setState({networkType: res.type, effectiveType: res.effectiveType});
        });
    }
    // 加载详情
    loadDetail(code) {
        const { loadVideoDetail } = this.props;
        loadVideoDetail && loadVideoDetail(code);
    }
    // 点击推荐里的回调
    recommendCallBack(code) {
        const { navigation } = this.props;

        navigation.setParams({code: code});
        this.loadDetail(code);
        this.setState({
            showPlayBut: true,
            stream: false,
            isVideoError: false,
            isLandscape: false,
            isCurrentStatus: false,
            isClarityVisible: false,
            clarityIndex: 0,
            defaultNode: false,
            paused: false
        });

        // 取到当前视频的本地清晰度索引
        this._loadCurrentClarity(code);
    }
    // 检测是否有可用网络
    _checkNetwork(){
        checkNetworkState(status => {
            this.setState({networkStatus: status});
        });
    }
    // 加载视频流
    async _loadVideo(video) {
        let season = 0;
        let D : any = 0;
        const { clarityIndex } = this.state;

        if(video && video.playLink) {
            let arr = Object.keys(video.playLink);

            if(video.type === 2 || video.type === 1 || video.type === 5){ D = arr[0] }
            else if(video.type === 4){ D = arr[arr.length-1] }
            else{ D = 0 }

            let episodeValue = video.playLink[video.episode|| D];
            if(episodeValue && episodeValue.season) {
                season = episodeValue.season;
            }
        }

        this.statusTime = Date.now();

        loadStreams(video.id, season || 0, video.episode || D, video.src || 0)
        .then((result) => {
                if (result.code === 0) {
                    let streams = result.data;
                    this.clarity = streams;
                    this.setState({clarity:streams});
                    //播放
                    if(video.handleType !== "down"){
                        this._playStream(streams[clarityIndex]);
                    }
                }
            },
            (error) => {
                // this.setState({isVideoError: true});
        });
    }
    // 视频播放流处理
    _playStream(stream) {
        if (stream.m3u8Url) {
            this.setState({stream: stream.m3u8Url});
        }
        else if (stream.url) {
            loadStreamsWithUrl(stream.url)
            .then((result) => {
                    if (result.code === 0) {
                        this.setState({stream: result.data.location});
                    }
                },
                (error) => {
                    // this.setState({isVideoError: true});
                });
        }
        else{
            this.setState({stream: false});
        }
    }
    // 手机状态栏设置
    _statusBarSet(){
        statusBarSetPublic('#000000','light-content',true);
    }
    // 手机状态栏还原
    _statusBarReduction(){
        statusBarSetPublic('rgb(255,255,255)','dark-content',true);
    }
    dataIsValid(props) {
        props = props || this.props;
        return props.video && props.video.id && props.video.playLink;
    }
    _changeStatus(status) {
        this.status = status;
        this.statusTime = Date.now();
    }
    _renderLoading() {
        return (
            <View style={[styles.loadingContainer,{backgroundColor:'rgba(0,0,0,1)'}]}>
                <ActivityIndicator color={'rgb(0,118,248)'} size={'small'}/>
            </View>
        );
    }
    // 当视频选集时清空当前视频流 - 取到当前视频播放的时间记录
    cleanStream(episode){
        let video = this.props.video;
        let type = video && video.type;
        let code = this.props.code;
        let src = video && video.src;
        const { navigate } = this.props.navigation;

        this.setState({
            stream: false,
            defaultNode: episode,
            paused: false,
        });

        // 优酷
        if(Number(src) === 1){
            let keysArr = Object.keys(video.playLink) || false;
            let gIndex = this._videoPlayerIndex(keysArr,episode);
            let srcId = this._requestYoukuPlayerId(video,keysArr[gIndex]);
            return navigate('YouKuPlayer',{ video: video, srcId: srcId, episode: episode});
        }

        this._loadPlayerRecordTime(type,code,episode);
    }
    // 公共加载本地记录时间方法
    async _loadPlayerRecordTime(type: number | string, code: string , episode?: number | string){
        let T = Number(type);
        // 电影
        if(T === 1){
            // 播放时就取到当前视频本地记录的时间
            this.currentPlayerRecord = await loadCommon(code) || 0;
        }
        // 其他（电视剧，综艺，动漫）
        else {
            this.currentPlayerRecord = await loadCommon(code + episode) || 0;
        }
    }
    // 详情
    _renderInfo() {
        const {defaultNode} = this.state;
        return (
            <MovieDetail
                cleanStream={this.cleanStream.bind(this)}
                recommendCallBack={this.recommendCallBack.bind(this)}
                defaultNode={defaultNode}
                clarityArr={this.state.clarity}
                changedPlayer={this.changedPlayer.bind(this)}
                screen={this.state.isLandscape}
                {...this.props}
            /> || <View/>
        );
    }
    // 进入缓存页后 - 暂停播放
    changedPlayer(){
        this.setState({paused: true});
    }
    // 播放进度
    _onProgress() {
        this._changeStatus(PlayStatus.Playing);
    }
    // 播放
    _onPlay = (code, video, episode) => {
        if (this.dataIsValid()) {
            let arr = Object.keys(video.playLink);
            let episodeValue = video.playLink[episode];
            // let sums = Number(launchSettings.spi.remainsPlay);
            let src = video && video.src;
            const { navigate } = this.props.navigation;

            this.setState({isVideoError: false});

            // if(sums === 0){
            //     this.setState({isQuPrompt: true, showPlayBut: true});
            //     return;
            // }

            if(!episodeValue){
                if(video && (video.type === 2 || video.type === 1 || video.type === 5)){
                    episodeValue = video.playLink[Number(arr[0])];
                }
                else if(video && video.type === 4){
                    episodeValue = video.playLink[Number(arr[arr.length - 1])];
                }
                else{
                    episodeValue = video.playLink[episode];
                }
            }

            if (episodeValue) {
                let type = video && video.type;
                let Episode= episodeValue.episode;

                if(Number(src) === 1){
                    let keysArr = Object.keys(video.playLink) || [];
                    let gIndex = this._videoPlayerIndex(keysArr,Episode);
                    let srcId = this._requestYoukuPlayerId(video,keysArr[gIndex]);
                    return navigate('YouKuPlayer',{ video: video, srcId: srcId, episode: Episode});
                }

                this.props.playVideo(video.id, code, episodeValue.episode, episodeValue.serialsSrcId);
                this._loadPlayerRecordTime(type,code,Episode);
            }

            this.setState({
                IsShowArrow: false,
                showPlayBut: false,
                stream: false,
                isCurrentStatus: true,
                networkType: 'other'
            });

            // 电视剧 - 动漫 - 默认选集
            if(video && (video.type === 2 || video.type === 5)){
                if(episode){
                    this.setState({defaultNode: episode});
                }
                else{
                    this.setState({defaultNode: Number(arr[0])});
                }
            }
            // 综艺 - 默认选集
            else if(video && video.type === 4){
                if(episode){
                    this.setState({defaultNode: episode});
                }
                else{
                    this.setState({defaultNode: Number(arr[arr.length - 1])});
                }
            }
        }
    };
    // 视频播放出错
    _onPlayError() {
        const { isLandscape } = this.state;
        this.setState({stream: false,showPlayBut:false,isVideoError: true});
        this._changeStatus(PlayStatus.Error);
        isLandscape && this.CSVideoPlayerRef.methods.toggleFullscreen();
    }
    // 视频播放结束
    _onPlayEnd() {
        this._changeStatus(PlayStatus.End);
        this._videoPlayerEnd();
        // 退出全屏
        this.CSVideoPlayerRef && this.CSVideoPlayerRef._onExitFullscreen();
    }
    // 获取视频播放对应的索引
    _videoPlayerIndex(keysArr: Array<any> = [], episode: string | number){
        let gIndex;

        if(episode === undefined || episode === null || episode === ''){
            gIndex = keysArr[0];
        }
        else{
            for(let i = 0; i < keysArr.length; i++){
                if(Number(keysArr[i]) === Number(episode)){
                    gIndex = i;
                }
            }
        }

        return gIndex;
    }
    // 视频播放完了做一些处理
    _videoPlayerEnd(){
        const { video, code, episode } = this.props;
        let keysArr = Object.keys(video.playLink) || false;
        let length = keysArr.length || 0;
        const { isLandscape } = this.state;
        let type = video && video.type;

        if(video){
            // 电视剧 - 动漫
            if(video.type === 2 || video.type === 5){
                let tjCode = video.similarRecommend[0].hexId;
                let gIndex = this._videoPlayerIndex(keysArr,episode);

                if(Number(episode) === Number(keysArr[length - 1])){
                    this.setState({defaultNode: null,showPlayBut: false, stream: null});
                    isLandscape && this.CSVideoPlayerRef.methods.toggleFullscreen();
                    tjCode !== undefined && this.recommendCallBack(tjCode);
                }
                else{
                    this._onPlay(code, video, keysArr[gIndex+1]);
                    this.setState({defaultNode: keysArr[gIndex+1], showPlayBut: false, stream: null});
                }
                // 读取视频本地时间记录
                this._loadPlayerRecordTime(type,code,keysArr[gIndex+1]);
            }
            // 综艺
            else if(video.type === 4){
                let tjCode = video.similarRecommend[0].hexId;
                let gIndex = this._videoPlayerIndex(keysArr,episode);

                if(Number(episode) === Number(keysArr[0])){
                    this.setState({defaultNode: null,showPlayBut: false, stream: null});
                    isLandscape && this.CSVideoPlayerRef.methods.toggleFullscreen();
                    tjCode !== undefined && this.recommendCallBack(tjCode);
                }
                else{
                    this._onPlay(code, video, keysArr[gIndex-1]);
                    this.setState({defaultNode: keysArr[gIndex-1], showPlayBut: false, stream: null});
                }
                // 读取视频本地时间记录
                this._loadPlayerRecordTime(type,code,keysArr[gIndex-1]);
            }
            // 电影
            else if(video.type === 1){
                let tjCode = video.similarRecommend[0].hexId;
                isLandscape && this.CSVideoPlayerRef.methods.toggleFullscreen();
                tjCode !== undefined && this.recommendCallBack(tjCode);
                // 读取视频本地时间记录
                this._loadPlayerRecordTime(type,code);
            }
        }
    }
    // 视频开始加载
    _onPlayStart() {
        this._changeStatus(PlayStatus.Playing);
    }
    // 进入分享页
    _onAddPlay() {
        const { navigate } = this.props.navigation;
        return navigate('SpreadPage',{setTranslucent: 'setTranslucent'});
    }
    // 返回
    _onBack(){
        const { goBack } = this.props.navigation;
        return goBack();
    }
    // 视频加载完后
    _onLoad(){
        this.setState({clarityStatus: false});
        this._openTimer();
    }
    // 判断是否横屏
    _screenDirection(status){
        this.setState({isLandscape: status});
    }
    // 视频UI
    _renderUI() {
        const { code, video, episode } = this.props;
        const { stream, showPlayBut, isVideoError, clarityIndex, networkType, effectiveType } = this.state;
        const { networkStatus } = this.state;
        let title = (video && video.title) || '';

        // 有网的情况下
        if(networkStatus){
            // 如果当前网络不是移动网络
            if(networkType === 'cellular'){
                return (
                    <View style={[styles.unplayableTip,{flexDirection:'column'}]}>
                        <Text style={styles.unplayableTipText}>已检测到当前网络为{effectiveType.toUpperCase()}</Text>
                        <View style={{flexDirection:'row',marginTop:20}}>
                            <TouchableOpacity onPress={() => this._onPlay(code, video, episode)}activeOpacity={0.50} style={[styles.dhBut,{width:100,marginRight:20}]}>
                                <Text style={styles.unplayableTipText}>立即播放</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this._onBack()} activeOpacity={0.50} style={[styles.dhBut,{width:100,backgroundColor:'#FFFFFF'}]}>
                                <Text style={[styles.unplayableTipText,{color:'#999'}]}>稍后播放</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
            }

            // 如果视频加载出错
            if(isVideoError){
                return (
                    <View style={[styles.unplayableTip,{flexDirection:'column'}]}>
                        <Text style={styles.unplayableTipText}>亲，视频加载或播放出错啦！</Text>
                        <View style={{flexDirection:'row',marginTop:20}}>
                            <TouchableOpacity onPress={() => this._onPlay(code, video, episode)}activeOpacity={0.50} style={[styles.dhBut,{width:100,marginRight:20}]}>
                                <Text style={styles.unplayableTipText}>重新播放</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this._onBack()} activeOpacity={0.50} style={[styles.dhBut,{width:100,backgroundColor:'#FFFFFF'}]}>
                                <Text style={[styles.unplayableTipText,{color:'#999'}]}>换一个吧</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
            }

            if(showPlayBut){
                return this._renderCover();
            }

            if(stream){
                return (
                    <CSVideoPlayer
                        {...this.state}
                        {...this.props}
                        saveInfo={true}
                        paused={this.state.paused}
                        title={title}
                        resizeMode={'contain'}
                        clarityArr={this.clarity}
                        clarityIndex={clarityIndex}
                        showOnStart={false}
                        source={{uri:stream}}
                        isTopControl={true}
                        middlePlayBtnDisplay={false}
                        onBack={this._onBack.bind(this)}
                        onLoadStart={this._onPlayStart.bind(this)}
                        onEnd={this._onPlayEnd.bind(this)}
                        onError={this._onPlayError.bind(this)}
                        onProgress={this._onProgress.bind(this)}
                        onLoad={this._onLoad.bind(this)}
                        ref={ref => this.CSVideoPlayerRef = ref}
                        screenDirection={this._screenDirection.bind(this)}
                        openClarityPanel={this._openClarityPanel.bind(this)}
                        timeRecord={true}
                        timeRecordValue={this.currentPlayerRecord}
                        showBottomProgress={'show'}
                        CSVideoPlayerComponentWillUnmount={this._CSVideoPlayerComponentWillUnmount.bind(this)}
                    />
                );
            }

            // 视频载入中
            if (!video || !video.playLink || !stream) {
                return (
                    <View style={[styles.videoLoadingBox]}>
                        <Text style={[styles.videoLoadingText]}>视频载入中...</Text>
                    </View>
                );
            }
        }

        // 如果没有网络
        if(!networkStatus){
            return (
                <View style={styles.checkContainer}>
                    <Text style={styles.checkCText}>当前网络不可用，请稍后再试！</Text>
                </View>
            );
        }
    }
    // 当播放组件卸载时候去触发action
    _CSVideoPlayerComponentWillUnmount(seconds, video){
        const { addTask } = this.props;
        const movie_id = video && video.id;
        const episode = video.episode;
        const serials_src_id = video && video.playLink && video.playLink[episode].serialsSrcId;

        // console.log('play.js---651',video,'movie_id:'+movie_id,'serials_src_id:'+serials_src_id,'当前集数'+episode,'当前播放秒数'+seconds);

        // 播放结束后大于等于10秒才能触发action
        if(Number(this.timer) >= 10){
            addTask && addTask('watch_video', this.timer, movie_id, serials_src_id);
        }
        this._closeTimer();
    }
    // 打开清晰度面板
    _openClarityPanel(){
        this._clarityOpen();
    }
    _renderCover() {
        const {code,video,episode} = this.props;
        let playButImg = require('../../components/imgs/VideoPlayerV2/icon_fullscreen_play.png');
        const { showPlayBut,isQuPrompt } = this.state;

        const playButton = (
            <TouchableOpacity activeOpacity={0.5} onPress={() => this._onPlay(code, video, episode)}>
                <Image style={styles.playButton} source={playButImg}/>
            </TouchableOpacity>
        );

        const unplayableButton = (
            <TouchableOpacity activeOpacity={1} style={[styles.unplayableTip,{flexDirection:'column'}]} onPress={this._onAddPlay.bind(this)}>
                <Text style={styles.unplayableTipText}>亲，今日观影券已用完了哦。</Text>
                <View style={[styles.dhBut,{marginTop:20}]}><Text style={styles.unplayableTipText}>立即增加观影券</Text></View>
            </TouchableOpacity>
        );

        return (
            isQuPrompt ?
            <View style={styles.coverView}>{unplayableButton}</View> :
            <View style={styles.coverView}>{ showPlayBut && playButton }</View>
        );
    }
    // 打开清晰度动画
    _clarityOpen(){
        let right = this.animateds.clarityRightDistance;
        let width = clarityBoxWidth;

        right.setValue(-width);
        this.setState({isClarityVisible: true});
        Animated.timing(right,{
            toValue: 0,
            delay: 100,
            duration: 300
        }).start();
    }
    // 关闭清晰度动画
    _clarityClose(){
        let right = this.animateds.clarityRightDistance;
        let width = clarityBoxWidth;

        Animated.timing(right,{
            toValue: -width,
            delay: 0,
            duration: 200
        }).start(() => this.setState({isClarityVisible: false}));
    }
    // 清晰度选择
    claritySelect(item, index){
        const { code } = this.props;

        this.setState({clarityIndex: index, clarityStatus: true});
        // 切换播放资源
        this._playStream(item);
        // 关闭清晰度滑盖
        this._clarityClose();
        // 储存当前视频播放清晰度的索引值
        code && saveCommon(code + 'clarity',{ index });
    }
    // 视频清晰度
    _renderClarity(){
        const { isLandscape, isClarityVisible, clarityIndex } = this.state;
        let right = this.animateds.clarityRightDistance;
        let clarityArr = this.clarity.length !== 0 && this.clarity;

        if(isLandscape){
            return (
                isClarityVisible ?
                <TouchableOpacity activeOpacity={1} onPress={this._clarityClose.bind(this)} style={styles.clarityContent}>
                    <Animated.View style={[styles.claritySlider,{right:right}]}>
                        <View style={styles.clarityInner}>
                            {
                                clarityArr.map((item, index) => {
                                    let textColor = index === clarityIndex ? 'rgb(0,117,248)' : 'rgb(255,255,255)';
                                    let boxBg = index === clarityIndex ? 'rgb(0,0,0)' : 'transparent';
                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            style={[styles.clarityRows,{backgroundColor:boxBg}]}
                                            activeOpacity={0.30}
                                            onPress={index === clarityIndex ? this._clarityClose.bind(this) : this.claritySelect.bind(this,item,index)}
                                        >
                                            <Text style={[styles.clarityRowsText,{color:textColor}]}>{ item.videoProfile }</Text>
                                        </TouchableOpacity>
                                    )
                                })
                            }
                        </View>
                    </Animated.View>
                </TouchableOpacity> : null
            );
        }
        return null;
    }
    _renderUi(){
        return (<View style={styles.renderUI}>{ this._renderUI() }</View>);
    }
    _renderKeepAwake(){
        return (<KeepAwake/>);
    }
    _renderMsg(){
        const { video, episode, code } = this.props;
        return this._renderInfo(video, episode, code);
    }
    // 优酷播放下取到的ID
    _requestYoukuPlayerId(video: any, node: number | string): number | string{
        let playLink = (video && video.playLink) || {};
        let srcId = 0;

        if(playLink){
            srcId = playLink[node].srcId;
        }
        else{
            srcId = 0;
        }

        return srcId;
    }
    render() {
        return (
            <View style={styles.container}>
                { this._renderUi() }
                { this._renderMsg() }
                { this._renderClarity() }
                { this._renderKeepAwake() }
            </View>
        );
    }
}

const styles = StyleSheet.create({
    loadHorzonContent:{
        backgroundColor:'#000000',
        justifyContent:'center',
        alignItems:'center',
        flex:1
    },
    checkContainer: {
        position: 'absolute',
        left:0,
        right:0,
        bottom:0,
        top:0,
        zIndex:99999,
        backgroundColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center'
    },
    checkCText:{
        fontSize: 15,
        color: '#ffffff'
    },
    container: {
        backgroundColor: '#FFFFFF',
        flex: 1,
        position:'relative',
    },
    clarityInner:{
        flex: 1,
        justifyContent: 'center'
    },
    clarityRows:{
        width: '100%',
        height: 45,
        justifyContent:'center',
        alignItems: 'center'
    },
    clarityRowsText:{
        fontSize: 16,
    },
    claritySlider:{
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: clarityBoxWidth,
        zIndex: 666,
        backgroundColor: 'rgba(0,0,0,0.7)'
    },
    clarityContent:{
        position:'absolute',
        left:0,top:0,right:0,bottom:0,
        zIndex:9999
    },
    dhBut:{
        backgroundColor:'rgb(0,117,248)',
        height: 30,
        justifyContent:'center',
        alignItems:'center',
        width: 150,
        borderRadius: 20,
        overflow:'hidden'
    },
    renderUI:{
        minHeight:200,
        backgroundColor:'#000000',
        position:'relative'
    },
    videoLoadingBox:{
        height:200,
        backgroundColor:'rgb(0,0,0)',
        width: "100%",
        justifyContent:'center',
        alignItems:'center',
    },
    videoLoadingText:{
        fontSize:15,
        color:'rgb(255,255,255)'
    },
    goback:{
        position:'absolute',
        top:0,
        left:0,
        height:60,
        width:100,
        zIndex:600,
        paddingLeft:16,
        paddingTop:16.5
    },
    playButton: {
        width: 40,
        height: 40,
    },
    actionSheetContentContainer: {
        flex: 1,
        width: util.getScreenWidth(),
        alignItems: 'center',
        justifyContent: 'center',
    },
    unplayableTip: {
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        flex:1
    },
    unplayableTipText: {
        color: '#fff',
        fontSize: 14,
    },
    cover: {
        width: 100,
        height: 160,
        alignItems: 'center',
        justifyContent: 'center',
    },
    coverView: {
        backgroundColor: 'rgba(0,0,0,1)',
        minWidth: util.SCREEN_WIDTH,
        minHeight: 200,
        justifyContent: 'center',
        alignItems: 'center',
        position:'relative'
    }
});

const mapStateToProps = (state, ownProps) => {
    const code = ownProps.navigation.state.params.code;
    let episode = ownProps.navigation.state.params.episode;
    let data = state.getIn(['video', 'video', code]);
    let userData = state.getIn(['user']);
    let taskData = state.getIn(['task']);

    if (Immutable.Map.isMap(taskData)) { taskData = taskData.toJS() }
    if (Immutable.Map.isMap(data)) { data = data.toJS() }
    if (Immutable.Map.isMap(userData)) { userData = userData.toJS() }
    if (data && data.episode && data.episode > 0) { episode = data.episode }

    return {
        ...userData,
        code,
        episode,
        video: data,
        taskData: taskData
    };
};

export default connect(mapStateToProps, {
    loadVideoDetail,
    addSubscribe,
    deleteSubscribe,
    addFav,
    deleteFav,
    deleteSeriaFav,
    addSeriaFav,
    playVideo,
    downVideo,
    loadSessionStatus,
    download,
    addTask
})(MoviePlayScreen);