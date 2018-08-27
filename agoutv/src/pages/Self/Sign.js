
/*签到*/

import React,{ Component } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Image,
    TouchableOpacity,
    ScrollView,
    Modal
} from 'react-native';
import LinearGradient  from 'react-native-linear-gradient';
import Toast from 'react-native-root-toast';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import { withNavigationFocus } from 'react-navigation-is-focused-hoc';
import { initSign, sign } from  '../../actions/task';
import { commonShare, shareAddListener, shareRemoveListener } from '../../common/wxShare';
import { addTask } from '../../actions/task';
import HeaderBox from '../../common/HeaderBox';
import { statusBarSetPublic, height, width, isLogout } from "../../common/tool";

class Sign extends Component<{}>{
    constructor(props){
        super(props);
        this.state = {
            singed: true,
            cycleDays: -1,
            visible: false,
            addGold: 0,
            isShowSignBtn:false,
            taskGold:0,
            currentState: false
        };
        // 临时数据
        this.signArr = [
            {content:'+10金币',coin:10},
            {content:'+15金币',coin:15},
            {content:'+20金币',coin:20},
            {content:'+25金币',coin:25},
            {content:'+30金币',coin:30},
            {content:'+35金币',coin:35},
            {content:'+40金币',coin:40}
        ];
        this.initTime = Date.now();
        this.signTime = Date.now();
        this.errorTime = Date.now();
    }
    componentWillMount() {
        // 设置设备状态栏
        statusBarSetPublic && statusBarSetPublic('#FF636D','light-content',true);
        this.setState({currentState: true});
    }
    componentWillReceiveProps(nextProps) {
        const { initSign} = this.props;

        // 进入本组件的一些处理
        if (!this.props.isFocused && nextProps.isFocused) {
            initSign && initSign();
        }

        if(nextProps.signInit && nextProps.signInit.initSign && this.initTime < nextProps.signInit.timeUpdated){
            this.initTime = nextProps.signInit.timeUpdated;
            let initData = nextProps.signInit.initSign;

            if(initData.code === 0){
                this.setState({
                    singed: initData.data.singed,
                    cycleDays: initData.data.cycleDays,
                    initState: true,
                    isShowSignBtn: true
                });
            }
            else{
                // Toast.show(initData.message,{duration:3500});
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

        if(nextProps.signPost && nextProps.signPost.sign && this.signTime < nextProps.signPost.timeUpdated ){
            this.signTime =  nextProps.signPost.timeUpdated;
            let signData = nextProps.signPost.sign;

            if(signData.code === 0){
                this.setState({
                    singed: true,
                    cycleDays: signData.data.cycleDays,
                    addGold: signData.data.reward,taskGold:
                    signData.data.taskGold,visible: true
                });
            }
            else{
                // Toast.show(signData.message,{duration:3500});
            }
        }
        // 离开本组件的一些处理
        if (this.props.isFocused && !nextProps.isFocused) {
            // 删除分享监听
            shareRemoveListener && shareRemoveListener();
            this.setState({currentState: false});
        }
    }
    componentWillUnmount() {
        // 删除分享监听
        shareRemoveListener && shareRemoveListener();
    }
    // 返回
    _goBack(){
        const { navigation } = this.props;
        navigation.goBack();
    }
    // 赚更多金币
    _getMoreCoin(){

    }
    // 去登录
    _goLogin(){
        const { navigation } = this.props;
        navigation.navigate('Login');
    }
    // 去签到
    _goSign(){
        const { sign } = this.props;
        sign && sign();
    }
    // 头部导航 - demo
    renderNav(){
        const iconShare = require('../imgs/signImg/icon_share_white.png');

        return (
            <HeaderBox
                isText={true}
                arrowColor={'#FFF'}
                backgroundColor={'#FF636D'}
                text={'7日签到赢现金红包'}
                titleColor={'#FFF'}
                borderBottomColor={'transparent'}
                isArrow={true}
                goBack={this._goBack.bind(this)}
                isEdit={true}
                rightElement={
                    <TouchableOpacity style={styles.shareClick} activeOpacity={0.50} onPress={this._shareClick.bind(this)}>
                        <Image source={iconShare} resizeMode={'contain'} style={styles.shareImage}/>
                    </TouchableOpacity>
                }
            />
        );
    }
    // 分享
    _shareClick(){
        // 删除分享监听
        shareRemoveListener && shareRemoveListener();
        const channelID = (global.launchSettings && global.launchSettings.channelID) || 'nice001';
        const shareUrl = (global.launchSettings && global.launchSettings.shareUrl) || 'http://www.xiyunkai.cn';
        commonShare('friendsCircle',channelID,shareUrl);
        this._shareAddListener('share_circle_friends');
    }
    // 分享朋友监听
    _shareAddListener(type: string){
        const { addTask } = this.props;
        shareAddListener(_ => {
            addTask && addTask(type);
            Toast.show('你已成功分享好友或朋友圈',{duration: 2000, position: -55});
        });
    }
    // 头部 - demo
    renderHeader(){
        const iconBtnSign = require('../imgs/signImg/btn_sign.png');
        const iconBtnSigned = require('../imgs/signImg/btn_signed.png');
        const _isLogout = isLogout(this.props);
        const { singed ,isShowSignBtn} = this.state;

        return (
            <LinearGradient colors={['#FF636D', '#FF8872',]} style={styles.headerBox}>
                {
                    _isLogout ?
                    <View style={styles.headerX}>
                        <Text style={[styles.fontFamily,styles.headerXText]}>登录后签到可领取现金红包哦</Text>
                        <TouchableOpacity onPress={this._goLogin.bind(this)} activeOpacity={0.50} style={styles.headerXBtn}>
                            <Text style={[styles.fontFamily,styles.headerXBtnText]}>马上去登录</Text>
                        </TouchableOpacity>
                    </View> :
                    <View>
                        {
                            isShowSignBtn?(
                            singed ?
                            <View style={[styles.headerX,{paddingTop:15}]}>
                                {/*<Text style={[styles.fontFamily,styles.headerXText,{marginTop:55}]}>已签到</Text>*/}
                                {/*<TouchableOpacity onPress={this._getMoreCoin.bind(this)} activeOpacity={0.50} style={styles.headerXBtn}>*/}
                                    {/*<Text style={[styles.fontFamily,styles.headerXBtnText]}>点这里赚更多金币</Text>*/}
                                {/*</TouchableOpacity>*/}
                                <Image source={iconBtnSigned} resizeMode={'contain'} style={styles.headerSingImg}/>
                            </View> :
                            <TouchableOpacity onPress={this._goSign.bind(this)} activeOpacity={0.50} style={styles.headerSignBtn}>
                                <Image source={iconBtnSign} resizeMode={'contain'} style={styles.headerSingImg}/>
                            </TouchableOpacity>
                            ):null
                        }
                    </View>
                }
                <View style={styles.headerPrompt}>
                    <Text style={[styles.fontFamily,styles.headerPromptText]}>
                        每日按下列要求完成签到即可领取现金红包
                    </Text>
                </View>
            </LinearGradient>
        );
    }
    // 渲染 - demo
    _renderItem(item,index){
        const { cycleDays } = this.state;
        const iconBadgeGray = require('../imgs/signImg/badge_gray.png');
        const iconBadgeLight = require('../imgs/signImg/badge_light.png');
        const source = (cycleDays !== -1 && cycleDays >= index) ?  iconBadgeLight : iconBadgeGray;
        const color = (cycleDays !== -1 && cycleDays >= index) ?  '#404040' : '#c0c0c0';

        return (
            <View key={index} style={[styles.rows]}>
                <View style={styles.cellLeft}>
                    <View style={styles.cellLeftHead}>
                        <Image source={source} resizeMode={'contain'} style={styles.signLogo}/>
                        <Text style={[styles.fontFamily,styles.signLogoText,{color: color}]}>{ index + 1 }天</Text>
                    </View>
                    { index < 6 ?  <View style={[styles.cellLine,{backgroundColor: color}]}/> : null }
                </View>
                <View style={[styles.cellRight]}>
                    <Text style={[styles.fontFamily,styles.nameText,{color: color}]}>{ item.content }</Text>
                </View>
            </View>
        );
    }
    // 身体 - demo
    renderBody(){
        return (
            <ScrollView showsVerticalScrollIndicator={false} style={styles.body}>
                <View style={[styles.emptyView]} />
                { this.signArr.map((item,index) => this._renderItem(item,index)) }
            </ScrollView>
        );
    }
    // 弹出层 - demo
    renderModel(){
        const { visible, addGold,taskGold } = this.state;
        const popupTreasure = require('../imgs/treasurebox/popup_treasurebox.png');
        const iconPopupClose = require('../imgs/treasurebox/icon_popup_close.png');

        return (
            <Modal
                visible={visible}
                transparent={true}
                onRequestClose={this._closeModal.bind(this)}
                animationType={'fade'}
            >
                <View  style={styles.modalContent}>
                    <View style={styles.modalBox}>
                        <Image source={popupTreasure} resizeMode={'cover'} style={styles.modalImage}/>
                        <View style={styles.modalInner}>
                            <Text style={[styles.fontFamily,{color:'#fff',fontSize:24,marginTop:30}]}>+{ addGold }金币</Text>
                            <Text style={[styles.fontFamily,{color:'#fff',fontSize:14,marginTop:5}]}>近期邀请与观看越多,获得金币就越多</Text>
                            <TouchableOpacity activeOpacity={0.50} style={[styles.shareFriendSty,{marginTop:130}]} onPress={this._shareClick.bind(this)}>
                                <Text  style={[styles.fontFamily,{color:'#ff874b',fontSize:14}]}>分享朋友圈再获得{taskGold}金币</Text>
                            </TouchableOpacity>
                            <Text style={[styles.fontFamily,{color:'#fff',fontSize:12,marginTop:12}]}>分享到朋友圈不仅可以领取{taskGold}金币</Text>
                            <Text style={[styles.fontFamily,{color:'#fff',fontSize:12,marginTop:3}]}>邀请好友还能奖励8元现金,可立即提现哦</Text>
                        </View>
                    </View>
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
    render(){
        return (
            <View style={styles.content}>
                { this.renderNav() }
                { this.renderHeader() }
                { this.renderBody() }
                { this.renderModel() }
            </View>
        );
    }
}

const styles = StyleSheet.create({
    shareFriendSty:{
        width:200,
        height:40,
        backgroundColor:"#fff",
        alignItems:'center',
        justifyContent:'center',
        borderRadius:40
    },
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
    shareImage:{
        width:16,
        height:16,
    },
    shareClick:{
        position:'absolute',
        top:0,
        right:0,
        bottom:0,
        height:40,
        width:80,
        zIndex:200,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'flex-end',
        paddingRight:15
    },
    fontFamily: {
        fontFamily: 'PingFangSC-Medium'
    },
    headerX:{
        justifyContent:'center',
        alignItems:'center'
    },
    headerXBtnText:{
        fontSize:18,
        color:'#ff874b'
    },
    headerXBtn:{
        marginTop:20,
        height:40,
        borderRadius:60,
        width:200,
        backgroundColor:'#fff',
        justifyContent:'center',
        alignItems:'center',
        elevation:2.5
    },
    headerXText:{
        marginTop:26,
        color:'#FFF',
        fontSize:22
    },
    nameText:{
        fontSize:12,
        color:'#c0c0c0'
    },
    emptyView:{
        height:30
    },
    cellLeft:{
        width:60
    },
    signLogoText:{
        fontSize:10,
    },
    signLogo:{

    },
    cellLeftHead:{
        overflow:'hidden',
        alignItems:'flex-end',
        justifyContent:'center'
    },
    cellLine:{
        height:25,
        width:1,
        backgroundColor:'#c0c0c0',
        alignSelf: 'flex-end',
        marginRight:8
    },
    cellRight:{
        flexDirection:'row',
        flex:1,
        paddingLeft:30,
        paddingTop:12
    },
    rows:{
        position:'relative',
        flexDirection:'row'
    },
    headerPromptText:{
        color:'#fff',
        fontSize:12,
    },
    body:{
        height: height - 180,
        position:'relative'
    },
    headerSingImg:{
        width:100,
        height:100,
    },
    headerPrompt:{
        width:"100%",
        position:'absolute',
        left:0,
        bottom:0,
        paddingBottom:22,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center'
    },
    content:{
        flex:1,
        backgroundColor:'#FFF',
    },
    headerSignBtn:{
        width:100,
        height:100,
        marginTop:20
    },
    headerBox:{
        height:180,
        overflow:'hidden',
        position:'relative',
        alignItems:'center'
    },
});

const mapStateToProps = (state, ownProps) => {
    let data = state.getIn(['task']);
    let userData = state.getIn(['user']);

    if (Immutable.Map.isMap(data)) { data = data.toJS() }
    if (Immutable.Map.isMap(userData)) { userData = userData.toJS() }
    return { ...ownProps, ...data, ...userData };
};

export default withNavigationFocus(connect(mapStateToProps, { initSign, sign, addTask })(Sign));
















