
/*任务中心*/

import React,{ Component } from 'react';
import { StyleSheet, Image, View, Text, TouchableOpacity, ImageBackground, ScrollView, Dimensions } from 'react-native';
import { connect } from 'react-redux';
import Immutable from 'immutable';
import { withNavigationFocus } from 'react-navigation-is-focused-hoc';
import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-root-toast';
import HeaderBox from '../../common/HeaderBox';
import { loadTaskCenterInfo, toPickUp, addTask } from '../../actions/task';
import { pixel, zeroPadding, statusBarSetPublic, money, isLogout } from "../../common/tool";
import TabBarIcon from '../../common/TabBarIcon';
import CommonMenu from '../Common/CommonMenu';
import { commonShare, shareAddListener, shareRemoveListener } from '../../common/wxShare';
import NoData from '../Common/NoData';

const defaultIcon = require('../imgs/taskCenter/tab_mission_center.png'),
      activeIcon = require('../imgs/taskCenter/tab_mission_center.png');
const styles = StyleSheet.create({
    fontFamily: {
        fontFamily: 'PingFangSC-Medium',
    },
    btnText:{
        fontSize:12,
    },
    menuContent:{
        position:'relative',
        paddingBottom: 20,
    },
    btnSmall:{
        width:80,
        height:25,
        borderRadius:25,
        overflow:'hidden',
        justifyContent:'center',
        alignItems:'center'
    },
    btnView:{
        width:80,
        position:'absolute',
        right:7.5,
        top:0,
        bottom:0,
        justifyContent:'center',
        alignItems:'center'
    },
    txSmallBox:{
        flexDirection:'row',
        alignItems:'center',
        height:60,
        width:30,
    },
    rowContent:{
        paddingLeft:15,
    },
    rowSmallText:{
        fontSize:14,
    },
    rowSmallBox:{
        flexDirection:'row',
        alignItems:'center',
        overflow:'hidden'
    },
    rowSmallImage:{
        marginRight:4,
        width: 20,
        height:20,
    },
    rowInnerText:{
        fontSize:12,
        color:'#404040'
    },
    smallPrompt:{
        fontSize:11,
        color:'#d0d0d0'
    },
    rowInner:{
        flexDirection:'row',
        alignItems:'center',
        flex:1
    },
    txView:{
        width:30,
        height:30,
        borderRadius:30,
        overflow:'hidden',
        backgroundColor:'#dcdcdc'
    },
    listRows:{
        height: 60,
        overflow:'hidden',
        marginHorizontal:7.5,
        position:'relative',
        paddingHorizontal:7.5,
        flexDirection:'row'
    },
    listContent:{
        flex:1,
        paddingTop: 50,
    },
    taskInnerMenuText:{
        fontSize:16,
        color:'#afafc0'
    },
    taskListBottomLine:{
        height:2.5,
        width:60,
        position:'absolute',
        bottom:5,
        zIndex:10,
    },
    verticalLine:{
        height:26,
        width:0.5,
        backgroundColor:'#d0d0d0',
        position:'absolute',
        top:3,
        right:0,
        zIndex:1
    },
    taskInnerMenu:{
        height:30,
        justifyContent:'center',
        alignItems:'center',
        width:100,
    },
    borderRight:{
        borderRightWidth: 1 / pixel,
        borderRightColor: '#d0d0d0'
    },
    borderBottom:{
        borderBottomWidth: 1 / pixel,
        borderBottomColor: '#d0d0d0'
    },
    taskListMenu:{
        flex:1,
        justifyContent:'center',
        alignItems:'center',
    },
    taskListNav:{
        height:6,
        overflow:'hidden',
        position:'absolute',
        left:0,
        right:0,
        bottom:0,
        zIndex:10,
        backgroundColor:'#fff',
        borderTopRightRadius:10,
        borderTopLeftRadius:10,
        flexDirection:'row',
    },
    taskHeaderPrompt:{
        paddingHorizontal:15,
        flex:1,
        flexDirection:'row',
        alignItems:'center',
        paddingBottom:20
    },
    taskHeaderPromptText:{
        fontSize:12,
        color:"#fff"
    },
    levelProgress:{
        height:5,
        borderRadius:10,
        overflow:'hidden',
        position:'relative',
        flexDirection:'row',
        backgroundColor:'#849AB3',
        width:'100%'
    },
    levelInnerProgress:{
        height:5,
        borderRadius:10,
        overflow:'hidden',
    },
    levelProgressTopText:{
        fontSize:10,
        color:'#fff'
    },
    levelProgressTop:{
        flex:1,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between',
    },
    levelProgressBottom:{
        flex:1,
        flexDirection:'row',
        alignItems:'center',
    },
    levelText:{
        fontSize:16,
        color:"#fff"
    },
    levelBox:{
        flexDirection:'row',
        height:50,
        marginTop:20,
        paddingHorizontal:15
    },
    level:{
        width:60,
        justifyContent:'center',
        alignItems:'center'
    },
    levelProgressBox:{
        flex:6
    },
    userName:{
        fontSize:14,
        color:'#FFF',
        marginTop:-2
    },
    userText:{
        fontSize:12,
        color:'#FFF'
    },
    uBox:{
        flex:1,
        flexDirection:"row"
    },
    djBox:{
        height:18,
        paddingHorizontal:5,
        borderRadius:3,
        overflow:'hidden',
        backgroundColor:'#ffc755',
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'flex-start'
    },
    userMsg:{
        paddingLeft:15,
        flexDirection:'column',
        alignItems:'stretch',
        height:50,
        flex:1,
        position:'relative',
    },
    userInfo:{
        height:50,
        flexDirection:"row",
        overflow:'hidden',
        paddingHorizontal:15
    },
    userTx:{
        width:50,
        height:50,
        borderRadius:50,
        overflow:'hidden',
        justifyContent:"center",
        alignItems:'center',
        backgroundColor:"#dcdcdc",
    },
    taskHeader:{
        width:'100%',
        height:220,
        overflow:'hidden',
        position:'relative'
    },
    content:{
        flex:1,
        backgroundColor:'#fff',
        overflow:'hidden',
        position:'relative'
    },
    rightBox:{
        width:100,
        height:44,
        justifyContent:'flex-end',
        alignItems:'center',
        position:'absolute',
        top:0,
        right:0,
        zIndex:100,
        flexDirection:'row',
        paddingRight:15
    },
    rightBoxText:{
        color:'#fff',
        fontSize:14,
    },
    userTxImage:{
        width:50,
        height:50,
    },
    body:{
        position:'absolute',
        left:0,
        right:0,
        zIndex:10,
        top:214,
        backgroundColor:'#fff',
        borderRadius:8,
    },
    loading:{
        flex:1,
        justifyContent:'center',
        alignItems:'center'
    },
});

