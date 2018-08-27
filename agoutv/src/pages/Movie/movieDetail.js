
/*播放详情页*/

'use strict';

import React from 'react';
import { Image, View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import PropTypes from 'prop-types';
import SlidingUpPanel from 'rn-sliding-up-panel';
import Toast from 'react-native-root-toast';
import TVCacheFlatList from './TVCacheFlatList';
import VarietySelect from './VarietySelect';
import AnimeSelect from './AnimeSelect';
import Recommend from './Recommend';
import SelectEpisodeTab from './SelectEpisodeTab';
import SummaryTab from './SummaryTab';
import { loadStreams } from '../../actions/video';
import * as CacheManager  from '../../common/CacheManager';  // 别删除
import { shareContent, shareAddListener, shareRemoveListener } from '../../common/wxShare';
import { width, pixel, height, isLogout } from "../../common/tool";

const util = require('../../common/Util');
const images = {
    like: require('../imgs/icon_player_like.png'),
    unLike: require('../imgs/icon_player_unlike.png'),
    subscribe: require('../imgs/icon_player_subscribel.png'),
    unSubscribe: require('../imgs/icon_player_unsubscribel.png'),
    cache: require('../imgs/icon_dl_user.png'),
    vodieShareIcon: require('../imgs/icon_movie_share.png'),
};

export class MovieDetail extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            // 控制简介文字展示
            textToggleStatus : false,
            // 控制电视剧选集的展示
            tvToggleStatus : false,
            // 控制电机综艺选集的展示
            varietyStatus: false,
            cacheTVStatus: false,
            cacheMovieStatus: false,
            visible: false,
            subscribe: false,
            // 是否收藏
            isCollection: false,
            // 控制动漫选集的展示
            animeToggleStatus: false,
            //电视剧缓存的清晰度选择
            cacheClarity:0,
            clarityArr:[],
            // 抽屉的容器高度
            visibleHeight: 0
        };
    }
    static propTypes = {
        video: PropTypes.object,
    };
    componentWillMount() {
        const { video } = this.props;

        // 默认显示当前视频是否为收藏状态
        let isCollection = (video && (video.isFav !== undefined) && video.isFav) || false;
        this.setState({isCollection: isCollection});
    }
    componentWillUnmount() {
        shareRemoveListener && shareRemoveListener();
    }
    componentWillReceiveProps(nextProps) {
        if(nextProps.screen){
            this.setState({
                textToggleStatus: false,
                tvToggleStatus: false,
                varietyStatus: false,
                animeToggleStatus: false
            });
        }
    }
    _renderMovieTitleBar(video) {
        return (
            <View style={[styles.titleBar, styles.divider]}>
                <View style={{flex:2.5,overflow:'hidden'}}>
                    <Text style={[styles.title]} numberOfLines={2}>
                        { video && video.title }
                        { Number(video.score) !== 0 ? <Text style={{fontSize:12, color:'#FD9013'}}>（{ video && video.score && video.score.toFixed(1) }分）</Text> :  null }
                    </Text>
                </View>
                <View style={{flex:1,flexDirection:'row'}}>
                    <View style={styles.buttonsPanel}>
                        { this._renderCacheButton(video) }
                        { this._renderCollection(video) }
                        { this._renderShareButton(video) }
                    </View>
                </View>
            </View>
        )
    };
    // 收藏功能
    _renderCollection(video){
        const { isCollection } = this.state;
        const type = (video && video.type) || false;
        const _isLogout = isLogout(this.props);
        const source = !_isLogout ? (isCollection ? images.like : images.unLike) : images.unLike;

        // 如果是小视频就不显示收藏按钮
        if(type === 6){
            return null;
        }

        return (
            <TouchableOpacity
                activeOpacity={0.75}
                style={styles.iconButton}
                onPress={() => this._collect(isCollection, video)}
            >
                <Image source={source} style={styles.favIcon} resizeMode={'contain'}/>
            </TouchableOpacity>
        );
    }
    // 收藏点击事件处理
    _collect(isCollection, video){
        const { addFav, deleteFav, code } = this.props;
        const id = video && video.id;
        const _code = code !== undefined && code;
        const _isLogout = isLogout(this.props);

        // 已登录
        if(!_isLogout){
            // 之前已收藏
            if(isCollection){
                this.setState({isCollection: false});
                Toast.show('收藏取消啦',{ duration: 2000, position: -55 });
                deleteFav(id, _code);
            }
            // 之前未收藏
            else{
                this.setState({isCollection: true});
                Toast.show('收藏成功啦',{ duration: 2000, position: -55 });
                addFav(id, _code);
            }
        }
        // 未登录
        else{
             Toast.show('登录后才可以收藏哦',{ duration: 2000, position: -55 });
        }
    }
    // json字符串处理
    _joinStr(obj){
        let arr = [];
        obj.map((items,index) => arr.push(items.name));
        return (arr.join('    ')) || '';
    }
    // 加缓存
    _addCache(video) {
        let type = video && video !== undefined && video.type;
        const { cacheMovieStatus,cacheTVStatus } = this.state;
        let tempClarityArr = (this.props.clarityArr.length !== 0 &&  this.props.clarityArr) || (this.state.clarityArr !== [] && this.state.clarityArr) || [];

        if(tempClarityArr.length <=0 || tempClarityArr === []){
            // 电影
            let season = 0;
            let D : any = 0;
            if(video && video.playLink) {
                let arr = Object.keys(video.playLink);

                if(video.type === 2 || video.type === 1 || video.type === 5){
                    D = arr[0];
                }
                else if(video.type === 4){
                    D = arr[arr.length-1];
                }
                else{
                    D = 0;
                }
                let episodeValue = video.playLink[video.episode|| D];
                if(episodeValue && episodeValue.season) {
                    season = episodeValue.season;
                }
            }

            loadStreams(video.id, season || 0, video.episode || D, video.src || 0)
                .then((result) => {
                        if (result.code === 0) {
                            let streams = result.data;
                            this.setState({clarityArr:streams});
                            this._cacheTVPage(streams);
                        }
                    },
                    (error) => {
                        Toast.show("下载错误",{ duration: 2000, position: -55 });
                    });
        }else{
            this.setState({clarityArr:tempClarityArr});
            this._cacheTVPage(tempClarityArr);
        }
    }
    // 电视剧 - 综艺 - 动漫 - 缓存页
    _cacheTVPage(){
        const {video} = this.props;
        let clarityArr = this.state.clarityArr;
        //将播放的视频关闭
        this.props.changedPlayer();
        this.props.navigation.navigate('TVCacheFlatList', {video: video, clarityArr: clarityArr,pageSource:false});
    }
    //添加缓存按钮
    _renderCacheButton(video) {
        let showCache = (video.src === 14 || video.src === 1) ? false : true;
        return (
            showCache?
            <TouchableOpacity style={styles.iconButton} onPress={this._addCache.bind(this,video)}>
                <Image source={images.cache} style={styles.cacheIcon} resizeMode={'contain'}/>
            </TouchableOpacity> : null
        );
    }
    // 分享视频
    _shareVideo(video){
        let season = 0;
        let D : any = 0;

        if(video && video.playLink) {
            let arr = Object.keys(video.playLink);

            if(video.type === 2 || video.type === 1 || video.type === 5){
                D = arr[0];
            }
            else if(video.type === 4){
                D = arr[arr.length-1];
            }
            else{
                D = 0;
            }
            let episodeValue = video.playLink[video.episode|| D];

            if(episodeValue && episodeValue.season) {
                season = episodeValue.season;
            }
        }

        let vid = video.id;
        season = season || 0;
        let episode = video.episode || D;
        let platform = video.src || 0;
        let shareTitle = video.title;
        if(video.type === 4){
            shareTitle = shareTitle + " 第"+ episode +"期";
        }else if(video.type === 2){
            shareTitle = shareTitle + " 第"+ episode +"集";
        }

        let param = "platform=" + platform + "&vid=" + vid + "&channel=" + launchSettings.channelID+"&season="+season+"&episode="+episode;
        const shareUrl = (global.launchSettings && global.launchSettings.shareUrl) || 'http://www.xiyunkai.cn';
        let shareLink = shareUrl + "/agoutv/share.html?" + param;
        const text = '超视TV，聚合全网优质资源，一站看遍所有VIP视频。你想要的，这里全有，全免费！';

        shareContent && shareContent('friends',shareTitle,text,video.cover,shareLink);
        // 分享监听
        this._shareListener();
    }
    // 分享监听
    _shareListener(){
        shareRemoveListener && shareRemoveListener();
        shareAddListener && shareAddListener(_ => {
            this.props.addTask && this.props.addTask('share_friend');
            Toast.show('分享成功啦',{ duration: 2000, position: -55 });
        });
    }
    //分享视频按钮
    _renderShareButton(video) {
        let showCache = (video.src === 1) ? false : true;

        return (
            showCache?
            <TouchableOpacity style={styles.iconButton} onPress={this._shareVideo.bind(this,video)}>
                <Image source={images.vodieShareIcon} style={[styles.cacheIcon,{width:15.5}]} resizeMode={'contain'}/>
            </TouchableOpacity> : null
        );
    }
    _newSerialDetail = (superProps) => {
        let type = superProps && (superProps !== undefined) && superProps.video.type;
        let video =superProps && (superProps !== undefined) && superProps.video;
        let statistical = `${util.numHuman(video.totalPlay || 0)}次播放, ${util.numHuman(video.totalFav || 0)}次收藏`;

        return (
            <View>
                <SummaryTab statistical={statistical} toggleText={this._toggleText.bind(this)} screenProps={superProps}/>
                <View>
                    <TouchableOpacity activeOpacity={0.75} onPress={this._switchContent.bind(this,type)} style={styles._detailView}>
                        <Text style={{fontSize:14,fontWeight:'bold', color:'#404040'}}>剧集选择</Text>
                        <View style={{flexDirection:'row',alignItems:'center'}}>
                            <Text style={styles.comText}>{video.latestEpisode !== 0 ? ('更新至') + video.latestEpisode + '集' : '全部剧集'}</Text>
                            <Image source={require('../imgs/arrow_right.png')} resizeMode={'contain'} />
                        </View>
                    </TouchableOpacity>
                    {(type === 2) && <SelectEpisodeTab cleanStream={this._cleanStream.bind(this)} type={'horizontal'} tabLabel='剧集选择' screenProps={superProps}/>}
                    {(type === 4) && <VarietySelect cleanStream={this._cleanStream.bind(this)}  putType={'horizontal'} selectNode={this._selectNode.bind(this)} {...this.props} />}
                    {(type === 5) && <AnimeSelect cleanStream={this._cleanStream.bind(this)} putType={'horizontal'} selectNode={this._selectNode.bind(this)} {...this.props}/> }
                </View>
            </View>
        );
    };
    // 清除视频流 - 并返回episode
    _cleanStream(episode){
        const { cleanStream } = this.props;
        return cleanStream && cleanStream(episode);
    }
    // 对应的内容切换
    _switchContent(type){
        // 电视剧
        if(type === 2) return this._toggleMove();
        // 综艺
        if(type === 4) return this._toggleVariety();
        // 动漫
        if(type === 5) return this._toggleAnime();
    }
    // 综艺 - 动漫 - 单节选择
    _selectNode(item){
        let video = this.props.video;
        let code = this.props.code;
        let episode = item.episode;
        let serialsSrcId = item.serialsSrcId;
        const { playVideo } = this.props;
        playVideo && playVideo(video.id, code, episode, serialsSrcId);
    }
    // 展开切换后对应的内容
    _openToggleContent(type: string = ''){
        const {video} = this.props;
        let summary = String(video.summary ? video.summary.trim() : '暂无相关简介');
        let superProps = this.props;
        // const { textToggleStatus,tvToggleStatus,varietyStatus,animeToggleStatus } = this.state;
        let director = (video && video.character && video.character.director) || [];
        let star = (video && video.character && video.character.star) || [];
        let directorStr = this._joinStr(director);
        let starStr = this._joinStr(star);
        let genre = (video && video.genre) || [];
        let videoType = this._joinStr(genre);
        let zone = (video && video.zone) || [];
        let area = this._joinStr(zone);

        // 简介
        if(type === 'introduction'){
            return (
                <View style={{paddingVertical:15,flex:1}}>
                    <TouchableOpacity style={styles.comStyle} activeOpacity={1} onPress={this._toggleText.bind(this)}>
                        <View style={{flexDirection:'row',alignItems:'center'}}>
                            <Text style={{fontSize:16,fontWeight:'bold', color:'#404040'}}>简介</Text>
                            <Text style={[styles.comText,{marginLeft:15}]}>{util.numHuman(video.totalPlay || 0)}次播放, {util.numHuman(video.totalFav || 0)}次收藏</Text>
                        </View>
                        <Image source={require('../imgs/icon_search_close.png')} resizeMode={'contain'} />
                    </TouchableOpacity>
                    <ScrollView showsVerticalScrollIndicator={false} style={{paddingTop:10,paddingHorizontal:20}}>
                        {area === '' ? null : <Text style={[styles.fieldLabel,{lineHeight:30,marginBottom:5}]}><Text style={{color:'#404040',fontWeight:'bold'}}>区域：</Text>{area}</Text>}
                        {videoType === '' ? null : <Text style={[styles.fieldLabel,{lineHeight:30,marginBottom:5}]}><Text style={{color:'#404040',fontWeight:'bold'}}>类型：</Text>{videoType}</Text>}
                        {directorStr === '' ? null : <Text style={[styles.fieldLabel,{lineHeight:30,marginBottom:5}]}><Text style={{color:'#404040',fontWeight:'bold'}}>导演：</Text>{directorStr}</Text>}
                        {starStr === '' ? null : <Text style={[styles.fieldLabel,{lineHeight:30,marginBottom:5}]}><Text style={{color:'#404040',fontWeight:'bold'}}>主演：</Text>{starStr}</Text>}
                        <Text includeFontPadding={false} style={[styles.fieldLabel,{lineHeight:30}]}><Text style={{color:'#404040',fontWeight:'bold'}}>内容：</Text>{summary}</Text>
                        <View style={{height:30}}/>
                    </ScrollView>
                </View>
            );
        }

        // 电视剧
        if(type === 'tvSeries'){
            return (
                <View style={{paddingTop:15,marginBottom:20}}>
                    <TouchableOpacity style={styles.comStyle} onPress={this._toggleMove.bind(this)} activeOpacity={1}>
                        <Text style={{fontSize:16,fontWeight:'bold', color:'#404040'}}>剧集选择</Text>
                        <Image source={require('../imgs/icon_search_close.png')} resizeMode={'contain'} />
                    </TouchableOpacity>
                    <SelectEpisodeTab cleanStream={this._cleanStream.bind(this)}  type={'vertical'} tabLabel='剧集选择' screenProps={superProps}/>
                </View>
            );
        }

        // 综艺
        if(type === 'variety'){
            return (
                <View style={{paddingTop:15,marginBottom:20}}>
                    <TouchableOpacity style={[styles.comStyle]} onPress={this._toggleVariety.bind(this)} activeOpacity={1}>
                        <Text style={{fontSize:16,fontWeight:'bold', color:'#404040'}}>剧集选择</Text>
                        <Image source={require('../imgs/icon_search_close.png')} resizeMode={'contain'} />
                    </TouchableOpacity>
                    <VarietySelect cleanStream={this._cleanStream.bind(this)}  putType={'vertical'} selectNode={this._selectNode.bind(this)} {...this.props} />
                </View>
            );
        }

        // 动漫
        if(type === 'animate'){
            return (
                <View style={{paddingTop:15, marginBottom:20}}>
                    <TouchableOpacity style={[styles.comStyle]} onPress={this._toggleAnime.bind(this)} activeOpacity={1}>
                        <Text style={{fontSize:16,fontWeight:'bold', color:'#404040'}}>剧集选择</Text>
                        <Image source={require('../imgs/icon_search_close.png')} resizeMode={'contain'} />
                    </TouchableOpacity>
                    <AnimeSelect cleanStream={this._cleanStream.bind(this)} putType={'vertical'} selectNode={this._selectNode.bind(this)} {...this.props}/>
                </View>
            );
        }
    }
    // 综艺展开与收缩切换
    _toggleVariety(){
        const { varietyStatus } = this.state;
        this.setState({varietyStatus: !varietyStatus});
    }
    // 剧集选择展开与收缩切换
    _toggleMove(){
        const { tvToggleStatus } = this.state;
        this.setState({tvToggleStatus: !tvToggleStatus});
    }
    // 动漫展开与收缩切换
    _toggleAnime(){
        const { animeToggleStatus } = this.state;
        this.setState({animeToggleStatus: !animeToggleStatus});
    }
    // 简介展开与收缩切换
    _toggleText(){
        const { textToggleStatus } = this.state;
        this.setState({textToggleStatus: !textToggleStatus});
    }
    // 为你推荐执行 - 回调
    recommendCallBack(code){
        this.props.recommendCallBack(code);
    }
    // 为你推荐执行 - 相关操作
    reducingState(){
        this.setState({
            // 控制简介文字展示
            textToggleStatus : false,
            // 控制电视剧选集的展示
            tvToggleStatus : false,
            // 控制电机综艺选集的展示
            varietyStatus: false,
            cacheTVStatus: false,
            cacheMovieStatus: false,
            visible: false,
            subscribe: false,
            // 是否收藏
            isCollection: false,
            // 控制动漫选集的展示
            animeToggleStatus: false
        });
    }
    // 公共的滑动方法
    _slideDownToUpPanel(state: ?boolean = false, type: string, callback?: Function => void){
        const { screen } = this.props;

        return (
            !screen ?
            <SlidingUpPanel
                height={height - 200}
                allowMomentum={false}
                allowDragging={false}
                visible={state}
                showBackdrop={false}
                onRequestClose={() => callback && callback()}
            >
                <View style={[styles.slideUpPanel]}>
                    { this._openToggleContent(type) }
                </View>
            </SlidingUpPanel> : null
        );
    }
    render() {
        // 影视数据
        const video = this.props.video;
        // 错误
        const error = video && video.error;
        // 影视类型
        const _type = video && video.type;
        // 详情的头部 - demo
        const movieTitleBar = this._renderMovieTitleBar(video);
        // 状态
        const { textToggleStatus, tvToggleStatus, varietyStatus, animeToggleStatus } = this.state;
        // 剧集选择 - demo
        const newRenderObj = this._newSerialDetail(this.props);
        // 播放次数 - 收藏次数
        const statistical=`${util.numHuman(video.totalPlay || 0)}次播放, ${util.numHuman(video.totalFav || 0)}次收藏`;
        // 为你推荐 - demo
        const recommendToYou = (<Recommend reducingState={this.reducingState.bind(this)} recommendCallBack={this.recommendCallBack.bind(this)} {...this.props}/>);
        // 电影简介 - demo
        const movieIntroduction = (<SummaryTab statistical={statistical} toggleText={this._toggleText.bind(this)} screenProps={this.props}/>);
        const promptBox = {flex:1,justifyContent:'center',alignItems:'center'}, promptText = {fontSize:16, color:'#404040'};

        // 服务器出错
        // if(parseInt(error ? error.code : 0) === 500){
        //     return (
        //         <View style={promptBox}>
        //             <Text style={promptText}>服务器出错啦</Text>
        //         </View>
        //     );
        // }

        // 加载中
        if(!_type){
            return (
                <View style={styles.loading}>
                    <ActivityIndicator color={'rgb(0,117,248)'} size={'small'}/>
                </View>
            );
        }

        return (
            <View style={styles.container}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    style={{flex: 1}}
                >
                    { movieTitleBar }
                    { (_type === 2 || _type === 4 || _type === 5) ? newRenderObj : movieIntroduction }
                    { recommendToYou }
                </ScrollView>
                { this._slideDownToUpPanel(textToggleStatus,'introduction',() => this._toggleText()) }
                { _type === 2 && this._slideDownToUpPanel(tvToggleStatus,'tvSeries',() => this._toggleMove()) }
                { _type === 4 && this._slideDownToUpPanel(varietyStatus,'variety',() => this._toggleVariety()) }
                { _type === 5 && this._slideDownToUpPanel(animeToggleStatus,'animate',() => this._toggleAnime()) }
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        position:'relative'
    },
    slideUpPanel:{
        flex:1,
        backgroundColor:'#fff'
    },
    comText:{
        fontSize:12,
        color:'#cccccc',
        marginRight:10
    },
    titleBox:{
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        paddingBottom:10
    },
    titleBoxText:{
        fontSize:14,
        fontWeight:'bold',
        color:'#404040'
    },
    loading:{
        flex:1,
        justifyContent:'center',
        alignItems:'center'
    },
    _detailView:{
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        paddingBottom:10,
        marginHorizontal:20,
        paddingTop:20
    },
    modalRowText:{
        fontSize:15,
        color:'rgb(0,117,248)'
    },
    modalRow:{
        height:50,
        justifyContent:'center',
        alignItems:'center',
        borderBottomColor:'#dcdcdc'
    },
    modalContent:{
        flex:1,
        position:'absolute',
        top:0,
        left:0,
        bottom:0,
        right:0,
        backgroundColor:'rgba(0,0,0,0.5)',
        zIndex:999,
        flexDirection:'column',
        justifyContent:'flex-end'
    },
    selectQXD:{
        fontSize:14,
        color:'rgb(0,117,248)',
        marginLeft:30
    },
    closeHcSelect:{
        width:100,
        height:52,
        right:0,
        top:0,
        position:'absolute',
        zIndex:100,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'flex-end',
        paddingRight:15,
    },
    cacheCs:{
        flex:1,
        flexDirection:'row',
        justifyContent:'center',
        height:30,
        alignItems:'center',
        borderRightColor:'#dcdcdc'
    },
    cacheInnerButs:{
        flex:1,
        flexDirection:'row',
        alignItems:'center',
        height:50
    },
    gqSelect:{
        height:60,
        flexDirection:'row',
        alignItems:"center",
        justifyContent:'center',
        width:width-40
    },
    gqSelectText:{
        fontSize:15,
        color:'#404040'
    },
    comStyle: {
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        paddingHorizontal: 20,
        paddingBottom:15,
        borderBottomWidth:1/pixel,
        borderBottomColor:'#dcdcdc'
    },
    background: {
        flex: 1,
    },
    titleBar: {
        paddingLeft:20,
        paddingRight:10,
        flexDirection:'row',
        alignItems:'center'
    },
    divider: {
        borderBottomColor: '#dcdcdc',
        borderBottomWidth: 1/pixel,
        height:52,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#404040',
    },
    summaryRow: {
        marginTop: 20,
        marginLeft: 20,
        marginRight: 20,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    buttonPanel: {
        flexDirection: 'row',
        height: 30,
    },
    iconButton: {
        height: 60,
        justifyContent:'center',
        paddingLeft:10,
        paddingRight:10
    },
    subScribeIcon: {
        width: 16,
        height: 20,
        resizeMode:'contain'
    },
    favIcon: {
        width: 16,
        height: 20,
        resizeMode:'contain'
    },
    cacheIcon: {
        width: 14.5,
        height: 20,
        resizeMode:'contain'
    },
    statsPanel: {
        flexDirection: 'row',
        flex: 1,
        alignItems: 'flex-end',
    },
    statsText: {
        fontSize: 10,
        color: '#404040',
    },
    buttonsPanel: {
        flexDirection: 'row',
        flex: 1,
        height:60,
        alignItems:'center',
        justifyContent: 'flex-end',
    },
    cacheButs:{
        borderTopWidth:1/pixel,
        borderTopColor:'#dcdcdc',
        height:50,
        marginHorizontal:10,
        position:'absolute',
        left:0,
        bottom:0,
        overflow:'hidden',
        zIndex:666,
        width:width-20,
        backgroundColor:"#fff"
    },
    cacheButsText:{
        fontSize:15,
        color:'#404040'
    }
});
