
/*我的个人中心*/

import React from 'react';
import { Image, View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated,Modal } from 'react-native';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import _ from 'lodash';
import accounting from 'accounting';
import LinearGradient from 'react-native-linear-gradient';
import { withNavigationFocus } from 'react-navigation-is-focused-hoc';
import Toast from 'react-native-root-toast';
import ImageLoad from 'react-native-image-placeholder';
import TabBarIcon from '../../common/TabBarIcon';
import {
    pixel,
    width,
    money,
    numberConversion,
    checkNetworkState,
    netInfoAddEventListener,
    getCurrentNetInfo,
    statusBarSetPublic,
    isLogout
} from "../../common/tool";
import { personalCenter } from '../../actions/user';

const defaultIcon = require('../imgs/tab_my_unsel.png'),
      activeIcon = require('../imgs/tab_my_sel.png');
const styles = StyleSheet.create({
    fontFamily: {
        fontFamily: 'PingFangSC-Medium',
    },
    djBox:{
        height:18,
        paddingHorizontal:5,
        borderRadius:3,
        overflow:'hidden',
        backgroundColor:'#ffc755',
        flexDirection:'row',
        alignItems:'center',
        marginLeft:10
    },
    rowImage: {
        marginBottom: 10,
        width: 50,
        height: 50
    },
    stepText:{
        color:'#dcdcdc',
        fontSize:10
    },
    stepLine:{
        height:3,
        width:50,
        backgroundColor:'#dcdcdc',
        position:'absolute',
        top:7.5
    },
    stepCircle:{
        width:12,
        height:12,
        borderRadius:10,
        borderWidth:2,
        borderColor:'#dcdcdc',
        backgroundColor:'#fff'
    },
    stepSingle:{
        height:60,
        flexDirection:'column',
        justifyContent:'center',
        alignItems:'center',
        position:'relative',
        width: 60,
        paddingBottom:28,
        zIndex:50
    },
    stepBox: {
        width: width - 40,
        height: 34,
        position: 'absolute',
        bottom:0,
        left:30,
        zIndex:10,
        overflow:'hidden',
        flexDirection:'row'
    },
    rowChar: {
        fontSize: 14,
        color: "#404040"
    },
    rightBorder: {
        borderRightWidth: 1 / pixel,
        borderRightColor: '#dcdcdc',
    },
    bottomBorder: {
        borderBottomWidth: 1 / pixel,
        borderBottomColor: '#dcdcdc',
    },
    rowInner: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rowsImgBox: {
        width: 32,
        overflow: 'hidden',
    },
    row: {
        flex: 1,
        overflow: 'hidden'
    },
    rowsBody: {
        flex: 1,
        marginLeft: 10,
        overflow: 'hidden',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'space-between'
    },
    rowsBtn: {
        width: 90,
        alignItems: 'center',
        justifyContent: 'flex-end',
        flexDirection: 'row',
        position:'absolute',
        zIndex:666,
        top:0,
        bottom:0,
        right:0,
        paddingRight:10
    },
    rowsBtnView: {
        width: 50,
        borderColor: 'rgb(0,117,248)',
        borderWidth: 0.4,
        height: 25,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: "hidden",
        borderRadius: 25
    },
    txPrompt:{
        position:'absolute',
        height:20,
        width:40,
        zIndex:10,
        top:3,
        left:10
    },
    rowsText: {
        fontSize: 12
    },
    rowsImg: {
        height: 40,
        width: 32
    },
    rows: {
        padding: 10,
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
        flexDirection: 'row'
    },
    myInnerBoxTitle: {
        fontSize: 12,
        color: '#afafc0',
        marginTop: -2
    },
    myInnerBoxSums: {
        fontSize: 16,
        color: 'rgb(0,117,248)',
        marginBottom: -3
    },
    myInnerBox: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    myBox: {
        position: 'absolute',
        top: 145,
        left: 10,
        right: 10,
        height: 70,
        backgroundColor: '#FFFFFF',
        borderRadius: 6,
        elevation: 3,
        paddingVertical: 15,
        zIndex: 100,
        flexDirection: 'row'
    },
    selfHeaderName: {
        flexDirection: 'row',
        marginTop: 10
    },
    selfHeaderNameText: {
        fontSize: 14,
        color: '#ffffff'
    },
    selfHeaderUser: {
        flexDirection: 'column',
        flex: 1,
        alignItems: 'center',
        paddingTop: 50
    },
    selfHeaderTX: {
        width: 50,
        height: 50,
        overflow: 'hidden',
        borderRadius: 50,
        backgroundColor: '#C0C0C0',
        elevation: 5
    },
    selfHeaderSetImage: {
        height: 20,
        width: 20
    },
    selfHeaderSet: {
        position: 'absolute',
        top: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom:20,
        paddingTop:15
    },
    selfHeader: {
        height: 180,
        backgroundColor: 'rgb(0,117,248)',
        position: "relative"
    },
    selfContainer: {
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        backgroundColor:'#EFEFEF'
    },


    //model 相关样式
    modalText:{
        fontSize:14,
        color:'#ff874b'
    },
    modalInnerBtn:{
        height:30,
        marginTop:16,
        width:100,
        backgroundColor:'#fff',
        borderRadius:30,
        justifyContent:'center',
        alignItems:'center'
    },
    modalBottom:{
        height:100,
        width: '100%',
        zIndex:100,
        position:'relative',
        justifyContent:'center',
        alignItems:'flex-end',
        flexDirection:'row'
    },
    modalBtn:{
        width:60,
        height:60,
        overflow:'hidden',
        justifyContent:'center',
        alignItems:'center'
    },
    modalImage:{
        width:'100%',
        height: '100%',
        position: 'absolute',
        left:0,
        bottom:0,
        top:0,
        right:0,
        zIndex:0,
        overflow:'hidden'
    },
    modalInner:{
        position:'relative',
        zIndex:10,
        flex:1,
        alignItems:'center'
    },
    modalBox:{
        backgroundColor:'#fff',
        width: width - 100,
        height: 320,
        borderRadius:6,
        overflow: 'hidden',
        elevation:4,
    },
    modalContent:{
        position:'absolute',
        top:0,
        left:0,
        bottom:0,
        right:0,
        backgroundColor:'rgba(0,0,0,0.5)',
        zIndex:999,
        flexDirection:'column',
        justifyContent:'center',
        alignItems:'center',
        flex:1,
    },

});

