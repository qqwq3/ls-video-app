
/*小视频详情页*/

'use strict';

import React,{ PureComponent } from 'react';
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    ImageBackground
} from 'react-native';
import KeepAwake from 'react-native-keep-awake';
import ImageLoad from 'react-native-image-placeholder';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import {
    pixel,
    numberConversion,
    videoStreamSize,
    checkNetworkState,
    netInfoAddEventListener,
    getCurrentNetInfo,
    statusBarSetPublic
} from "../../common/tool";
import HeaderBox from '../../common/HeaderBox';
import * as api from '../../middlewares/api';
import CSVideoPlayer from '../../common/CSVideoPlayer';
import NoData from '../Common/NoData';

class FoundDetail extends PureComponent<{}>{
    constructor(props){
        super(props);
        this.state = {
            // 视频播放地址
            mp4Url: null,
            isLandscape: false,
            // 精彩推荐
            relateConts: [],
            // 短视频的标题
            title: "",
            // 流的尺寸
            streamSize: 0,
            // 网络状态
            networkStatus: true,
            // 网络类型
            networkType: 'wifi',
            // 视频图片
            videoImage: null,
            // 网络类型值
            effectiveType: ''
        };
        // 拿到上一个页面传过来的数据
        this.params = this.props.navigation.state.params || false;
    }
    componentWillMount(){
        let title = this.params && this.params.item && this.params.item.title;

        this._requestPlayerVideoStream();
        this.setState({title: title});
        // 开始网络监听
        this.netInfoListener = netInfoAddEventListener('connectionChange',this.netInfoHandler.bind(this));
        // 打开本组件时 - 检测网络是否可用
        checkNetworkState(res => this.setState({networkStatus: res}));
        // 打开本组件时 - 检测网络类型
        this._networkType();
    }
    componentWillUnmount(){
        statusBarSetPublic && statusBarSetPublic('#FFFFFF','dark-content',true);
        this.setState = () => { return };
        // 卸载网络监听
        this.netInfoListener && this.netInfoListener.remove();
    }
    // 网络监听方法
    netInfoHandler(res){
        const { isLandscape } = this.state;

        // 如果监听到网络恢复就重新加载数据 - 以及其他操作
        if(res === true){
            this._requestPlayerVideoStream();
            // 退出全屏
            isLandscape && this.CSVideoPlayer && this.CSVideoPlayer._onExitFullscreen();
            this._networkType();
        }
        // 更新网络状态值
        this.setState({networkStatus: res});
    }
    // 网络类型检测
    _networkType(){
        getCurrentNetInfo(res => {
            this.setState({networkType: res.type, effectiveType: res.effectiveType});
        });
    }
    // 取到播放的视频流
    async _requestPlayerVideoStream(){
        let item = (this.params && this.params.item) || false;
        let type = (this.params && this.params.type) || false;
        let hexId = item && item.hexId;

        // 西瓜
        if(type === 'xigua'){
            let res = await api.xiguaStream(hexId);
            let mp4Url = this._videoData(res);
            let xiguaResult = await api.hotShortVideoFromXigua();
            let relateConts = (xiguaResult && xiguaResult.code === 0) && xiguaResult.data;
            // 获取流的尺寸
            // videoStreamSize(mp4Url,'GET',streamSize => {
            //     this.setState({streamSize: streamSize});
            // });
            this.setState({mp4Url: mp4Url,relateConts: relateConts, videoImage: item.cover});
        }

        // 梨视频
        if(type === 'pear'){
            let res = await api.pearStream(hexId);
            let mp4Url = this._videoData(res);
            // 获取流的尺寸
            // videoStreamSize(mp4Url,'GET',streamSize => {
            //     this.setState({streamSize: streamSize});
            // });
            this.setState({mp4Url: mp4Url, relateConts: res.data.relateConts, videoImage: item.cover});
        }
    }
    // 单独对梨视频流 - 进行处理
    async _dataDealWith(item){
        let type = (this.params && this.params.type) || false;
        let hexId = (item !== null && item.hexId) || '';
        let title = (item !== null && item.title) || '';
        let res,mp4Url,relateConts;

        // 梨视频
        if(type === 'pear'){
            res = await api.pearStream(hexId);
            mp4Url = this._videoData(res);
            relateConts = res.data.relateConts;
        }
        // 西瓜视频
        if(type === 'xigua'){
            res = await api.xiguaStream(hexId);
            mp4Url = this._videoData(res);
            let xiguaResult = await api.hotShortVideoFromXigua();
            relateConts = (xiguaResult && xiguaResult.code === 0) && xiguaResult.data;
        }
        // 获取流的尺寸
        // videoStreamSize(mp4Url,'GET',streamSize => {
        //     this.setState({streamSize: streamSize});
        // });
        this.setState({mp4Url: mp4Url, relateConts: relateConts, title: title, videoImage: item.cover});
    }
    // 获取视频流 - 公共方法
    _videoData(res){
        let source = null;

        if(res.code === 0){
            let data = res.data;
            let mp4Url = data && data.mp4Url;
            source = mp4Url;
        }

        return source;
    }
    // 返回
    _goBack(){
        const { goBack } = this.props.navigation;
        return goBack();
    }
    // 播放结束
    _onEnd(){
        const { relateConts, isLandscape } = this.state;

        this.setState({mp4Url: null});
        this._dataDealWith(relateConts[0] || null);
        // 退出全屏
        isLandscape && this.CSVideoPlayerRef && this.CSVideoPlayerRef._onExitFullscreen();
    }
    // 播放
    _onPlay(){
        KeepAwake.activate();
    }
    // 视频初始加载
    _onLoadStart(){
        KeepAwake.activate();
    }
    // 横竖屏区分
    _screenDirection(status){
        this.setState({isLandscape: status});
    }
    // 推荐视频点击事件
    _singleTj(item){
        this.setState({mp4Url: null});
        this._dataDealWith(item);
    }
    // 退视频推荐单项渲染
    _renderItem({item, index}){
        const iconDefaultFilmCover = require('../imgs/default_film_cover.png');

        return (
            <TouchableOpacity key={index} activeOpacity={0.75} onPress={this._singleTj.bind(this,item)} style={styles.rows}>
                <View style={[styles.rowsLeft]}>
                    <ImageLoad
                        source={{uri: item.cover}}
                        style={styles.image}
                        customImagePlaceholderDefaultStyle={styles.customImagePlaceholderDefaultStyle}
                        isShowActivity={false}
                        placeholderSource={iconDefaultFilmCover}
                        borderRadius={2}
                    />
                </View>
                <View style={styles.rowsRight}>
                    <View style={styles.roesRightHeader}>
                        <Text includeFontPadding={false} numberOfLines={3} style={styles.rowRightHeaderTitle}>{item.title || ""}</Text>
                    </View>
                    <View style={styles.rowsRightFooter}>
                        <Text numberOfLines={1} style={styles.rowsRightFooterText}>播放量：{numberConversion(item.watchCount || 0)}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
    // 4g网络下立即播放
    _playImmediately(){
        this.setState({networkType: 'other'});
    }
    render(){
        const {
            mp4Url,
            isLandscape,
            relateConts,
            title,
            streamSize,
            networkStatus,
            networkType,
            videoImage,
            effectiveType
        } = this.state;

        return (
            <View style={styles.fdContents}>
                {
                    !isLandscape ?
                    <HeaderBox
                        isText={true}
                        backgroundColor={'#FFFFFF'}
                        text={title}
                        isArrow={true}
                        goBack={this._goBack.bind(this)}
                    /> : null
                }
                <View style={styles.playerContent}>
                    <View style={styles.videoPlayer}>
                        {
                            networkStatus ? (
                                    networkType !== 'cellular' ? (
                                    mp4Url ?
                                        <CSVideoPlayer
                                            shortVideo={true}
                                            showOnStart={true}
                                            isTopControl={!isLandscape ? false : true}
                                            topTitle={!isLandscape ? true : false}
                                            topTitleNumberOfLines={2}
                                            title={title}
                                            source={{uri: mp4Url}}
                                            resizeMode={'contain'}
                                            middlePlayBtnDisplay={true}
                                            showBottomProgress={'show'}
                                            shortVideoPlayer={false}
                                            onPlay={this._onPlay.bind(this)}
                                            onLoadStart={this._onLoadStart.bind(this)}
                                            onEnd={this._onEnd.bind(this)}
                                            screenDirection={this._screenDirection.bind(this)}
                                            ref={ref => this.CSVideoPlayerRef = ref}
                                        /> :
                                        <View style={[styles.videoLoadingBox]}>
                                            <Text style={[styles.videoLoadingText]}>视频载入中...</Text>
                                        </View>
                                ) :
                                <ImageBackground source={{uri: videoImage}} imageStyle={{resizeMode:'cover'}} style={styles.videoCellularBox}>
                                    <View style={styles.videoCellularInnerBox}>
                                        <View style={styles.vciRows}>
                                            <Text style={styles.vicRowsText}>已检测到当前网络为{effectiveType.toUpperCase()}</Text>
                                        </View>
                                        <View style={[styles.vciRows,{marginTop: moderateScale(20)}]}>
                                            <TouchableOpacity activeOpacity={0.75} onPress={this._playImmediately.bind(this)} style={[styles.vciRowsBtn,{marginRight: moderateScale(20)}]}>
                                                <Text style={styles.vciRowsBtnText}>立即播放</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity activeOpacity={0.75} onPress={this._goBack.bind(this)} style={[styles.vciRowsBtn,{backgroundColor:'#dcdcdc'}]}>
                                                <Text style={styles.vciRowsBtnText}>稍后播放</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </ImageBackground>
                            ) :
                            <View style={styles.checkContainer}>
                                <Text style={styles.checkCText}>当前网络不可用，请稍后再试！</Text>
                            </View>
                        }
                    </View>
                    {
                        networkStatus ? (
                            relateConts.length !== 0 ?
                            <FlatList
                                data={relateConts}
                                renderItem={this._renderItem.bind(this)}
                                ListHeaderComponent={
                                    <View style={styles.rowsHeader}>
                                        <Text style={styles.rowsTitle}>精彩推荐</Text>
                                    </View>
                                }
                                ListFooterComponent={
                                    <View style={styles.rowsFooter}>
                                        <Text style={styles.rowsFooterText}>没有更多推荐了哦</Text>
                                    </View>
                                }
                                numColumns={1}
                                horizontal={false}
                                keyExtractor={(item,index) => index}
                                enableEmptySections={true}
                                showsVerticalScrollIndicator={false}
                                legacyImplementation={false}
                            /> :
                            <View style={styles.loadingBox}>
                                <ActivityIndicator size={'small'} color={'rgb(0,117,248)'}/>
                            </View>
                        ) :
                        <NoData source={require('../imgs/no_wifi.png')} isText={true} text={''}/>
                    }
                </View>
                <KeepAwake/>
            </View>
        );
    }
}

export default FoundDetail;

const styles = StyleSheet.create({
    rowsFooter:{
        height:40,
        justifyContent:'center',
        alignItems:'center',
        marginBottom:15
    },
    rowsFooterText:{
        fontSize:14,
        color:'#ccc'
    },
    vciRowsBtn:{
        backgroundColor:'rgb(0,117,248)',
        height: verticalScale(30),
        justifyContent:'center',
        alignItems:'center',
        width: scale(100),
        borderRadius: moderateScale(30),
        overflow:'hidden'
    },
    vciRowsBtnText:{
        color: '#fff',
        fontSize: 14,
    },
    vciRows:{
        flexDirection:'row',
        justifyContent:'center'
    },
    vicRowsText:{
        fontSize: 16,
        color:'#ffffff'
    },
    videoCellularInnerBox:{
        position:'absolute',
        left:0,
        top:0,
        right:0,
        bottom:0,
        zIndex:100,
        backgroundColor:'rgba(0,0,0,0.25)',
        justifyContent:'center',
        alignItems:'center'
    },
    videoCellularBox:{
        height:200,
        position:'relative'
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
    loadingBox:{
        flex:1,
        backgroundColor:'#FFFFFF',
        justifyContent:'center',
        alignItems:'center',
    },
    rows:{
        flexDirection: "row",
        overflow: 'hidden',
        marginBottom: moderateScale(15),
        paddingHorizontal: moderateScale(15),
        height: verticalScale(70)
    },
    rowsLeft:{
        width: scale(120),
        height: verticalScale(70),
    },
    roesRightHeader:{
        flex:3
    },
    rowsRightFooter:{
        flex:1,
        flexDirection:'row',
        alignItems: 'flex-end'
    },
    rowsRightFooterText:{
        fontSize:12,
        color:'rgb(192,192,192)'
    },
    rowsRight:{
        flex: 1,
        paddingLeft: moderateScale(15)
    },
    rowRightHeaderTitle:{
        flex:1
    },
    roesRightHeaderTitle:{
        fontSize: 14,
        color: 'rgb(64,64,64)',
    },
    image:{
        height: verticalScale(70),
        width: scale(120),
        borderRadius:2
    },
    rowsHeader:{
        height: verticalScale(44),
        marginHorizontal: moderateScale(15),
        flexDirection:'row',
        justifyContent: 'flex-start',
        alignItems:'center',
        borderBottomColor:'#dcdcdc',
        borderBottomWidth: 1 / pixel,
        marginBottom: moderateScale(15)
    },
    rowsTitle:{
        fontSize: 15,
        color:'rgb(64,64,64)',
        fontWeight: 'bold'
    },
    customImagePlaceholderDefaultStyle:{
        width: scale(40),
        height: verticalScale(40),
        justifyContent: 'center'
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
    videoPlayer:{
        width:'100%',
        minHeight:200,
        position:'relative',
        zIndex:9999,
        backgroundColor:"#000000"
    },
    fdContents:{
        flex: 1,
        backgroundColor:'#FFFFFF',
        overflow: 'hidden'
    },
    playerContent:{
        flex: 1
    },
    loadingText:{
        fontSize: 16,
        fontWeight:'bold',
        color:'#FFFFFF'
    },
});







































