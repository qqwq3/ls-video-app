
/*首页*/

'use strict';

import React, { Component } from 'react';
import {
    View, Text,
    StyleSheet, Image,
    FlatList, TouchableOpacity,
    ActivityIndicator, ImageBackground,
    BackHandler, Platform,
    Alert
} from 'react-native'
import PropTypes from 'prop-types';
import _ from 'lodash';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import Carousel from 'react-native-banner-carousel';
import ProgressCircle from 'react-native-progress-circle';
import AppMetadata from 'react-native-app-metadata';
import CodePush from "react-native-code-push";
import AppUpdate from 'react-native-appupdate';
import clear from 'react-native-clear-cache';
import ImageLoad from 'react-native-image-placeholder';
import { withNavigationFocus } from 'react-navigation-is-focused-hoc';
import XingrenFlatList from '../../components/XingrenFlatList';
import { MovieCellInList } from '../Movie/movieCellInList';
import { loadBanners, loadHots, loadNavs, showActivity } from '../../actions/main';
import { RefreshState, catNav, VERSION, CHANNEL_KEY, DEPLOYMENT_KEYS } from "../../Constants";
import TabBarIcon from '../../common/TabBarIcon';
import { width, playText, statusBarSetPublic, isLogout } from '../../common/tool'
import { reLoadWithFilters, loadCategoryList } from '../../actions/explore';
import { loginCheck } from '../../actions/user';
import FooterPrompt from '../Common/FooterPrompt';
import CommonHeader from '../Common/CommonHeader';
import HostPot from './HostPot';
import SectionItem from './SectionItem';
import Dialog from '../Common/Dialog';
import * as api from '../../middlewares/api';
import SpreadInstance from '../../common/SpreadInstance';
import { saveCurrentVersion, loadCurrentVersion } from "../../common/Storage";
import ActivityTemplate from '../Common/ActivityTemplate';