let modalShowState = true;

class Self extends React.Component {
    static navigationOptions = {
        tabBarIcon: ({focused}) => (<TabBarIcon focused={focused} defaultIcon={defaultIcon} activeIcon={activeIcon}/>),
        tabBarLabel: '我的',
        header: null,
        tabBarOnPress: ({scene, jumpToIndex}) => {
            modalShowState = true;
            jumpToIndex(scene.index);
        }
    };
    constructor(props) {
        super(props);
        this.state = {
            // 当前步骤数默认为零
            currentPosition: 0,
            currentState: false,
            //model 显示控制
            visible:false,
            randomImage: 0,
        };
        this.daysArr = [1, 2, 3, 4];
        this.errorTime = Date.now();
        this.animated = {
            scale: new Animated.Value(0),
        };
    }
    componentWillMount() {
        // 执行动画
        this._animated();
    }
    componentWillReceiveProps(nextProps) {
        const { personalCenter } = this.props;
        // 进入本组件的一些处理
        if (!this.props.isFocused && nextProps.isFocused) {
            // 状态栏设置
            this._startBarSet();
            // 初始化数据
            personalCenter && personalCenter();
            this.setState({currentState: true});
            const _userDataIsNewUser = (nextProps.userData && nextProps.userData.login && nextProps.userData.isNewUser) || false;
            if(modalShowState && !isLogout(nextProps) && !_userDataIsNewUser){
                // 加载随机活动图
                let randomImage = this._randomActivityImage();
                this.setState({randomImage: randomImage});
                this._modalHander();
                modalShowState = false;
            }
        }

        // 错误提示
        if(this.state.currentState
            && !isLogout(nextProps)
            && nextProps.error
            && this.errorTime < nextProps.error.timeUpdated
        ){
            let error = nextProps.error.error;

            this.errorTime = nextProps.error.timeUpdated;
            Toast.show(error.message,{duration: 2000, position: -55});
        }

        // 离开本组件的一些处理
        if (this.props.isFocused && !nextProps.isFocused) {
            const { loginStatus } = this.state;

            if(loginStatus){
                this.setState({loginStatus: false});
            }
            this.setState({currentState: false});
        }
    }
    //弹窗控制
    _modalHander(){
        let randomValue = Math.random();

        if(randomValue < 0.4){
            this._openModal();
        }
    }
    // 状态栏设置
    _startBarSet() {
        statusBarSetPublic('rgb(0,117,248)','light-content',true);
    }
    // 设置
    _set() {
        const { navigation } = this.props;

        if(isLogout(this.props)){
            Toast.show('登录后才能进行相关设置哦',{
                position: -55,
                // backgroundColor: 'rgb(0,117,248)',
                textColor:'#FFF',
                duration: 2000
            });
            return;
        }

        return navigation.navigate('Setting');
    }
    // 邀请
    _invitation() {
        const { navigation } = this.props;

        if(isLogout(this.props)){
            Toast.show('登录后邀请好友一起来赚现金哦',{
                position: -55,
                // backgroundColor: 'rgb(0,117,248)',
                textColor:'#FFF',
                duration: 2000
            });
            return;
        }
        this._closeModal();
        navigation.navigate('InviteFriends');
    }
    // 个人信息 - data
    _personalData(){
        const { userData } = this.props;

        const data = userData
            && userData.login
            && userData.personal
            && parseInt(userData.personal.code) === 0
            && userData.personal.data;

        return data;
    }
    // 提现
    _withdrawal() {
        const { navigation } = this.props;
        const data = this._personalData();
        const limitAmount = data ? (data.watch && data.watch.limitAmount) : 100;
        const isWithdrawed = data ? (data.watch && data.watch.isWithdrawed) : 0;
        const isNewUser = isWithdrawed === 1 ? false : true;
        const currentMoney = data ? data.property.money : 0;
        const cycleDays = data ? parseInt(data.watch.cycleDays) : 0;

        if(isLogout(this.props)){
            Toast.show('登录后可以提现哦',{
                position: -55,
                // backgroundColor: 'rgb(0,117,248)',
                textColor:'#FFF',
                duration: 2000
            });
            return;
        }

        return navigation.navigate('Withdrwal',{
            quickDay:cycleDays,
            quickMoney:limitAmount,
            currentMoney:currentMoney,
            isNewUser:isNewUser
        });
    }
    // 任务中心
    _taskCenter() {
        const { navigation } = this.props;
        navigation.navigate('TaskCenter');
    }
    // 离线缓存
    _offlineCaching() {
        const { navigation } = this.props;
        navigation.navigate('CacheManagement');
    }
    // 订阅收藏
    _subscribeAndCollection() {
        const { navigation } = this.props;
        navigation.navigate('CollectionPage');
    }
    // 观看历史
    _watchHistory() {
        const { navigation } = this.props;
        navigation.navigate('HistoryPage');
    }


