
// 热点首页

'use strict';

import React,{ Component } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Image,
    Share,
    FlatList,
    ImageBackground,
    RefreshControl,
    StatusBar,
    ActivityIndicator
} from 'react-native';
import { withNavigationFocus } from 'react-navigation-is-focused-hoc';
import KeepAwake from 'react-native-keep-awake';
import Toast from 'react-native-root-toast';
import _ from 'lodash';
import TabBarIcon from '../../common/TabBarIcon';
import { width, pixel, numberConversion, checkNetworkState, netInfoAddEventListener, getCurrentNetInfo } from "../../common/tool";
import { shortVideoNav } from '../../Constants';
import * as api from "../../middlewares/api";
import FooterLoadActivityIndicator from '../Common/FooterLoadActivityIndicator';
import CSVideoPlayer from '../../common/CSVideoPlayer';
import { shareContent } from "../../common/wxShare";

const playerImage = require('../../common/img/icon_play_circle.png');
const defaultIcon = require('../imgs/hot_point_unsel.png');
const activeIcon = require('../imgs/hot_point_sel.png');
const vodieShareIcon = require('../imgs/icon_video_share.png');
const ITEM_HEIGHT  = 244;

class FoundIndex extends Component{
    static navigationOptions = {
        tabBarIcon: ({focused}) => (<TabBarIcon focused={focused} defaultIcon={defaultIcon} activeIcon={activeIcon}/>),
        tabBarLabel: '热点',
        header: null,
    };
    constructor(props){
        super(props);
        this.state = {
            // 数据
            hotVideo: [],
            // 导航状态初始值
            navStartValue: 0,
            // 是否加载更多
            isLoadMore: false,
            // 当前的item
            currentItem: null,
            // 是否刷新
            refreshing: false,
            // 视频总状态数组管理
            videoStatusArr: [],
            // 视频当前索引
            videoIndex: null,
            // 视频流
            mp4Url: null,
            networkStatus: true,
            // 网络类型
            networkType: 'wifi',
            // 网络类型值
            effectiveType: '',
            // 变化的数据总数
            changeNums: 99
        };
        // 导航栏的总宽度
        this.menuWidthSum = 0;
        // 导航栏的宽数组
        this.menuWidthArr = [];
        // 本地缓存
        this.cacheReults = {
            nextPage: 0, // 页码
            total: 0,    // 总记录
            items: []    // 缓存数据
        };
        this.viewabilityConfig = {
            waitForInteraction: true,
            viewAreaCoveragePercentThreshold: 10
        };
        // 假设为99条数据 - 这个可以更改 - 临时处理
        this.nums = 99;
    }
    componentWillMount() {
        // 初始加载西瓜视频数据
        this._initialShowData();
    }
    componentWillUnmount() {
        // 清除网络监听
        this.netInfoListener && this.netInfoListener.remove();
    }
    componentWillReceiveProps(nextProps) {
        const { navigation } = this.props;
        // 进入本组件的一些处理
        if (!this.props.isFocused && nextProps.isFocused) {
            let navStartValue : number = 0;
            let type : string = 'xigua';

            // 首先清空视频播放的当前ID - 清空视频流
            this.setState({videoIndex: null, mp4Url: null});
            // 路由传过来的值做处理
            if(navigation.state.params && navigation.state.params.navStartValue){
                navStartValue = navigation.state.params.navStartValue;
                type = navigation.state.params.type;
            }

            // 梨视频数据
            if(type === 'pear' && navStartValue !== 0){
                let item = shortVideoNav[navStartValue];
                this.setState({navStartValue: navStartValue, refreshing: true});
                this._menuAutoScroll(item,navStartValue);
                this._dataShow(item,0);
            }
            // 西瓜视频数据
            if(type === 'xigua' && navStartValue === 0){
                const { hotVideo } = this.state;
                let item = shortVideoNav[navStartValue];

                if((Object.keys(hotVideo)).length === 0){
                    this.setState({navStartValue: navStartValue, refreshing: true});
                    this._menuAutoScroll(item,navStartValue);
                    this._initialShowData();
                }
            }

            // 检测网络
            this._checkNetwork();
            // 打开本组件时 - 检测网络类型
            this._networkType();
            // 网络监听
            this.netInfoListener = netInfoAddEventListener('connectionChange',this.networkHandler.bind(this));
            // 状态栏设置为白底黑字
            this.handleClose();
        }
        // 离开本组件的一些处理
        if (this.props.isFocused && !nextProps.isFocused) {
            this.setState({videoIndex: null, mp4Url: null, refreshing: false});
            // 清除网络监听
            this.netInfoListener && this.netInfoListener.remove();
            // 让进来的type情空
            navigation.setParams({type: false});
        }
    }
    // 网络类型检测
    _networkType(){
        getCurrentNetInfo(res => {
            this.setState({networkType: res.type, effectiveType: res.effectiveType});
        });
    }
    // 检测是否有可用网络
    _checkNetwork(){
        checkNetworkState(status => {
            this.setState({networkStatus: status});
        });
    }
    // 网络监听对应的方法
    networkHandler(status){
        const { navStartValue } = this.state;
        let item = shortVideoNav[navStartValue];

        this.setState({networkStatus: status});
        if(status){
            // 西瓜数据
            this._initialShowData();
            // 梨视频数据
            this._dataShow(item,0);
            this._networkType();
        }
    }
    // 去分享
    _share(obj,index){
        let hexId = obj.hexId;
        const { currentItem } = this.state;
        let item = (currentItem !== null && currentItem) || shortVideoNav[0];
        let platform = 0;

        // 西瓜视频
        if(item.type === 'xigua'){
            platform = 100;
        }
        // 梨视频
        if(item.type === 'pear'){
            platform = 200;
        }

        let param = "platform=" + platform + "&vid=" + hexId + "&channel=" + launchSettings.channelID;
        const shareDomain = (global.launchSettings && global.launchSettings.shareUrl) || 'http://www.xiyunkai.cn';
        let shareUrl = shareDomain + "/agoutv/share.html?" + param;

        shareContent('friends',obj.title,'超视TV，聚合全网优质资源，一站看遍所有VIP视频。你想要的，这里全有，全免费！',obj.cover,shareUrl);
    }
    // 去播放
    async _play(obj,index){
        let hexId = obj.hexId;
        const { currentItem } = this.state;
        let item = (currentItem !== null && currentItem) || shortVideoNav[0];

        // 西瓜视频
        if(item.type === 'xigua'){
            let xgRes = await api.xiguaStream(hexId);
            let mp4Url = this._videoData(xgRes);
            this.setState({videoIndex: index, mp4Url: mp4Url});
        }

        // 梨视频
        if(item.type === 'pear'){
            let pearRes = await api.pearStream(hexId);
            let mp4Url = this._videoData(pearRes);
            this.setState({videoIndex: index, mp4Url: mp4Url});
        }

        // 让视频在可视区域中间位置播放
        this.refs['flatListRef'] && this.refs['flatListRef'].scrollToIndex({animated:true,index:index,viewOffset:0,viewPosition:0.5});
        // 检测网络
        this._checkNetwork();
        // 检测网络类型
        this._networkType();
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
    // 菜单自动滚动
    _menuAutoScroll(item,index){
        // 设置当前菜单的索引值
        this.setState({navStartValue: item.id});
        // 取到菜单数组
        let menuWidthArr = this.menuWidthArr;
        // 滚动的距离-初始值设置为0
        let scrollDistance = 0;
        // 获得屏幕宽度
        let screenWidth = width;
        // 获取导航栏的总宽度
        let navAllWidth = this.menuWidthSum;
        // 获取的当前被选中菜单的宽度
        let menuWidth = menuWidthArr[index];
        // 对比的差值
        let difference = (screenWidth - menuWidth) / 2;
        // 当前菜单的左位移
        let curMenuLetPosition = this._curMenuLetPosition(menuWidthArr, index);

        // - 菜单执行自动滚动时的核心算法 -
        if (curMenuLetPosition <= difference) {scrollDistance = 0}
        else if (difference - curMenuLetPosition <= screenWidth - navAllWidth) {scrollDistance = screenWidth - navAllWidth}
        else {scrollDistance = difference - curMenuLetPosition}

        // 菜单执行自动滚动动画
        this.scrollViewRef.scrollTo({x: (-scrollDistance), y: 0, animated: true});
        // 当菜单开始切换时暂停所有播放 - 并且清空视频播放流
        this.setState({videoIndex: null, mp4Url: null});

        // 把缓存清空 - 以及其他操作处理
        this.cacheReults.items = [];
        this.cacheReults.nextPage = 0;
        this.cacheReults.total = 0;
        this.setState({isLoadMore: false, currentItem: item});

        // 让视频回到滚动原点
        this.refs['flatListRef'] && this.refs['flatListRef'].scrollToOffset({animated: false, offset: 0});
    }
    async _cateMenu({item,index}) {
        const { navigation } = this.props;

        navigation.setParams({navStartValue: index});

        // 点击切换时启动刷新动画 - 已经还原总变化数
        this.setState({refreshing: true, changeNums: 99});
        // 执行相关的动画
        this._menuAutoScroll(item,index);
        // 拿到菜单对应的数据 - 梨视频
        item.type === 'pear' && this._dataShow(item,0);
        // 拿到菜单对应的数据 - 西瓜
        item.type === 'xigua' && this._initialShowData();
    }
    // 页面活动数据 - 梨视频
    async _dataShow(item,page){
        let selectedItems = shortVideoNav.filter(current => current.id === item.id);
        let pearResult = await api.shortVideoFromPear(selectedItems[0].categoryUrl + page*10);
        const { refreshing } = this.state;

        if (selectedItems && selectedItems.length > 0) {
            if (pearResult && pearResult.code === 0) {
                // 数据处理
                let items = this.cacheReults.items.slice();
                items = items.concat(pearResult.data);
                // 去重
                let newItems = _.uniqWith(items, _.isEqual);

                if(refreshing && newItems.length !== 0){
                    this._prompt(newItems.length);
                }

                this.cacheReults.items = newItems;
                this.cacheReults.nextPage += 1;
                this.cacheReults.total = this.nums;
                this.setState({hotVideo: newItems, isLoadMore: false, refreshing: false});

                // 梨视频管理状态数组
                let pearStatusArr = Object.keys(newItems);
                this.setState({videoStatusArr: pearStatusArr});
            }
            else{
                this.setState({hotVideo: [], refreshing: false, isLoadMore: false});
            }
        }
    }
    // 提示
    _prompt(length: number){
        Toast.show('更新了'+ length +'条短视频',{
            position: 44,
            backgroundColor: 'rgb(0,117,248)',
            textColor:'#FFF',
            duration: 1500
        });
    }
    // 页面活动数据 - 西瓜视频
    async _initialShowData(){
        let xiguaResult = await api.hotShortVideoFromXigua();
        const { refreshing } = this.state;

        if(xiguaResult && xiguaResult.code === 0){
            let items = this.cacheReults.items.slice();
            items = items.concat(xiguaResult.data);
            // 去重
            let newItems = _.uniqWith(items, _.isEqual);

            this.cacheReults.items = newItems;
            if(refreshing && newItems.length !== 0){
                this._prompt(newItems.length);
            }
            this.setState({hotVideo: newItems, isLoadMore: false, refreshing: false});

            // 添加西瓜视频管理状态数组
            let xiguaStatusArr = Object.keys(newItems);
            this.setState({videoStatusArr: xiguaStatusArr});
        }
        else{
            this.setState({hotVideo: [], isLoadMore: false, refreshing: false});
        }
    }
    // 当前菜单的位置计算
    _curMenuLetPosition(arr,value){
        let sums = 0;
        arr.reduce((prev,cur,i) => {
            if(i === 0){sums = 0}
            if(i < value){sums += cur}
        },0);
        return sums;
    }
    // 菜单的总长度
    _onMenuLayout(e,item){
        let menuWidth = e.nativeEvent.layout.width;
        this.menuWidthSum += menuWidth;
        this.menuWidthArr.push(menuWidth);
    }
    // 头部菜单栏
    renderHeaderMenu(){
        const {navStartValue} = this.state;

        return (
            <View style={[styles.cateNav,]}>
                <ScrollView
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    style={{flex:1,position:'relative'}}
                    ref={ref => this.scrollViewRef = ref}
                >
                    {
                        shortVideoNav.map((item,index) => {
                            let color = navStartValue === item.id ? 'rgb(0,117,248)' : 'rgb(172,172,192)';
                            let borderBottomColor = navStartValue === item.id ? 'rgb(0,117,248)' : 'transparent';
                            return (
                                <TouchableOpacity key={index} onPress={this._cateMenu.bind(this,{item,index})} activeOpacity={0.50}>
                                    <View onLayout={(e) => this._onMenuLayout(e,item)} style={[styles.cateNavItem,{borderBottomColor:borderBottomColor}]}>
                                        <Text style={[styles.cateNavItemText,{color:color}]}>{item.name}</Text>
                                    </View>
                                </TouchableOpacity>
                            )
                        })
                    }
                </ScrollView>
            </View>
        );
    }
    // 播放结束
    _onEnd(){
        const { videoIndex, hotVideo } = this.state;
        let index = videoIndex + 1;
        let item = hotVideo[index];

        this._play(item,index);
        this.refs['flatListRef'] && this.refs['flatListRef'].scrollToIndex({animated:true,index:index,viewOffset:0,viewPosition:0.5});
    }
    // 播放暂停
    _onPause(currentPlayTime){

    }
    // 开始播放
    _onPlay(){
        // 让播放视频保存不自动息屏状态
        KeepAwake.activate();
        // 检测网络
        this._checkNetwork();
    }
    // 列表渲染
    _renderItem({item, index}){
        let title = item.title,
            cover = item.cover,
            watchCount = item.watchCount;
        const { videoStatusArr, videoIndex, mp4Url, networkStatus, networkType, effectiveType } = this.state;
        let _videoStatusArr = videoStatusArr.length !== 0 && videoStatusArr;

        return (
            <View key={index} style={styles.foundRows}>
                <ImageBackground source={{uri:cover}} imageStyle={{resizeMode:'cover'}} style={styles.foundRowsHeader}>
                    {
                        !networkStatus ?
                        <ImageBackground source={styles.foundRowsBfImg} imageStyle={{resizeMode:'cover'}} style={styles.checkContainer}>
                            <Text style={styles.checkCText}>当前网络不可用，请稍后再试！</Text>
                        </ImageBackground> :
                        (videoIndex === Number(_videoStatusArr[index]) ?
                            (
                                networkType !== 'cellular' ?
                                <CSVideoPlayer
                                    showOnStart={true}
                                    isTopControl={false}
                                    topTitle={true}
                                    topTitleNumberOfLines={2}
                                    title={title}
                                    source={{uri: mp4Url}}
                                    shortVideoPlayer={true}
                                    resizeMode={'contain'}
                                    middlePlayBtnDisplay={true}
                                    onPlay={this._onPlay.bind(this)}
                                    onPause={this._onPause.bind(this)}
                                    onEnd={this._onEnd.bind(this)}
                                    longShowControls={true}
                                    showBottomProgress={'show'}
                                /> :
                                <View style={styles.videoCellularInnerBox}>
                                    <View style={styles.vciRows}>
                                        <Text style={styles.vicRowsText}>已检测到当前网络为{effectiveType.toUpperCase()}</Text>
                                    </View>
                                    <View style={[styles.vciRows,{marginTop:20}]}>
                                        <TouchableOpacity activeOpacity={0.75} onPress={this._playImmediately.bind(this)} style={[styles.vciRowsBtn,{marginRight:20}]}>
                                            <Text style={styles.vciRowsBtnText}>立即播放</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity activeOpacity={0.75} onPress={this._laterPlay.bind(this)} style={[styles.vciRowsBtn,{backgroundColor:'#dcdcdc'}]}>
                                            <Text style={styles.vciRowsBtnText}>稍后播放</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ) :
                            <TouchableOpacity activeOpacity={1} onPress={() => this._play(item,index)} style={styles.foundRowsBf}>
                                <ImageBackground source={require('../imgs/screen_gradient_top.png')} imageStyle={{resizeMode:'stretch'}} style={styles.foundRowsTitle}>
                                    <Text style={styles.foundRowsTitleText}>{ title }</Text>
                                </ImageBackground>
                                <Image resizeMode={'contain'} style={styles.foundRowsBfImg} source={playerImage}/>
                            </TouchableOpacity>
                        )
                    }
                </ImageBackground>
                <View style={styles.foundRowsFooter}>
                    <View style={styles.foundRowsNums}><Text style={styles.foundRowsNumsText}>{numberConversion(watchCount)}次播放</Text></View>
                    <TouchableOpacity activeOpacity={1} onPress={() => this._share(item,index)} style={styles.foundRowsXz}>
                        <Image style={styles.foundRowsImg} resizeMode={'contain'} source={vodieShareIcon}/>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
    // 4g网络下立即播放
    _playImmediately(){
        this.setState({networkType: 'other'});
    }
    // 稍后播放
    _laterPlay(){
        this.setState({videoIndex: null, mp4Url: null});
    }
    // 列表底部栏
    _listFooterComponent(){
        const { currentItem } = this.state;
        let item = (currentItem !== null && currentItem) || shortVideoNav[0];
        let noDataPrompt = (<View style={styles.footerComponent}><Text style={styles.footerComponentText}>没有更多数据了哦</Text></View>);

        // 如果是 - 梨视频
        if(item.type === 'pear'){
            if(this.cacheReults.items.length === this.cacheReults.total && this.cacheReults.total !== 0){
                return noDataPrompt;
            }
        }

        if(!this.state.isLoadMore){ return null }
        return (<FooterLoadActivityIndicator loadText={'更多视频加载中...'} type={'horizontal'} style={styles.footerComponent}/>);
    }
    // 上拉时获取到数据
    _fetchMoreData() {
        const {currentItem, networkStatus} = this.state;
        let item = (currentItem !== null && currentItem) || shortVideoNav[0];

        if(networkStatus){
            this.setState({isLoadMore: true});

            // 西瓜视频
            if (item.type === 'xigua') {
                this._initialShowData();
            }

            // 梨视频
            if (item.type === 'pear') {
                if (this.cacheReults.items.length === this.cacheReults.total || this.state.isLoadMore) {
                    return
                }

                let page = this.cacheReults.nextPage;
                this._dataShow(item, page);
            }
        }
    }
    // 刷新
    _refresh(){
        const { currentItem, networkStatus, changeNums } = this.state;
        let item = (currentItem !== null && currentItem) || shortVideoNav[0];

        if(changeNums === 0){
            this.setState({changeNums: this.nums});
        }
        else{
            this.setState({changeNums: changeNums - 1});
        }

        // 在有网络情况下
        if(networkStatus){
            this.setState({refreshing: true});
            this.cacheReults.items = [];
            this.cacheReults.total = 0;
            this.cacheReults.nextPage = 0;

            // 西瓜视频
            if(item.type === 'xigua'){
                this._initialShowData();
            }
            // 梨视频
            if(item.type === 'pear'){
                this._dataShow(item,changeNums);
            }

            // 当刷新时暂停所有当前播放并还原封面
            this.setState({videoIndex: null});
        }
    }
    // 滚动播放视频处理 - 若不在可视区间内 - 暂停当前播放并清空当前视频流
    _onViewableItemsChanged = (info) => {
        const { videoIndex } = this.state;
        let CHANGED = (info && info.changed) || false;

        if(CHANGED){
            CHANGED.map((o,i) => {
                if(o.index === videoIndex && !o.isViewable){
                    this.setState({videoIndex: null, mp4Url: null});
                }
            });
            return;
        }

        return null;
    };
    // 头部提示窗口关闭后调用
    handleClose(data) {
        StatusBar.setBackgroundColor('#FFFFFF',true);
        StatusBar.setBarStyle('dark-content',true);
    }
    // 长亮 - dmeo
    renderKeepAwake(){
        return (<KeepAwake/>);
    }
    // 列表数据 - demo
    renderList(){
        const { hotVideo, refreshing } = this.state;
        let dataArr = ((hotVideo.length !==0) && hotVideo) || [];

        return (
            dataArr.length !== 0 ?
            <FlatList
                data={dataArr}
                numColumns={1}
                horizontal={false}
                ref={'flatListRef'}
                renderItem={this._renderItem.bind(this)}
                keyExtractor={(item,index) => index}
                enableEmptySections={true}
                showsVerticalScrollIndicator={false}
                legacyImplementation={false}
                ListFooterComponent={this._listFooterComponent.bind(this)}
                onEndReached={this._fetchMoreData.bind(this)}
                onEndReachedThreshold={0.1}
                initialNumToRender={6}
                onViewableItemsChanged={this._onViewableItemsChanged}
                //getItemLayout={(data, index) => ({length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index})}
                viewabilityConfig={this.viewabilityConfig}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={this._refresh.bind(this)}
                        tintColor='rgb(0,117,248)'
                        colors={['rgb(0,117,248)']}
                    />
                }
            /> :
            <View style={styles.loadBox}>
                <ActivityIndicator size={'small'} color={'rgb(0,117,248)'}/>
            </View>
        );
    }
    render(){
        return (
            <View style={styles.content}>
                { this.renderHeaderMenu() }
                { this.renderList() }
                { this.renderKeepAwake() }
            </View>
        );
    }
}

export default withNavigationFocus(FoundIndex);

const styles = StyleSheet.create({
    loadBoxText:{
        fontSize: 16,
        color:'rgb(193,193,193)'
    },
    loadBox:{
        flex:1,
        justifyContent:'center',
        alignItems:'center'
    },
    vciRows:{
        flexDirection:'row',
        justifyContent:'center'
    },
    vicRowsText:{
        fontSize: 16,
        color:'#ffffff'
    },
    vciRowsBtn:{
        backgroundColor:'rgb(0,117,248)',
        height: 30,
        justifyContent:'center',
        alignItems:'center',
        width: 100,
        borderRadius: 30,
        overflow:'hidden'
    },
    vciRowsBtnText:{
        color: '#fff',
        fontSize: 14,
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
        backgroundColor:'rgba(0,0,0,0.4)',
        zIndex:99999,
        justifyContent: 'center',
        alignItems: 'center'
    },
    checkCText:{
        fontSize: 15,
        color: '#ffffff',
    },
    footerComponent:{
        height:50,
        justifyContent:'center',
        alignItems:'center',
    },
    footerComponentText:{
        fontSize: 14,
        color: '#999999'
    },
    cateNavLine:{
        position:'absolute',
        bottom:0,
        height:2,
        zIndex:1,
        backgroundColor:'rgb(0,117,248)'
    },
    cateNavItem:{
        height:44,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        paddingHorizontal:15,
        borderBottomWidth:3,
    },
    cateNavItemText:{
        fontSize:14,
        color:'rgb(172,172,192)'
    },
    cateNav:{
        borderBottomWidth:1/pixel,
        borderBottomColor:'#dcdcdc',
        height:44,
        flexDirection:'row',
        position:'relative'
    },
    backgroundVideo: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
    foundRowsTitle:{
        width:width,
        position:'absolute',
        left:0,
        top:0,
        padding:10,
        overflow:'hidden'
    },
    foundRowsTitleText:{
        fontSize:15,
        color:'#FFFFFF'
    },
    foundRowsBfImg:{
        height:40,
        width:40,
    },
    foundRowsImg:{
        height:16,
    },
    foundRowsXz:{
        height:44,
        width:100,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:"flex-end"
    },
    foundRowsNums:{
        height:44,
        flexDirection:'row',
        alignItems:'center',
        flex:1
    },
    foundRowsNumsText:{
        fontSize:12,
        color:'rgb(175,175,192)'
    },
    content:{
        flex:1,
        backgroundColor:'#ffffff'
    },
    foundRows:{
        minHeight:200,
        flexDirection:'column',
        overflow:'hidden'
    },
    foundRowsHeader:{
        height:200,
        position:'relative',
        backgroundColor:'#000000',
    },
    foundRowsBf:{
        position:'absolute',
        left:0,
        top:0,
        bottom:0,
        right:0,
        zIndex:600,
        justifyContent:'center',
        alignItems:'center',
    },
    foundRowsFooter:{
        height:44,
        backgroundColor:'#ffffff',
        flexDirection:'row',
        paddingHorizontal:10
    }
});

