class TaskCenter extends Component{
    static navigationOptions = {
        tabBarIcon: ({focused}) => (<TabBarIcon focused={focused} defaultIcon={defaultIcon} activeIcon={activeIcon}/>),
        tabBarLabel: '任务中心',
        header: null,
    };
    constructor(props){
        super(props);
        this.state = {
            currentIndex: 0,
            levelWidth: 0,
            statusArr: [],
            currentState: false,
        };
        this.loginCsTime = Date.now();
        this.taskPublicTime = Date.now();
        this.errorTime = Date.now();
    }
    async componentWillReceiveProps(nextProps) {
        const { loadTaskCenterInfo } = this.props;

        // 进入本组件的一些处理
        if (!this.props.isFocused && nextProps.isFocused) {
            // 状态栏设置
            this._startBarSet();
            // 初始化任务中心
            loadTaskCenterInfo && loadTaskCenterInfo();
            this.setState({currentState: true});
        }

        // 错误提示
        if(this.state.currentState
            && !isLogout(nextProps)
            && nextProps.error
            && this.errorTime < nextProps.error.timeUpdated
        ){
            this.errorTime = nextProps.error.timeUpdated;
            let error = nextProps.error.error;
            Toast.show(error.message,{duration: 2000, position: -55});
        }

        // 领取金币提示
        if(this.state.currentState
            && nextProps.receive
            && this.loginCsTime < nextProps.receive.receiveTimeUpdated
        ) {
            this.loginCsTime = nextProps.receive.receiveTimeUpdated;
            loadTaskCenterInfo && loadTaskCenterInfo();
        }

        // 分享好友或朋友圈提示
        if(this.state.currentState
            && nextProps.taskPublic
            && this.taskPublicTime < nextProps.taskPublic.addPublicTimeUpdated
        ){
            this.taskPublicTime = nextProps.taskPublic.addPublicTimeUpdated;
            loadTaskCenterInfo && loadTaskCenterInfo();
        }

        // 离开本组件的一些处理
        if (this.props.isFocused && !nextProps.isFocused) {
            // 删除分享监听
            shareRemoveListener && shareRemoveListener();
            this.setState({currentState: false});
        }
    }
    // 状态栏设置
    _startBarSet(){
        statusBarSetPublic && statusBarSetPublic('#A0B4CA','dark-content',true);
    }
    // 任务列表显示对应图标
    _taskViewIcon(item){
        const id: number = Number(item.id);
        let src = 0;

        switch (id){
            // 签到
            case 1: src = require('../imgs/taskCenter/icon_mission_code_daily_sign.png');
                break;
            // 开启宝箱
            case 2: src = require('../imgs/taskCenter/icon_mission_code_invite.png');
                break;
            // 观看视频
            case 3: src = require('../imgs/taskCenter/icon_mission_code_watch_5min.png');
                break;
            // 分享好友
            case 4: src = require('../imgs/taskCenter/icon_mission_code_wechat.png');
                break;
            // 分享朋友圈
            case 5: src = require('../imgs/taskCenter/icon_mission_code_share.png');
                break;
            // 去答题
            case 6: src = require('../imgs/taskCenter/icon_mission_code_faq.png');
                break;
            // 绑定手机
            case 7: src = require('../imgs/taskCenter/icon_mission_code_phone.png');
                break;
            // 填入邀请
            case 8: src = require('../imgs/taskCenter/icon_mission_code_add_invite_code.png');
                break;
        }

        return src;
    }
    // 公共任务渲染
    _taskRows(item,index){
        const iconMission: number = require('../imgs/taskCenter/icon_mission_coin.png'),
              iconMissionExp: number = require('../imgs/taskCenter/icon_mission_exp.png'),
              iconMissionRed: number = require('../imgs/taskCenter/icon_mission_red.png'),
              status: number = parseInt(item.status),
              source: number = this._taskViewIcon(item),
              _money: string | number = money(item.money);
        const backgroundColor = isLogout(this.props) ? {backgroundColor:'#dcdcdc'} : (status === 1 ? {backgroundColor:'#dcdcdc'} : {backgroundColor:'rgb(0,117,248)'});

        return (
            <View key={index} style={[styles.listRows,styles.borderBottom]}>
                <View style={styles.txSmallBox}>
                    <View style={styles.txView}>
                        { source ?  <Image source={source} resizeMode={'contain'}/> : null }
                    </View>
                </View>
                <View style={[styles.rowContent]}>
                    <View style={[styles.rowInner,{paddingTop:5}]}>
                        <Text style={[styles.fontFamily,styles.rowInnerText]}>{ item.name }</Text>
                    </View>
                    <View style={[styles.rowInner,{paddingBottom:5}]}>
                        {
                            parseInt(item.gold) === 0 ? null :
                            <View style={[styles.rowSmallBox,parseInt(item.gold) === 0 ? {} : {marginRight:15}]}>
                                <Image source={iconMission} resizeMode={'contain'} style={styles.rowSmallImage}/>
                                <Text style={[styles.fontFamily,styles.rowSmallText,{color:'#f5a623'}]}>+{ zeroPadding(item.gold) }</Text>
                            </View>
                        }
                        {
                            parseInt(item.experience) === 0 ? null :
                            <View style={styles.rowSmallBox}>
                                <Image source={iconMissionExp} resizeMode={'contain'} style={styles.rowSmallImage}/>
                                <Text style={[styles.fontFamily,styles.rowSmallText,{color:'#41cc63'}]}>+{ zeroPadding(item.experience) }</Text>
                            </View>
                        }
                        {
                            _money === (0.00 || '0.00') ? null :
                            <View style={[styles.rowSmallBox, _money !== (0.00 || '0.00') ? {} : {paddingLeft:15}]}>
                                <Image source={iconMissionRed} resizeMode={'contain'} style={styles.rowSmallImage}/>
                                <Text style={[styles.fontFamily,styles.rowSmallText,{color:'red'}]}>+{ _money }</Text>
                            </View>
                        }
                        {
                            parseInt(item.id) === 7 ? <Text style={[styles.fontFamily,styles.smallPrompt]}>去绑定手机开启领钱模式</Text> : null
                        }
                    </View>
                </View>
                <TouchableOpacity
                    activeOpacity={isLogout(this.props) ? 1.0 : (!status ? 0.50 : 1.0)}
                    onPress={() => this.onPressTaskRows(item,status)}
                    style={[styles.btnView]}
                >
                    <View style={[styles.btnSmall, backgroundColor]}>
                        <Text style={[styles.fontFamily,styles.btnText,{color:'#fff'}]}>
                            { this._correspondingField(Number(item.type),Number(item.id),status) }
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
    // 字段对应
    _correspondingField(type: number,id: number, status: any): string{
        let text: string = '';

        if(!status){
            if(type === 1){
                switch (id){
                    case 6: text = '去完成';
                        break;
                    case 7: text = '去绑定';
                        break;
                    case 8: text = '去填写';
                }
            }

            if(type === 2){
                switch (id){
                    case 1: text = '去签到';
                        break;
                    case 2: text = '去开启';
                        break;
                    case 3: text = '去观看';
                        break;
                    case 4: text = '去分享';
                        break;
                    case 5: text = '去分享';
                        break;
                }
            }
        }
        else{
            if(status === 1){
                text = '已完成';
            }
            else if(status === 2){
                text = '去领取';
            }
        }

        return text;
    }
    // 任务列表对应的点击事件
    onPressTaskRows(item,status){
        const id: number = Number(item.id);
        const { navigation, toPickUp } = this.props;

        if(isLogout(this.props)){
            return;
        }

        const channelID = (global.launchSettings && global.launchSettings.channelID) || 'nice001';
        const shareUrl = (global.launchSettings && global.launchSettings.shareUrl) || 'http://www.xiyunkai.cn';

        if(!parseInt(status)){
            switch (id){
                // 签到
                case 1: navigation.navigate('Sign');
                    break;
                // 开启宝箱
                case 2: navigation.navigate('TreasureBox');
                    break;
                // 观看视频
                case 3: navigation.navigate('Home');
                    break;
                // 分享好友
                case 4:
                    // 删除分享监听
                    shareRemoveListener && shareRemoveListener();
                    commonShare('friends',channelID,shareUrl);
                    this._shareAddListener('share_friend');
                    break;
                // 分享朋友圈
                case 5:
                    // 删除分享监听
                    shareRemoveListener && shareRemoveListener();
                    commonShare('friendsCircle',channelID,shareUrl);
                    this._shareAddListener('share_circle_friends');
                    break;
                // 去答题
                case 6: navigation.navigate('AnswerQuestions');
                    break;
                // 绑定手机
                case 7: navigation.navigate('BindPhone');
                    break;
                // 填入邀请
                case 8: navigation.navigate('BindInviteCode',{name:'Task'});
                    break;
            }
        }
        else{
            // 领取完成了
            if(parseInt(status) === 1){
                return null;
            }
            // 去领取
            else if(parseInt(status) === 2){
                toPickUp && toPickUp(id);
                Toast.show('你已成功领取任务金币和经验值',{duration: 2000, position: -55});
            }
        }
    }
    // 公共分享
    _shareAddListener(type: string){
        const { addTask } = this.props;

        shareAddListener(_ => {
            addTask && addTask(type);
            Toast.show('你已成功分享好友或朋友圈',{duration: 2000, position: -55});
        });
    }
    // 等级进度
    _renderLevel(){
        const { levelWidth } = this.state;
        const { taskCenterInfo } = this.props;
        const _info: Object = taskCenterInfo && parseInt(taskCenterInfo.code) === 0 && taskCenterInfo.data.info;
        const _level : number = isLogout(this.props) ? 0 : (_info ? _info.level.level : 0);
        const _todayExperience: number = isLogout(this.props) ? 0 : (_info ? _info.todayExperience : 0);
        const _experience: number = isLogout(this.props) ? 0 : (_info ? Number(_info.experience) : 0);
        const _levelMax: number = isLogout(this.props) ? 0 : (_info ? _info.level.max : 1);
        const _width: number = isLogout(this.props) ? 0 : ((_experience / _levelMax) * levelWidth);

        return (
            <View style={styles.levelBox}>
                <View style={[styles.level]}>
                    <Text style={[styles.fontFamily,styles.levelText]}>LV{ _level }</Text>
                </View>
                <View style={[styles.levelProgressBox,{}]}>
                    <View style={styles.levelProgressTop}>
                        <Text style={[styles.levelProgressTopText,styles.fontFamily]}>
                            今日已获得<Text style={{fontSize:14, color:'#ffc755'}}> { _todayExperience } </Text>经验值
                        </Text>
                        <Text style={[styles.levelProgressTopText,styles.fontFamily]}>
                            <Text style={{color:'#ffc755'}}>{ _experience }</Text> / { _levelMax }
                        </Text>
                    </View>
                    <View style={[styles.levelProgressBottom]}>
                        <View onLayout={this._onLayout.bind(this)} style={styles.levelProgress}>
                            <LinearGradient colors={['#ffc754', '#fcf4a8']} style={[styles.levelInnerProgress,{width: _width}]}/>
                        </View>
                    </View>
                </View>
                <View style={[styles.level]}>
                    <Text style={[styles.fontFamily,styles.levelText]}>LV{ _level + 1 }</Text>
                </View>
            </View>
        );
    }
    // 获取进度条的总长
    _onLayout(event = {}){
        const width = event.nativeEvent.layout.width;
        this.setState({levelWidth: width});
    }
    // 头部栏
    _renderHeaderColumn(){
        return (
            <HeaderBox
                isEdit={true}
                isText={true}
                text={'任务中心'}
                isArrow={false}
                backgroundColor={'transparent'}
                borderBottomColor={'transparent'}
                titleColor={'#FFF'}
                arrowColor={'#FFF'}
                rightElement={
                    <TouchableOpacity onPress={this._LevelPrivileges.bind(this)} activeOpacity={0.5} style={styles.rightBox}>
                        <Text style={styles.rightBoxText}>等级特权</Text>
                    </TouchableOpacity>
                }
            />
        );
    }
    // 调转至等级特权说明
    _LevelPrivileges(){
        const { navigation } = this.props;

        if(isLogout(this.props)){
            Toast.show('登录查看等级特权哦',{
                position: -55,
                backgroundColor: 'rgb(0,117,248)',
                textColor:'#FFF',
                duration: 1500
            });
            return;
        }

        navigation.navigate('LevelPrivileges');
    }
    // 去登录
    _login(){
        const { navigation } = this.props;

        if(isLogout(this.props)){
            return navigation.navigate('Login');
        }

        return null;
    }
    // 基本信息
    _renderBaseInfo(){
        const { userData, taskCenterInfo} = this.props;
        const iconUserDefault = require('../imgs/user_default_avarta.png');
        const missionCenterTitleBase: number = require('../imgs/taskCenter/mission_center_title_base.png');
        const _userData: boolean = userData && userData.login;
        const _info: Object = taskCenterInfo && Number(taskCenterInfo.code) === 0 && taskCenterInfo.data.info;
        const _level : number = _userData ? (_info ? _info.level.level : 0) : 0;
        const _name: string = _userData ? userData.name : '无名';

        return (
            <ImageBackground
                source={missionCenterTitleBase}
                style={styles.taskHeader}
                imageStyle={{resizeMode:'cover'}}
            >
                { this._renderHeaderColumn() }
                <TouchableOpacity activeOpacity={1} onPress={this._login.bind(this)} style={[styles.userInfo]}>
                    <View style={styles.userTx}>
                        <Image source={_userData ? {uri:userData.avatar} : iconUserDefault} resizeMode={'contain'} style={styles.userTxImage}/>
                    </View>
                    <View style={[styles.userMsg]}>
                        <View style={[styles.uBox,{alignItems:'flex-start'}]}>
                            <Text style={[styles.userName, styles.fontFamily]}>{ _name }</Text>
                        </View>
                        <View style={[styles.uBox,{alignItems:'flex-end'}]}>
                            <View style={styles.djBox}>
                                <Text style={[styles.userText,styles.fontFamily]}>LV{ _level }</Text>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
                { this._renderLevel() }
                <View style={styles.taskHeaderPrompt}>
                    <Text style={[styles.fontFamily,styles.taskHeaderPromptText]}>温馨提示：完成新手任务，可获得大量经验值提升等级</Text>
                </View>
            </ImageBackground>
        );
    }
    // 任务切换 - demo
    _renderTask(){
        const { height, width } = Dimensions.get('window');
        const { taskCenterInfo } = this.props;
        const _task = (taskCenterInfo && taskCenterInfo.data && Object.values(taskCenterInfo.data.task)) || [];
        const bodyHeight = height - 285;

        return (
            !isLogout(this.props) ?
            <View style={[styles.body,{height: '100%'}]}>
                <CommonMenu
                    manualControl={true}
                    tabs={['每日任务','成就任务']}
                    menuNumber={2}
                    goToPage={this._goToPage.bind(this)}
                />
                <ScrollView
                    ref={ref => this.ScrollViewRef = ref}
                    horizontal={true}
                    pagingEnabled={true}
                    style={{flex:1}}
                    showsHorizontalScrollIndicator={false}
                    scrollEnabled={false}
                >
                    <ScrollView showsVerticalScrollIndicator={false} style={[styles.menuContent,{width: width}]}>
                        { _task.length !== 0 ? _task.map((item,index) => {return (parseInt(item.type) !== 1 && this._taskRows(item,index))}) : null}
                    </ScrollView>
                    <ScrollView showsVerticalScrollIndicator={false} style={[styles.menuContent,{width: width}]}>
                        { _task.length !== 0 ? _task.map((item,index) => {return (parseInt(item.type) !== 2 && this._taskRows(item,index))}) : null }
                    </ScrollView>
                </ScrollView>
            </View> :
            <NoData
                isBtn={true}
                btnText={'快登录吧'}
                btnClickFunc={this._goLogin.bind(this)}
                source={require('../imgs/default/cache.png')}
                isText={true}
                text={'登录后获取任务赚现金'}
            />
        );
    }
    // 内容切换并执行动画
    _goToPage(index){
        const { width } = Dimensions.get('window');
        this.ScrollViewRef && this.ScrollViewRef.scrollTo({x: (index * width), y: 0, animated: true});
    }
    _goLogin(){
        const { navigation } = this.props;
        navigation.navigate('Login');
    }
    render(){
        return (
            <View style={styles.content}>
                { this._renderBaseInfo() }
                { this._renderTask() }
            </View>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    let data = state.getIn(['task']);
    let userData = state.getIn(['user']);

    if (Immutable.Map.isMap(data)) {
        data = data.toJS();
    }

    if (Immutable.Map.isMap(userData)) {
        userData = userData.toJS();
    }

    return { ...ownProps, ...data, ...userData };
};

export default withNavigationFocus(connect(mapStateToProps,{loadTaskCenterInfo,toPickUp,addTask})(TaskCenter));