class Home extends Component {
    static navigationOptions = {
        tabBarIcon: ({focused}) => (
            <TabBarIcon
                focused={focused}
                defaultIcon={require('../imgs/home_unsel.png')}
                activeIcon={require('../imgs/home_sel.png')}
            />
        ),
        tabBarLabel: '主页',
        header: null
    };
    static propTypes = {
        banner: PropTypes.arrayOf(PropTypes.object),
        hot: PropTypes.arrayOf(PropTypes.object),
        nav: PropTypes.arrayOf(PropTypes.object),
        refreshState: PropTypes.number.isRequired,
        page: PropTypes.number.isRequired,
        updateTime: PropTypes.number
    };
    static defaultProps = {
        banner: [],
        hot: [],
        nav: [],
        refreshState: RefreshState.Idle,
        page: 1
    };
    constructor(props) {
        super(props);
        this.state = {
            bannerIndex: 0,
            showProgressCircle: false,
            popHeightUpdate: 160,
            buttonRightText: '立即升级',
            // 下载进度
            downloadProgress: 0,
            needUpdate: null,
            buttons: 2,
            versionText: '亲，已检测到有最新版本！',
            tipText:'',
            randomImage: 0,
        };
    }
    componentWillMount(){
        // 初始化参数
        // this.initialize();

        //const { loginCheck } = this.props;
        //!global.launchSettings.isLogin && loginCheck && loginCheck(global.launchSettings.isLogin);

        // 设备返回键监听
        this._addEventListenerBackHandler();
        // 临时初始化数据
        this.onHeaderRefresh(RefreshState.HeaderRefreshing);
        // 还原首页活动弹出层状态
        this.props.showActivity && this.props.showActivity(false);

        // 加载随机活动图
        const randomImage = this._randomActivityImage();
        this.setState({randomImage: randomImage});
    }
    componentDidMount() {
        // 保存当前app版本在本地
        saveCurrentVersion && saveCurrentVersion(VERSION);
        // 加载搜索列表菜单
        this.props.loadCategoryList && this.props.loadCategoryList();
        // 加载活动模板
        this._activity();
    }
    componentWillReceiveProps(nextProps) {
        // 进入本组件的一些处理
        if (!this.props.isFocused && nextProps.isFocused) {
            // 状态栏设置为白底黑字
            this.handleClose();
            // 加载活动模板
            !nextProps.isActivity && this._activity();
        }
        // 离开本组件的一些处理
        if (this.props.isFocused && !nextProps.isFocused) {
            // 清除设备返回键监听
            // this._removeEventListenerBackHandler();
        }
    }
    componentWillUnmount() {
        // 清除设备返回键监听
        this._removeEventListenerBackHandler();
    }
    // 打开活动弹出层
    _activity(){
        this.activityRef && this.activityRef.show();
    }
    // 读取包升级主要信息
    async loadmain(){
        let apiHosts = await api.loadHosts();
        let channelID = await AppMetadata.getAppMetadataBy(CHANNEL_KEY);
        return { apiHosts, channelID };
    }
    // 启动初始化
    async initialize() {
        const { loadCategoryList } = this.props;

        // 全局启动配置
        global.launchSettings = {
            // 获取渠道
            channelID: await AppMetadata.getAppMetadataBy(CHANNEL_KEY),
            // 读取接口主机地址
            apiHosts: await api.loadHosts()
        };

        // 启动返回的结果
        let result = await api.launch();

        // 活动提示窗
        if(result.data && result.data.initialMessages){
            Alert.alert(result.data.initialMessages[0].title,result.data.initialMessages[0].content,[
                {text:'确定', onPress: () => { this.props.navigation('Self') }},
                {text:'关闭', onPress: () => {  }}
            ]);
        }

        // 启动成功后的处理
        if (result.code === 0) {
            // 用户是否来自中国
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
        }
        // 返回失败后的处理
        else {
            if (result.code === 504) {
                this.setState({tipText: '网络不给力，请求超时啦'});
            }
            else if(result.code === 500){
                this.setState({tipText: result.message});
            }
            else {
                this.setState({tipText: '初始化错误：' + result.message});
            }
        }

        // 取到升级后的app版本
        let upgradeAfterAppVersion = await loadCurrentVersion();
        // 当前app版本
        let currentAppVersion = VERSION;

        // 如果升级后的版本与当前的版本不相同
        if(upgradeAfterAppVersion !== currentAppVersion){
            clear.runClearCache(() => {
                // 清除redux相关的缓存
                global.persistStore && global.persistStore.purge();
                // 清除所有storage缓存,但带key的数据不会被清除
                // storage && storage.clearMap();
            });
        }

        // 读取主要信息 - 单独处理
        this.loadmain();
        // 初始化分类列表导航
        loadCategoryList && loadCategoryList();
        // 数据初始化
        this.onHeaderRefresh(RefreshState.HeaderRefreshing);
        // 检测包的版本
        this.checkBinaryVersion();
        // 检测代码热更新
        this.checkJSBundleVersion();
    }
    // 监听设备返回键
    _addEventListenerBackHandler(){
        // 安卓设备
        if(Platform.OS === 'android'){
            this.appBackHandler = BackHandler.addEventListener('hardwareBackPress',this._handleBack.bind(this));
        }
        // 苹果设备 - 临时处理
        else{

        }
    }
    // 删除监听
    _removeEventListenerBackHandler(){
        // 安卓设备
        if(Platform.OS === 'android'){
            this.appBackHandler && this.appBackHandler.remove();
        }
        // 苹果设备 - 临时处理
        else{

        }
    }
    // 设备返回键监听对应函数
    _handleBack(){
        this.popExitRef && this.popExitRef.modeShow();
        return true;
    }
    onHeaderRefresh = (refreshState) => {
        this.props.loadBanners(refreshState);
        this.props.loadNavs(refreshState);
        this.props.loadHots(refreshState);

        this.HostPotRef && this.HostPotRef._requestData();
        this.HostPotentRefYl && this.HostPotentRefYl._requestData();
        this.HostPotRefKj && this.HostPotRefKj._requestData();
        this.HostPotRefSh && this.HostPotRefSh._requestData();
        this.HostPotRefMs && this.HostPotRefMs._requestData();
        this.HostPotRefYy && this.HostPotRefYy._requestData();
    };
    onFooterRefresh = (refreshState) => {
        return null;
    };
    _renderFooter = () => {
        return (
            <View style={{flex:1}}>
                <FlatList
                    data={this.props.nav}
                    keyExtractor={item => item.type}
                    renderItem={({item}) => <SectionItem {...this.props} sectionMapData={item} play={(item) => this.play(item)}/>}
                    // ListFooterComponent={this._renderBottom.bind(this)}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                />
                { this._renderBottom() }
            </View>
        );
    };
    // 首页底端内容
    _renderBottom(){
        const titleIconEntertainment = require("../imgs/mark_funny.png");
        const titleIconFunny = require("../imgs/mark_gossip.png");
        const hotFire = require("../imgs/hot_fire.png");
        const markFood = require('../imgs/mark_food.png');
        const markGossip = require('../imgs/mark_gossip.png');
        const markSword = require('../imgs/mark_sword.png');
        const markJapnaKorea = require('../imgs/mark_japna_korea.png');

        return (
            <View style={styles.rBot}>
                <HostPot
                    {...this.props}
                    type={'xigua'}
                    linkIndex={0}
                    titleIcon={hotFire}
                    title={'今日热点'}
                    ref={ref => this.HostPotRef = ref}
                    isTopBorder={true}
                />
                <HostPot
                    {...this.props}
                    type={'pear'}
                    linkIndex={6}
                    titleIcon={titleIconEntertainment}
                    title={'娱乐'}
                    ref={ref => this.HostPotentRefYl = ref}
                    isTopBorder={true}
                />
                <HostPot
                    {...this.props}
                    type={'pear'}
                    linkIndex={5}
                    titleIcon={markSword}
                    title={'科技'}
                    ref={ref => this.HostPotRefKj = ref}
                    isTopBorder={true}
                />
                <HostPot
                    {...this.props}
                    type={'pear'}
                    linkIndex={4}
                    titleIcon={markJapnaKorea}
                    title={'生活'}
                    ref={ref => this.HostPotRefSh = ref}
                    isTopBorder={true}
                />
                <HostPot
                    {...this.props}
                    type={'pear'}
                    linkIndex={9}
                    titleIcon={markFood}
                    title={'美食'}
                    ref={ref => this.HostPotRefMs = ref}
                    isTopBorder={true}
                />
                <HostPot
                    {...this.props}
                    type={'pear'}
                    linkIndex={11}
                    titleIcon={markGossip}
                    title={'音乐'}
                    ref={ref => this.HostPotRefYy = ref}
                    isTopBorder={true}
                />
                <FooterPrompt/>
            </View>
        );
    };
    renderImageRow(item, index) {
        let singleBannerTitle = item && item.title;

        return (
            <TouchableOpacity activeOpacity={1} onPress={this.onClickBanner.bind(this,item)} key={index} style={[styles.slide]}>
                <ImageLoad
                    source={{uri: item.cover}}
                    style={styles.image}
                    customImagePlaceholderDefaultStyle={{width: 80, height: 80, justifyContent: 'center'}}
                    isShowActivity={false}
                    placeholderSource={require('../imgs/default_film_cover.png')}
                />
                <ImageBackground
                    source={ require( '../imgs/screen_gradient_top.png' ) }
                    style={styles.ImageBackground}
                    imageStyle={{resizeMode:'stretch'}}
                >
                    <Text style={styles.ImageBackgroundText}>{ singleBannerTitle }</Text>
                </ImageBackground>
            </TouchableOpacity>
        )
    }
    onClickBanner = (item) => {
        const { navigate } = this.props.navigation;
        return navigate('MoviePlayScreen', {code: item.hexId});
    };
    _renderHeader = () => {
        const { banner, nav } = this.props;
        const _banner = Object.keys(banner);
        const bannerData = banner && (_banner.length !== 0) && banner[0].data;
        const hotFire = require("../imgs/hot_fire.png");

        return (
            <View style={{flex: 1}}>
                <View style={[styles.bannerBox]}>
                    {
                        bannerData ?
                        <Carousel
                            autoplay={true}
                            autoplayTimeout={3000}
                            loop={true}
                            index={0}
                            pageSize={width}
                            pageIndicatorOffset={16}
                            pageIndicatorStyle={styles.pageIndicatorStyle}
                            activePageIndicatorStyle={styles.activePageIndicatorStyle}
                            pageIndicatorContainerStyle={styles.pageIndicatorContainerStyle}
                        >
                            {bannerData.map((item,index) => this.renderImageRow(item,index))}
                        </Carousel> :
                        <View style={[styles.defaultLoading]}>
                            <ActivityIndicator animating={true} color={'rgb(0,118,248)'} size={'small'}/>
                        </View>
                    }
                </View>
                <View style={styles.qjBox}>
                    <View style={styles.qjinnderBox}>
                        {
                            catNav.map((item,index) => {
                                return (
                                    <TouchableOpacity key={index} onPress={this._InnerIndex.bind(this,item)} activeOpacity={0.50} style={styles.qjBut}>
                                        <Image source={item.logo} resizeMode={'contain'} style={styles.qjImage}/>
                                        <Text style={styles.qjButText}>{item.name}</Text>
                                    </TouchableOpacity>
                                )
                            })
                        }
                    </View>
                </View>
                <View style={[styles.hotContainer]}>
                    <View style={[styles.hotsPlayer]}>
                        <Image source={hotFire} style={[styles.hotIcon]} resizeMode={'contain'}/>
                        <Text style={[styles.hotTextStyle, {fontFamily: 'PingFangSC-Medium'}]}>今日更新</Text>
                    </View>
                </View>
            </View>
        );
    };
    // 进入分类列表
    _InnerIndex(item){
        const { navigate } = this.props.navigation;
        const { reLoadWithFilters, categoryObj } = this.props;
        let id = item.id;
        let name =  playText(id);
        let navigateFlow = navigate('InnerIndex',{name,id});
        let defaultNavId = categoryObj && categoryObj.genre && categoryObj.genre[id][1].id;
        navigateFlow && reLoadWithFilters && reLoadWithFilters(RefreshState.HeaderRefreshing, {type: id, genre: defaultNavId});
    }
    // 去播放
    play = (item) => {
        const {navigate} = this.props.navigation;
        let obj = {code: item.hexId};
        return navigate('MoviePlayScreen', obj);
    };
    // 头部提示窗口关闭后调用
    handleClose(data) {
        statusBarSetPublic && statusBarSetPublic('#FFFFFF','dark-content',true);
    }
    // 立即退出
    onDismissExit(){
        if(Platform.OS === 'android'){
            BackHandler.exitApp();
        }
        this.popExitRef && this.popExitRef.modeHide();
    }
    // 想再看看
    onConfirmExit(){
        this.popExitRef && this.popExitRef.modeHide();
    }
    // 暂不升级
    onDismissUpdate(){
        const { showProgressCircle } = this.state;

        if(showProgressCircle){
            return null;
        }

        this.popUpdateRef && this.popUpdateRef.modeHide();
    }
    // 确定升级
    onConfirmUpdate(){
        const { needUpdate } = this.state;

        this.setState({
            showProgressCircle: true,
            popHeightUpdate: 200,
            buttonRightText: '正在升级中，请勿其他操作',
            buttons: 1,
            versionText: '亲，已检测到有最新版本。',
        });
        needUpdate !== null && needUpdate(true);
    }
    // 检测代码热更新
    async checkJSBundleVersion(){
        // 取到代码热跟新的key -  暂且为staging包
        let deploymentKey = DEPLOYMENT_KEYS[Platform.OS].STAGING;

        // 获取当前已安装更新的元数据（描述、安装时间、大小等）
        CodePush.getUpdateMetadata()
            .then(info =>{
                console.log('获取当前已安装更新的元数据',info);
            });

        // 检测代码是否最新
        CodePush.checkForUpdate(deploymentKey)
        .then(update => {

            console.log('检测代码热更新检测------',update);

            if(!update){
                return;
            }

            // 下载最新代码
            CodePush.sync(
                this.codePushDialogConfig.bind(deploymentKey),
                this.codePushStatusDidChange.bind(this),
                this.codePushDownloadDidProgress.bind(this)
            );
        })
        // 检测代码更新异常处理
        .catch(err => {
            console.log('检测代码更新异常',err);
        });
    }
    codePushDownloadDidProgress(progress) {
        let receivedBytes = progress.receivedBytes;
        let totalBytes = progress.totalBytes;
        let downloadProgress = (receivedBytes / totalBytes) * 100;
        this.setState({downloadProgress: downloadProgress});
    }
    codePushDialogConfig(deploymentKey){
        return {
            // 部署key
            deploymentKey: deploymentKey,
            // 启动模式三种：ON_NEXT_RESUME:当应用从后台返回时、ON_NEXT_RESTART:下一次启动应用时、IMMEDIATE:立即更新
            installMode: CodePush.InstallMode.IMMEDIATE,
            // 升级弹出层
            updateDialog: {
                // 是否显示更新description，默认为false
                appendReleaseDescription: true,
                // 更新说明的前缀。 默认是” Description:
                descriptionPrefix:"更新内容：",
                // 强制更新的按钮文字，默认为continue
                mandatoryContinueButtonLabel:"立即更新",
                // 强制更新时，更新通知
                mandatoryUpdateMessage:"重要更新，请务必安装",
                // 非强制更新时，取消按钮文字,默认是ignore
                optionalIgnoreButtonLabel: '忽略',
                // 非强制更新时，确认文字
                optionalInstallButtonLabel: '更新',
                // 非强制更新时，更新通知
                optionalUpdateMessage: '有新版本了，是否更新？',
                // 要显示的更新通知的标题
                title: '更新提示'
            },
        };
    }
    codePushStatusDidChange(status){
        switch (status) {
            // 正在检查更新
            case CodePush.SyncStatus.CHECKING_FOR_UPDATE:
                this.setState({AppVersionPrompt: '正在检查更新...',});
                break;
            // 等待用户操作
            case CodePush.SyncStatus.AWAITING_USER_ACTION:
                this.setState({AppVersionPrompt: '等待用户操作'});
                break;
            // 正在下载更新包
            case CodePush.SyncStatus.DOWNLOADING_PACKAGE:
                this.setState({AppVersionPrompt: '正在下载更新包...'});
                break;
            // 正在安装更新
            case CodePush.SyncStatus.INSTALLING_UPDATE:
                this.setState({AppVersionPrompt: '正在安装更新...'});
                // 不重启app
                CodePush.restartApp(false);
                break;
            // 当前已是最新版
            case CodePush.SyncStatus.UP_TO_DATE:
                this.setState({AppVersionPrompt: '当前已是最新版'});
                break;
            // 用户忽略升级
            case CodePush.SyncStatus.UPDATE_IGNORED:
                this.setState({AppVersionPrompt: '用户忽略升级'});
                break;
            // 更新成功
            case CodePush.SyncStatus.UPDATE_INSTALLED:
                this.setState({AppVersionPrompt: '更新成功'});
                // 不重启app
                CodePush.restartApp(false);
                break;
            // 同步进行中
            case CodePush.SyncStatus.SYNC_IN_PROGRESS:
                this.setState({AppVersionPrompt: '同步进行中...'});
                break;
            // 未知错误
            case CodePush.SyncStatus.UNKNOWN_ERROR:
                this.setState({AppVersionPrompt: '未知错误'});
                break;
        }
    }
    // 检测包版本
    async checkBinaryVersion() {
        let obj = await this.loadmain();
        const apkVersionUrl = obj.apiHosts.update + '/api/app/checkUpgrade/android?channel_id=' + obj.channelID;

        const appUpdate = new AppUpdate({
            // iosAppId: '123456',
            apkVersionUrl: apkVersionUrl,
            needUpdateApp: (needUpdate) => {
                this.popUpdateRef && this.popUpdateRef.modeShow();
                this.setState({needUpdate: needUpdate});
            },
            // 强制更新
            forceUpdateApp: () => {
                console.log("Force update will start");
                return Alert.alert('提示','Force update will start');
            },
            // 不需要更新
            notNeedUpdateApp: () => {
                this.popUpdateRef && this.popUpdateRef.modeHide();
            },
            // 开始下载
            downloadApkStart: () => {
                this.setState({downloadProgress: 0});
            },
            // 下载进度
            downloadApkProgress: (progress) => {
                this.setState({downloadProgress: progress});
            },
            // 下载结束
            downloadApkEnd: () => {
                this.popUpdateRef && this.popUpdateRef.modeHide();
                this.setState({buttons: 2, buttonRightText: '立即升级'});
            },
            // 下载中出现的错误
            onError: () => {
                this.setState({
                    showProgressCircle: false,
                    versionText: '亲，下载出错了，请重新升级吧。',
                    buttons: 2,
                    buttonRightText: '立即升级',
                    popHeightUpdate: 160
                });
            }
        });

        return appUpdate.checkUpdate();
    }
    // 头部 - demo
    renderHeader(){
        return (<CommonHeader {...this.props}/>);
    }
    // 列表数据 - demo
    renderList(){
        const hotRecords = (!this.props.hot || this.props.hot.length === 0) ? [] : this.props.hot[0].data;

        return (
            <XingrenFlatList
                data={hotRecords}
                renderItem={({item}) => <MovieCellInList item={item} onPress={this.play}/>}
                keyExtractor={item => item.id}
                columnWrapperStyle={styles.cloumnWrapperStyle}
                ListHeaderComponent={this._renderHeader}
                ListFooterComponent={this._renderFooter}
                onHeaderRefresh={this.onHeaderRefresh}
                onFooterRefresh={this.onFooterRefresh}
                refreshState={this.props.refreshState}
                numColumns={3}
            />
        );
    }
    // 退出提示 - dmeo
    renderLogout(){
        return (
            <Dialog
                popHeight={160}
                ref={ref => this.popExitRef = ref}
                animationType={'fade'}
                title={'系统提示'}
                buttonLeftText={'立即退出'}
                buttonRightText={'想再看看'}
                mandatory={true}
                onDismiss={this.onDismissExit.bind(this)}
                onConfirm={this.onConfirmExit.bind(this)}
            >
                <View style={styles.popContent}>
                    <Text style={styles.popContentText}>亲，确定要退出超视TV吗？</Text>
                </View>
            </Dialog>
        );
    }
    // 版本提示 - demo
    renderVersionPrompt(){
        const {
            showProgressCircle,
            popHeightUpdate,
            buttonRightText,
            downloadProgress,
            buttons,
            versionText
        } = this.state;

        return (
            <Dialog
                popHeight={popHeightUpdate}
                ref={ref => this.popUpdateRef = ref}
                animationType={'fade'}
                title={'当前版本：'+VERSION}
                buttonLeftText={'暂不升级'}
                buttonRightText={buttonRightText}
                mandatory={false}
                buttons={buttons}
                onDismiss={this.onDismissUpdate.bind(this)}
                onConfirm={this.onConfirmUpdate.bind(this)}
            >
                <View style={styles.popContent}>
                    {
                        showProgressCircle ?
                        <ProgressCircle
                            percent={downloadProgress}
                            radius={40}
                            borderWidth={4}
                            color="rgb(0,117,248)"
                            shadowColor="rgb(193,193,193)"
                            bgColor="#fff"
                        >
                            <Text style={[styles.popContentText,{color:'rgb(0,117,248)'}]}>{downloadProgress}%</Text>
                        </ProgressCircle> :
                        <Text style={styles.popContentText}>{ versionText }</Text>
                    }
                </View>
            </Dialog>
        );
    }
    // 消息提示 - demo
    renderMessagePrompt(){
        const { userData } = this.props;
        const showMessageStatus = userData && userData.message && userData.message.isMessage;

        // 有提示
        if(showMessageStatus){
            return null;
        }

        return null;
    }
    // 立即提现
    _immediatelyWithdrawal(isNewUser){
        const { navigation } = this.props;

        this.activityRef && this.activityRef.hide();

        if(isNewUser){
            navigation.navigate('Self');
            this.props.showActivity && this.props.showActivity(true);
        }
        else{
            navigation.navigate('Login');
        }
    }
    // 关闭活动弹出层 - 并调转至邀请界面
    _closeActivity(){
        const { navigation } = this.props;

        this.activityRef && this.activityRef.hide();
        navigation.navigate('InviteFriends');
        this.props.showActivity && this.props.showActivity(true);
    }
    // 活动公共 - demo
    renderActivityImage(isNewUser: boolean){
        const popNewUserReward = require('../imgs/activity/pop_new_user_reward.png');

        return (
            <View style={[styles.activityBox]}>
                <Image source={popNewUserReward} resizeMode={'contain'} style={[styles.activityImage]}/>
                <TouchableOpacity
                    activeOpacity={0.8}
                    style={[styles.activityBtn]}
                    onPress={this._immediatelyWithdrawal.bind(this,isNewUser)}
                >
                    <Text style={[styles.fontFamily,styles.activityBtnText]}>立即提现</Text>
                </TouchableOpacity>
            </View>
        );
    }
    // 关闭活动弹出层 - demo
    renderCloseActivity(){
        const randomImage = this.state.randomImage !== 0 && this.state.randomImage;

        return (
            <TouchableOpacity
                activeOpacity={1.0}
                style={[styles.activityBox]}
                onPress={this._closeActivity.bind(this)}
            >
                <Image source={randomImage} resizeMode={'contain'} style={[styles.activityImage]}/>
            </TouchableOpacity>
        );
    }
    // 随机活动图
    _randomActivityImage(){
        let img = require('../imgs/activity/pop_old_user_5.png');
        let randomValue = _.random(1,5,false);

        switch (parseInt(randomValue)){
            case 1: img = require(`../imgs/activity/pop_old_user_1.png`);
                break;
            case 2: img = require(`../imgs/activity/pop_old_user_2.png`);
                break;
            case 3: img = require(`../imgs/activity/pop_old_user_3.png`);
                break;
            case 4: img = require(`../imgs/activity/pop_old_user_4.png`);
                break;
            case 5: img = require(`../imgs/activity/pop_old_user_5.png`);
                break;
        }

        return img;
    }
    // 活动模板 - 显示隐藏控制
    _allowFunction(isLogout, userDataIsNewUser){
        // 是登录情况下
        if(!isLogout){
            if(userDataIsNewUser){
                return null;
            }
            else{
                this.activityRef && this.activityRef.hide();
                this.props.showActivity && this.props.showActivity(true);
            }
        }

        return null;
    }
    // 活动 - demo
    renderActivity(){
        const { userData } = this.props;
        const _isLogout = isLogout(this.props);
        const _launchIsNewUser = (global.launchSettings && global.launchSettings.isNewUser) || false;
        const _userDataIsNewUser = (userData && userData.login && userData.isNewUser) || false;

        return (
            <ActivityTemplate
                allowFunction={this._allowFunction.bind(this,_isLogout,_userDataIsNewUser)}
                ref={ref => this.activityRef = ref}
            >
                {
                    _isLogout ? this.renderActivityImage(_userDataIsNewUser) :
                    (
                        _launchIsNewUser ? this.renderActivityImage(_launchIsNewUser) : (
                            _userDataIsNewUser ? this.renderActivityImage(_userDataIsNewUser) : this.renderCloseActivity()
                        )
                    )
                }
            </ActivityTemplate>
        );
    }
    render() {
        return (
            <View style={styles.renderView}>
                { this.renderHeader() }
                { this.renderList() }
                { this.renderLogout() }
                { this.renderVersionPrompt() }
                { this.renderMessagePrompt() }
                { this.renderActivity() }
            </View>
        );
    }
}