    // 我的零钱
    _myWallet(value){
        const { navigation } = this.props;
        const data = this._personalData();
        const limitAmount = data ? (data.watch && data.watch.limitAmount) : 100;
        const isWithdrawed = data ? (data.watch && data.watch.isWithdrawed) : 0;
        const isNewUser = isWithdrawed === 1 ? false : true;
        const currentMoney = data ? data.property.money : 0;
        const cycleDays = data ? parseInt(data.watch.cycleDays) : 0;

        if(isLogout(this.props)){
            Toast.show('登录后查看我的金币和零钱',{
                position: -55,
                // backgroundColor: 'rgb(0,117,248)',
                textColor:'#FFF',
                duration: 2000
            });
            return;
        }

        return navigation.navigate('MyWallet',{
            value: value,
            quickDay:cycleDays,
            quickMoney:limitAmount,
            currentMoney:currentMoney,
            isNewUser:isNewUser
        });
    }
    // 提现步骤 - demo
    _withdrawalStepDemo(){
        const data = this._personalData();
        const cycleDays = data ? parseInt(data.watch.cycleDays) : 0;

        return (
            <View style={[styles.stepBox]}>
                {
                    this.daysArr.map((item,index) => {
                        const borderColor = cycleDays >= item ? {borderColor:'rgb(0,117,248)'} : {};
                        const color = cycleDays >= item ? {color:'rgb(0,117,248)'} : {};
                        return (
                            <View key={index} style={styles.stepSingle}>
                                <View style={[styles.stepCircle,borderColor]} />
                                <Text style={[styles.fontFamily,styles.stepText,color]}>{item}天</Text>
                            </View>
                        )
                    })
                }
                {
                    this.daysArr.map((item,index) => {
                        const backgroundColor = cycleDays >= item ? {backgroundColor:'rgb(0,117,248)'} : {};
                        return (index < 3 ? <View key={index} style={[styles.stepLine,{left: ( 36 - 1 ) + 60 * index},backgroundColor]}/> : null)
                    })
                }
            </View>
        );
    }
    // 我的 - 金币 - 零钱 - 当天观看分钟数
    _renderMy(){
        const data = this._personalData();
        const _gold = data ? data.property.gold : 0;
        const _money = data ? money(data.property.money) : 0.00;
        const _todaySecond = data ? accounting.toFixed(Number(data.watch.todaySecond) / 60,0) : 0;

        return (
            <View style={styles.myBox}>
                <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={() => this._myWallet(0)}
                    style={[styles.myInnerBox, styles.rightBorder]}
                >
                    <Text style={[styles.myInnerBoxTitle, styles.fontFamily]}>我的金币</Text>
                    <Text style={[styles.myInnerBoxSums, styles.fontFamily]}>{ _gold }</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={() => this._myWallet(1)}
                    style={[styles.myInnerBox, styles.rightBorder]}
                >
                    <Text style={[styles.myInnerBoxTitle, styles.fontFamily]}>我的零钱（元）</Text>
                    <Text style={[styles.myInnerBoxSums, styles.fontFamily]}>{ _money }</Text>
                </TouchableOpacity>
                <View style={[styles.myInnerBox]}>
                    <Text style={[styles.myInnerBoxTitle, styles.fontFamily]}>今日观看（分钟）</Text>
                    <Text style={[styles.myInnerBoxSums, styles.fontFamily]}>{ _todaySecond }</Text>
                </View>
            </View>
        );
    }
    // 提示
    _prompt(){
        Toast.show('登录后观看视频可以赚现金哦',{
            position: -55,
            // backgroundColor: 'rgb(0,117,248)',
            textColor:'#FFF',
            duration: 2000
        });
    }
    // 执行动画
    _animated(){
        const { scale } = this.animated;

        scale.setValue(0.6);

        Animated.parallel([
            Animated.spring(scale,{
                toValue: 1,
                friction: 1,
            }),
        ]).start(() => this._animated());
    }
    // 提现按钮 - demo
    _renderTxbtn(){
        const data = this._personalData();
        // const cycleDays = data ? parseInt(data.watch.cycleDays) : 0;
        const isWithdrawed = data ? (data.watch && data.watch.isWithdrawed) : 1;
        // const isNewUser = isWithdrawed === 1 ? false : true;
        // const isLogout = isLogout(this.props);
        const txIcon = require('../imgs/mark_take_cash.png');
        const scale = this.animated.scale;

        return (
            <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => this._withdrawal()}
                style={[styles.rowsBtn]}
            >
                <View style={[styles.rowsBtnView]}>
                    <Text style={[styles.rowsText, styles.fontFamily, {color: 'rgb(0,117,248)'}]}>提现</Text>
                </View>
                <Animated.View style={[styles.txPrompt,{transform:[{scale: scale}]}]}>
                    <Image source={txIcon} resizeMode={'contain'} style={{width:40}} />
                </Animated.View>
            </TouchableOpacity>
        );

