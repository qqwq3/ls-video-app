
/*宝箱*/

'use strict';

import React,{ Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image, Animated, Easing, ImageBackground } from 'react-native';
import LinearGradient  from 'react-native-linear-gradient';
import Toast from 'react-native-root-toast';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import BackgroundTimer from 'react-native-background-timer';
import { withNavigationFocus } from 'react-navigation-is-focused-hoc';
import { commonShare, shareAddListener, shareRemoveListener } from '../../common/wxShare';
import { addTask } from '../../actions/task';
import { initTBox, openTBox } from '../../actions/task';
import HeaderBox from '../../common/HeaderBox';
import { statusBarSetPublic, isLogout } from "../../common/tool";

const images = {
    golden_closed_small: require('../imgs/treasurebox/golden_closed_small.png'),
    golden_closed_small_gray: require('../imgs/treasurebox/golden_closed_small_gray.png'),
};

class TreasureBox extends Component{
    constructor(props){
        super(props);
        this.state={
            //是否开启获取更多金币按钮
            isShowMore:false,
            //是否打开宝箱按钮
            isOpen:false,
            //是否摇动宝箱
            isShakeTreasureBox:false,
            //抖动角度
            shakeRotate:'0deg',
            rotateValue: new Animated.Value(0),
            //宝箱开关状态
            isOpenTreasureBox: false,
            //光环旋转初始值
            ringRotation:new Animated.Value(0),
            //是否显示model
            isShowModel:false,
            data:{},
            //任务id
            taskId:2,
            //奖励
            reward:0,
            //倒计时
            countDown:'',
            //分享朋友圈金币
            shareCirCoin:0,
            //是否显示图片按钮
            isShowBtn:false,
            currentState: false,
        };
        this.hh = 0;
        this.mm = 0;
        this.ss = 0;
        this.totalTime = 14400;
        this.intervalId = null;
        this.initTime = Date.now();
        this.openTime =  Date.now();
        this.errorTime = Date.now();
    }
    componentWillMount(){
        this.setState({currentState: true});
    }
    componentWillUnmount() {
        this.intervalId && BackgroundTimer.clearTimeout(this.intervalId);
        // 删除分享监听
        shareRemoveListener && shareRemoveListener();
    }
    componentWillReceiveProps(nextProps) {
        const { initTBox } = this.props;

        // 进入本组件的一些处理
        if (!this.props.isFocused && nextProps.isFocused) {
            // 初始化宝箱
            initTBox && initTBox();
            statusBarSetPublic && statusBarSetPublic('#0E4E70','light-content',true);
        }

        if(nextProps.box && nextProps.box.initTBox && this.initTime < nextProps.box.timeUpdated){
            this.initTime = nextProps.box.timeUpdated;
            let initData= nextProps.box.initTBox;
            if(initData.code === 0){
                if(initData.data.status){
                    this.setState({isShowBtn:true,data: initData.data, isOpenTreasureBox: initData.data.status});
                }
                else{
                    this.totalTime = initData.data.time;
                    this.setState({isShowBtn:true,isOpenTreasureBox:initData.data.status});
                    if(this.intervalId === null){
                        this._countDownTime();
                    }
                }
            }else{
                // Toast.show(initData.message,{ duration: 2000, position: -55 });
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
            Toast.show(error.message,{ duration: 2000, position: -55 });
        }

        if(nextProps.openBox && nextProps.openBox.openTBox && this.openTime < nextProps.openBox.timeUpdated){
            this.openTime = nextProps.openBox.timeUpdated;
            let openData = nextProps.openBox.openTBox;
            if(openData.code === 0){
                this.setState({isShowBtn:true,reward: openData.data.reward, shareCirCoin: openData.data.taskGold});
            }else{
                // Toast.show(openData.message,{ duration: 2000, position: -55 });
            }
        }

        // 离开本组件的一些处理
        if (this.props.isFocused && !nextProps.isFocused) {
            this.intervalId && BackgroundTimer.clearTimeout(this.intervalId);
        }
    }
    // 返回
    _goBack(){
        const { navigation } = this.props;
        navigation.goBack();
    }
    // 调转任务中心
    _moreCoinBtn(){
        const { navigation } = this.props;
        navigation.navigate('Login');
    }
    _moreCoin(){
        return(
            <LinearGradient colors={['#FD9B42', '#FFD078',]} style={[styles.btnMoreBox]}>
               <TouchableOpacity
                   style={{flex:1,flexDirection:'row',justifyContent:'center',alignItems:'center'}}
                   onPress ={() => this._moreCoinBtn()}
               >
                   <Text style={[styles.fontFamily,styles.btnText]}>登录开启宝箱</Text>
               </TouchableOpacity>
            </LinearGradient>
        );
    }
    _chickOpenTreasureBox(){
        const { taskId } = this.state;
        const { openTBox } = this.props;

        //开启宝箱,获取数据
        openTBox && openTBox(taskId);
        //旋转宝箱
        this._shackTreasureBox();
        //显示光环
        //弹出金币面板
        setTimeout(()=>{this.setState({isShowModel:true})},2000);
        this._countDownTime();
    }
    //倒计时
    _countDownTime(){
        this.intervalId = BackgroundTimer.setInterval(() => {

            if (this.totalTime>=0) {
                this.hh = Math.floor(this.totalTime/60/60%24);
                this.mm = Math.floor(this.totalTime/60%60);
                this.ss = Math.floor(this.totalTime%60);
            }

            this.hh = this.hh<10?("0" + this.hh):this.hh;   //时
            this.mm = this.mm<10?("0" + this.mm):this.mm;   //分
            this.ss = this.ss<10?("0" + this.ss):this.ss;   //秒
            this.setState({countDown:this.hh+':'+this.mm+':'+this.ss});
            this.totalTime--;

            if (this.totalTime < 0) {
                this.setState({isOpenTreasureBox:true});
                BackgroundTimer.clearTimeout(this.intervalId);
            }
        }, 1000);
    }
    _showOpenTreasureBoBtn(){
        return(
            <LinearGradient colors={['#FFD078', '#FD9B42',]} style={[styles.btnMoreBox,{marginTop:45,elevation:2.5}]}>
                <TouchableOpacity activeOpacity={0.50} style={styles.btnOpenBox} onPress={()=>this._chickOpenTreasureBox()}>
                    <View><Image source={images.golden_closed_small}  resizeMode={'contain'}/></View>
                    <View><Text style={[styles.fontFamily,styles.btnText]}>开启宝箱</Text></View>
                </TouchableOpacity>
            </LinearGradient>
        );
    }
    _showCloseTreasureBoxBtn(){
        const { countDown } = this.state;

        return(
            <LinearGradient colors={['#efefef', '#c0c0c0',]} style={[styles.btnMoreBox,{marginTop:50}]}>
                <View style={styles.btnOpenBox}>
                    <View>
                        <Image source={images.golden_closed_small_gray}  resizeMode={'contain'}/>
                    </View>
                    <View style={{alignItems:'center'}}>
                        <Text style={[styles.fontFamily,{color:'#404040',fontSize:12}]}>据宝箱打开还有</Text>
                        <Text style={[styles.fontFamily,{color:'#404040',fontSize:16}]}>{ countDown || '' }</Text>
                    </View>
                </View>
            </LinearGradient>
        );
    }
    //开始抖动
    _shackTreasureBox(){
        this.state.rotateValue.setValue(0);
        Animated.timing(this.state.rotateValue,{
            toValue: 1,
            duration: 1000,
            easing: Easing.linear()
        }).start(()=>{
            this.setState({isOpenTreasureBox:false,})
        });
    }
    //光环旋转动画
    _ringRotation(){
        Animated.loop(
            Animated.timing(this.state.ringRotation,{
                toValue: 1,
                duration: 5000
            })
        ).start();
    }
    //关闭宝箱图片
    _treasureBoxRender(){
        const {data} = this.state;
        let closedImg = '';

        switch(data.type){
            case 'Platinum':
                closedImg =  require('../imgs/treasurebox/platinum_closed.png');
                break;
            case 'Gold':
                closedImg =  require('../imgs/treasurebox/golden_closed.png');
                break;
            case 'Silver':
                closedImg =  require('../imgs/treasurebox/silver_closed.png');
                break;
            case 'Bronze':
                closedImg =  require('../imgs/treasurebox/bronze_closed.png');
                break;
            default:
                closedImg =  require('../imgs/treasurebox/bronze_closed.png');
        }

        return(
            <View style = {styles.treasureBoxSty}>
                <View style={[styles.treasureBoxInner]}>
                    <Animated.Image
                        style = {[{transform:[{rotate: this.state.rotateValue.interpolate({inputRange: [0,0.2,0.4,0.8,1],outputRange: ['0deg','10deg', '-10deg','10deg','0deg']})}]}]}
                        source = {closedImg}
                        resizeMode = "contain"
                    />
                </View>
            </View>
        );
    }
    //开启宝箱图片
    _openTreasureBoxImg(){
        //调动光环旋转
        this._ringRotation();
        const { data } = this.state;
        const box_open_light_effect =  require('../imgs/treasurebox/box_open_light_effect.png');
        let openImg = '';

        switch(data.type){
            case 'Platinum':
                openImg =  require('../imgs/treasurebox/platinum_open.png');
                break;
            case 'Gold':
                openImg =  require('../imgs/treasurebox/golden_open.png');
                break;
            case 'Silver':
                openImg =  require('../imgs/treasurebox/silver_open.png');
                break;
            case 'Bronze':
                openImg =  require('../imgs/treasurebox/bronze_open.png');
                break;
            default:
                openImg =  require('../imgs/treasurebox/bronze_open.png');
        }

        return(
            <View style = {styles.treasureBoxOpenSty}>
                <Animated.Image
                    style = {[{transform:[{rotate: this.state.ringRotation.interpolate({inputRange: [0,1],outputRange: ['0deg','360deg']})}]}]}
                    source = {box_open_light_effect}
                    resizeMode = "contain"
                />
                <Image style={styles.treasureBoxopenImg} source={openImg} resizeMode = "contain"/>
            </View>
        );
    }
    //分享到朋友圈
    _shareFriends(){
        // 删除分享监听
        shareRemoveListener && shareRemoveListener();
        const channelID = (global.launchSettings && global.launchSettings.channelID) || 'nice001';
        const shareUrl = (global.launchSettings && global.launchSettings.shareUrl) || 'http://www.xiyunkai.cn';
        commonShare && commonShare('friendsCircle',channelID,shareUrl);
        this._shareAddListener('share_circle_friends');
    }
    // 公共分享
    _shareAddListener(type: string){
        const { addTask } = this.props;

        shareAddListener && shareAddListener(_ => {
            addTask && addTask(type);
            Toast.show('你已成功分享好友或朋友圈',{ duration: 2000, position: -55 });
        });
    }
    _onRequestClose(){
       this.setState({isShowModel:false});
    }
    _isShowModal(){
        const { isShowModel, reward, shareCirCoin } = this.state;
        const popup_treasurebox = require('../imgs/treasurebox/popup_treasurebox.png');
        const icon_popup_close = require('../imgs/treasurebox/icon_popup_close.png');

        return (
            <Modal
                visible={isShowModel}
                transparent={true}
                onRequestClose={this._onRequestClose.bind(this)}
                animationType={'fade'}
            >
                <View  style={styles.modalContent}>
                    <ImageBackground imageStyle={{width:280,height:330}} source={popup_treasurebox} style={styles.modalBox}>
                        <Text style={[styles.fontFamily,{color:'#fff',fontSize:30,marginTop:20}]}>+{ reward }金币</Text>
                        <Text style={[styles.fontFamily,{color:'#fff',fontSize:14,marginTop:10}]}>近期邀请与观看越多,获得金币就越多</Text>
                        <TouchableOpacity
                            style={styles.shareFriendSty}
                            onPress={()=> this._shareFriends()}
                        >
                            <Text style={[styles.fontFamily,{color:'#ff874b',fontSize:14}]}>分享朋友圈再获得{ shareCirCoin }金币</Text>
                        </TouchableOpacity>
                        <Text style={[styles.fontFamily,{color:'#fff',fontSize:10,marginTop:15}]}>分享到朋友圈不仅可以领取{ shareCirCoin }金币</Text>
                        <Text style={[styles.fontFamily,{color:'#fff',fontSize:10,marginTop:3}]}>邀请好友还能奖励8元现金,可立即提现哦</Text>
                        <TouchableOpacity
                            activeOpacity={0.50}
                            style={{marginTop:40}}
                            onPress={this._onRequestClose.bind(this)}
                        >
                            <Image source={icon_popup_close} resizeMode={'contain'}/>
                        </TouchableOpacity>
                    </ImageBackground>
                </View>
            </Modal>
        );
    }
    render(){
        const { isOpenTreasureBox,isShowBtn } = this.state;
        const _isLogout = isLogout(this.props);

        return(
            <View style={styles.content}>
                <LinearGradient colors={['#0E4E70', '#1D0538',]} style={{height:304,justifyContent:'flex-start',}}>
                    <HeaderBox
                        isText={true}
                        backgroundColor={'transparent'}
                        text={'金币宝箱'}
                        titleColor={'#FFF'}
                        borderBottomColor={'transparent'}
                        isArrow={true}
                        goBack={this._goBack.bind(this)}
                        arrowColor={'#FFF'}
                    />
                    { !_isLogout ?  (isShowBtn ?(isOpenTreasureBox ? this._treasureBoxRender() : this._openTreasureBoxImg()):null): this._treasureBoxRender() }
                </LinearGradient>
                <View style={styles.textBox}>
                    <Text style={[styles.fontFamily,{color:'#404040',fontSize:16,}]}>玩法介绍:</Text>
                    <Text style={[styles.fontFamily,{color:'#404040',fontSize:14,marginTop:20}]}>1.宝箱每4小时可打开一次</Text>
                    <Text style={[styles.fontFamily,{color:'#404040',fontSize:14,marginTop:10}]}>2.近期邀请的好友越多,宝箱可开出的金币越多</Text>
                </View>
                <View style={styles.btnBox}>
                    {
                        _isLogout ?
                        this._moreCoin() :
                        isShowBtn ? (isOpenTreasureBox ? this._showOpenTreasureBoBtn() : this._showCloseTreasureBoxBtn()) : null
                    }
                </View>
                { this._isShowModal() }
            </View>
        );
    }
}

const styles = StyleSheet.create({
    content:{
        flex:1,
        backgroundColor:'#FFF'
    },
    shareFriendSty:{
        width:200,
        height:40,
        backgroundColor:"#fff",
        alignItems:'center',
        justifyContent:'center',
        borderRadius:40,
        marginTop:140,
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
        justifyContent:'center',
        alignItems:'center',
    },
    modalBox:{
        width:280,
        height:330,
        alignItems:'center',
    },
    treasureBoxopenImg:{
        position:'absolute',
        zIndex:100,
        bottom:80,
    },
    treasureBoxOpenSty:{
        height:260,
        marginBottom:0,
        flexDirection:'row',
        justifyContent:'center',
        position:'relative',
    },
    treasureBoxInner:{
        flexDirection:'row',
        justifyContent:'center',
    },
    treasureBoxSty:{
        height:120,
        marginTop:70,
    },
    btnOpenBox:{
        flex:1,
        flexDirection:'row',
        justifyContent:'space-between',
        paddingRight:40,
        paddingLeft:40,
        alignItems:'center',
    },
    btnText:{
      color:'#3d0f00',
        fontSize:18,
    },
    btnMoreBox:{
      height:50,
      width:220,
      marginTop:50,
      borderRadius:50,
    },
    btnBox:{
      flex:1,
      alignItems:'center',
    },
    textBox:{
        marginTop:40,
        marginLeft:30,
    },
    fontFamily: {
        fontFamily: 'PingFangSC-Medium',
    },
});

const mapStateToProps = (state, ownProps) => {
    let data = state.getIn(['task']);
    let userData = state.getIn(['user']);

    if (Immutable.Map.isMap(data)) { data = data.toJS() }
    if (Immutable.Map.isMap(userData)) { userData = userData.toJS() }
    return { ...ownProps, ...data, ...userData };
};

export default withNavigationFocus(connect(mapStateToProps, {initTBox, openTBox, addTask})(TreasureBox));