const styles = StyleSheet.create({
    activityBtn:{
        height:40,
        borderRadius: 50,
        elevation:3,
        width:'55%',
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:'#ffcc65',
        marginTop:-105
    },
    activityBtnText:{
        fontSize:16,
        color:'#d89613'
    },
    activityBox:{
        width:'80%',
        alignItems:'center'
    },
    activityImage:{
        width:'100%',
    },
    popContent:{
        flex:1,
        justifyContent:'center',
        alignItems:'center'
    },
    popContentText:{
        fontSize:16,
        color:'#333'
    },
    renderView:{
        flex: 1,
        backgroundColor: '#FFFFFF'
    },
    rBot:{
        flex:1,
        marginTop:6
    },
    defaultLoading:{
        justifyContent:'center',
        alignItems:'center',
        height:170,
        backgroundColor:'rgb(255,255,255)'
    },
    ImageBackground:{
        position:'absolute',
        left:0,
        top:0,
        zIndex:10,
        width:'100%',
        padding:10,
    },
    ImageBackgroundText:{
        fontSize:15,
        color:'#FFFFFF'
    },
    pageIndicatorStyle: {
        width: 8,
        height: 8,
        borderRadius: 8,
        marginHorizontal: 4,
        backgroundColor: 'rgba(255,255,255,.4)'
    },
    activePageIndicatorStyle: {
        position: 'absolute',
        backgroundColor: 'rgb(0,117,248)',
    },
    pageIndicatorContainerStyle: {
        position: 'absolute',
        alignSelf: 'center',
        flexDirection: 'row',
        bottom: 10
    },
    cloumnWrapperStyle: {
        justifyContent: 'space-between',
        marginHorizontal:6
    },
    sectionCloumnWrapperStyle: {
        justifyContent: 'space-around',
        paddingTop: 12,
    },
    hotContainer: {
        flexDirection: 'row',
        marginHorizontal: 6,
        height: 44,
        alignItems: 'center'
    },
    hotIcon: {
        marginRight: 5,
        width: 15,
        height: 15,
        marginTop:2
    },
    hotsPlayer:{
        flexDirection: 'row',
        flex: 1,
        paddingLeft:6
    },
    hotTextStyle: {
        fontSize: 14,
        color: '#404040',
        fontWeight: 'bold'
    },
    sectionTextStyle: {
        fontSize: 14,
        color: '#404040',
        marginLeft: 15,
        marginTop: 15,
        textAlignVertical: 'center'
    },
    slide: {
        height:170,
    },
    image: {
        width: width,
        height: 170,
    },
    bannerBox: {
        borderBottomColor: '#dcdcdc'
    },
    qjBox:{
        height:80,
        backgroundColor:'rgb(241,241,241)'
    },
    qjinnderBox:{
        height:70,
        backgroundColor:'#fff',
        flexDirection:'row'
    },
    qjBut:{
        flex:1,
        justifyContent:'center',
        alignItems:'center'
    },
    qjButText:{
        fontSize:14,
        color:'rgb(64,64,64)',
        fontWeight:'bold',
        marginTop:2
    },
    qjImage:{
        width:30,
        height:30,
        resizeMode:'contain'
    }
});

const mapStateToProps = (state, ownProps) => {
    let filterData = state.getIn(['explore', 'root']);
    const data = state.getIn(['main', 'home']);
    let TaskData = state.getIn(['task']);
    let userData = state.getIn(['user']);

    if(Immutable.Map.isMap(TaskData)){ TaskData = TaskData.toJS() }
    if(Immutable.Map.isMap(userData)){ userData = userData.toJS() }

    return {
        ...ownProps,
        ...(Immutable.Map.isMap(data) ? data.toJS() : data),
        ...(Immutable.Map.isMap(filterData) ? filterData.toJS() : filterData),
        ...TaskData,
        ...userData
    };
};

export default withNavigationFocus(connect(mapStateToProps, {
    loadBanners,
    loadHots,
    loadNavs,
    reLoadWithFilters,
    loadCategoryList,
    loginCheck,
    showActivity
})(Home));