        // return (
        //     <TouchableOpacity
        //         activeOpacity={isLogout ? 0.75 : (isNewUser ? 0.75 : (cycleDays >= 4 ? 0.75 : 1.0))}
        //         onPress={() => isLogout ? this._prompt() : (isNewUser ? this._withdrawal() : (cycleDays >= 4 ? this._withdrawal() : {}))}
        //         style={[styles.rowsBtn]}
        //     >
        //         <View style={[styles.rowsBtnView,isLogout ?
        //             {borderColor:'rgb(0,117,248)'} :
        //             (isNewUser ? {borderColor:'rgb(0,117,248)'} : (cycleDays >= 4 ? {borderColor:'rgb(0,117,248)'} : {borderColor:'#dcdcdc'})) ]}
        //         >
        //             <Text style={[styles.rowsText, styles.fontFamily,isLogout ?
        //                 {color: 'rgb(0,117,248)'} :
        //                 (isNewUser ? {color: 'rgb(0,117,248)'} : (cycleDays >= 4 ? {color: 'rgb(0,117,248)'} : {color: '#dcdcdc'}))]}
        //             >提现</Text>
        //         </View>
        //     </TouchableOpacity>
        // );
    }
    // 提现步骤内容 - demo
    _renderTxStepRows(){
        const source = require('./selfImg/icon_take_cash_money.png');
        const data = this._personalData();
        const limitAmount = data ? (money(data.watch && data.watch.limitAmount)) : money(100);

        return (
            <View style={[styles.rows, {marginTop: 10, paddingVertical: 0,height:60}]}>
                <View style={[styles.rowsImgBox, {paddingTop: 10}]}>
                    <Image source={source} resizeMode={'contain'} style={styles.rowsImg}/>
                </View>
                <View style={[styles.rowsBody, {paddingTop: 10}]}>
                    <Text numberOfLines={1} style={[styles.rowsText, styles.fontFamily, {color: '#404040'}]}>连续观看4天，每天5分钟，即可提现{ limitAmount }元</Text>
                </View>
                { this._renderTxbtn() }
                { this._withdrawalStepDemo() }
            </View>
        );
    }
    // 邀请内容 - demo
    _renderInvitationRows(){
        const source = require('./selfImg/icon_invite_award.png');

        return (
            <TouchableOpacity
                activeOpacity={0.75}
                onPress={this._invitation.bind(this)}
                style={[styles.rows, {marginTop: 45}]}
            >
                <View style={styles.rowsImgBox}>
                    <Image source={source} resizeMode={'contain'} style={styles.rowsImg}/>
                </View>
                <View style={styles.rowsBody}>
                    <Text numberOfLines={1} style={[styles.rowsText, styles.fontFamily, {color: '#404040'}]}>邀请好友赚现金，可立即提现</Text>
                    <Text numberOfLines={1} style={[styles.rowsText, styles.fontFamily, {color: '#ff3e3e'}]}>你已经超过1天未分享，现邀请成功率很高！</Text>
                </View>
                <View  style={styles.rowsBtn}>
                    <View style={[styles.rowsBtnView,{borderColor: 'rgb(0,117,248)'}]}>
                        <Text style={[styles.rowsText, styles.fontFamily, {color: 'rgb(0,117,248)'}]}>邀请</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
    // 底部内容路由 - demo
    _renderBottomRouter(){
        const iconTaskCenter = require('./selfImg/icon_task_center.png'),
              iconOfflineCache = require('./selfImg/icon_offline_cache.png'),
              iconSubscribeCollection = require('./selfImg/icon_subscribe_collection.png'),
              iconWatchHistory = require('./selfImg/icon_watch_history.png');

        return (
            <View style={[styles.rows, {marginTop: 10, height:260}]}>
                <View style={[styles.row, styles.rightBorder]}>
                    <TouchableOpacity activeOpacity={0.5} onPress={this._taskCenter.bind(this)} style={[styles.rowInner, styles.bottomBorder]}>
                        <Image source={iconTaskCenter} resizeMode={'contain'} style={[styles.rowImage]}/>
                        <Text style={[styles.rowChar, styles.fontFamily]}>任务中心</Text>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.5} onPress={this._offlineCaching.bind(this)} style={styles.rowInner}>
                        <Image source={iconOfflineCache} resizeMode={'contain'} style={[styles.rowImage]}/>
                        <Text style={[styles.rowChar, styles.fontFamily]}>离线缓存</Text>
                    </TouchableOpacity>
                </View>
                <View style={[styles.row]}>
                    <TouchableOpacity activeOpacity={0.5} onPress={this._subscribeAndCollection.bind(this)} style={[styles.rowInner, styles.bottomBorder]}>
                        <Image source={iconSubscribeCollection} resizeMode={'contain'} style={[styles.rowImage]}/>
                        <Text style={[styles.rowChar, styles.fontFamily]}>订阅收藏</Text>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.5} onPress={this._watchHistory.bind(this)} style={styles.rowInner}>
                        <Image source={iconWatchHistory} resizeMode={'contain'} style={[styles.rowImage]}/>
                        <Text style={[styles.rowChar, styles.fontFamily]}>观看历史</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
    // 去登录
    _login() {
        const {navigation} = this.props;

        if (isLogout(this.props)) {
            return navigation.navigate('Login');
        }

        return null;
    }
    // 内容头部 - demo
    _renderHeader(){
        const iconTabMy = require('../imgs/tab_my_unsel.png'),
              iconUserDefault = require('../imgs/user_default_avarta.png'),
              iconMyInfo = require('./selfImg/icon_my_info._setting.png'),
              widthAndHeight50 = { width: 50, height: 50 },
              widthAndHeight30 = { width: 30, height: 30 };
        const { userData } = this.props;
        const showAvatar = userData && userData.avatar;
        const data = this._personalData();
        const _level = data ? data.level.level : 0;

        return (
            <LinearGradient colors={['#0076f8', '#5CA7FF']} style={styles.selfHeader}>
                <TouchableOpacity activeOpacity={1} style={styles.selfHeaderSet} onPress={this._set.bind(this)}>
                    <Image source={iconMyInfo} resizeMode={'contain'} style={styles.selfHeaderSetImage}/>
                </TouchableOpacity>
                <View style={styles.selfHeaderUser}>
                    <TouchableOpacity activeOpacity={1} onPress={this._login.bind(this)} style={styles.selfHeaderTX}>
                        {
                            showAvatar ?
                            <ImageLoad
                                source={{uri: userData.avatar}}
                                style={widthAndHeight50}
                                customImagePlaceholderDefaultStyle={widthAndHeight30}
                                isShowActivity={false}
                                placeholderSource={iconTabMy}
                            />:
                            <Image resizeMode={'contain'} source={iconUserDefault} style={widthAndHeight50}/>
                        }
                    </TouchableOpacity>
                    <View style={styles.selfHeaderName}>
                        <Text numberOfLines={1} style={[styles.selfHeaderNameText, styles.fontFamily]}>
                            { showAvatar ? userData.name : '点击这里登录' }
                        </Text>
                        {
                            showAvatar ?
                            <View style={styles.djBox}>
                                <Text style={[styles.selfHeaderNameText, styles.fontFamily,{fontSize:12}]}>LV{ _level }</Text>
                            </View> : null
                        }
                    </View>
                </View>
            </LinearGradient>
        );
    }
    // 客服
    _customerService(){
        return (
            <View style={{height:50,justifyContent:'center',alignItems:'center'}}>
                <Text style={[styles.fontFamily,{fontSize:14, color:'#cccccc'}]}>客服微信：pob9990</Text>
            </View>
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
    // 弹出层 - demo
    renderModel(){
        const { visible } = this.state;
        const iconPopupClose = require('../imgs/treasurebox/icon_popup_close.png');
        let randomImage = this.state.randomImage;

        return (
            <Modal
                visible={visible}
                transparent={true}
                onRequestClose={this._closeModal.bind(this)}
                animationType={'fade'}
            >
                <View  style={styles.modalContent}>
                    <TouchableOpacity activeOpacity={1} onPress={this._invitation.bind(this)}>
                        <Image source={randomImage} resizeMode={'contain'} />
                    </TouchableOpacity>
                    <View style={styles.modalBottom}>
                        <TouchableOpacity style={styles.modalBtn} activeOpacity={0.50} onPress={this._closeModal.bind(this)}>
                            <Image source={iconPopupClose} resizeMode={'contain'}/>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    }
    // 关闭弹出层
    _closeModal(){
        this.setState({visible: false});
    }
    _openModal(){
        this.setState({visible: true});
    }
    render() {
        return (
            <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.selfContainer}
            >
                { this._renderHeader() }
                { this._renderMy() }
                { this._renderInvitationRows() }
                { this._renderTxStepRows() }
                { this._renderBottomRouter() }
                { this._customerService() }
                { this.renderModel() }
            </ScrollView>
        )
    }
}

const mapStateToProps = (state, ownProps) => {
    let userData = state.getIn(['user']);

    if (Immutable.Map.isMap(userData)) { userData = userData.toJS() }
    return { ...ownProps, ...userData };
};

export default withNavigationFocus(connect(mapStateToProps,{ personalCenter })(Self));


