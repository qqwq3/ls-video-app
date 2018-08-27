
'use strict';

import React,{ Component } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StatusBar, Dimensions } from 'react-native';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import { withNavigationFocus } from 'react-navigation';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { Styles, ScaledSheet, Img, Fonts, Colors, BackgroundColor } from "../../common/Style";
import TabBarIcon from '../../components/TabBarIcon';
import { tab, my, agent} from "../../common/Icons";
import Rows from '../../components/Rows';
import { infoToast, statusBarSet, width } from "../../common/Tool";
import { VipData, MyData, SubmitApply, deleteUserData } from "../../actions/User";
import BaseComponent from "../../components/BaseComponent";
import StatusBarSet from '../../components/StatusBarSet';
import { fineCommonRemove, removeUserSession } from "../../common/Storage";
import { updateBookshelf } from '../../actions/LocalAction';

type Props = {};

class My extends BaseComponent<Props>{
    static navigationOptions = ({navigation, screenProps}) => ({
        tabBarIcon: ({focused}) => (
            <TabBarIcon
                focused={focused}
                defaultIcon={tab.my.defaultIcon}
                activeIcon={tab.my.activeIcon}
            />
        ),
        tabBarLabel: '我的',
        header: null,
        statusColor: null,
        statusFont: null,
    });
    constructor(props){
        super(props);
        this.state = {
            statusBarBackgroundColor: '#FFFFFF',
            statusBarFontColor:'dark-content'
        };
        this.updateTime = Date.now();
    }
    componentWillMount(){
        this.props.loadScopeAndState && this.props.loadScopeAndState();
    }
    componentWillReceiveProps(nextProps) {
        super.componentWillReceiveProps(nextProps);

        this._loginOvertime(nextProps);

        // 进入本组件
        if(!this.props.isFocused && nextProps.isFocused){
            this.setState({statusBarBackgroundColor: '#f3916b',statusBarFontColor:'light-content'});

            if (this.isAuthorized()) {
                this.props.MyData && this.props.MyData();
                this.props.SubmitApply && this.props.SubmitApply();
            }

            this._loginOvertime(nextProps);
        }

        // 离开本组件
        if(this.props.isFocused && !nextProps.isFocused){
            this.setState({statusBarBackgroundColor: '#FFFFFF', statusBarFontColor:'dark-content'});
        }

        if(nextProps && nextProps.applyAgentTimeUpdated > this.updateTime && nextProps.messageKeys && nextProps.messageKeys === 'my'){
            this.updateTime = Date.now();

            let applyState = parseInt(nextProps.state);

            if (applyState === 1) {
                const { navigation } = nextProps;

                return navigation && navigation.navigate('AgentHtml', {
                    agent: {loginStatus : nextProps.loginStatus, agentAdminUrl : nextProps.agentAdminUrl}
                });
            }
            else if (applyState === 2) {
                return infoToast("您的账号出了点问题，请联系客服");
            }
            else if (applyState === 3) {
                return infoToast("申请中，请耐心等待");
            }
        }
    }
    // 登录超时 - 处理 - function
    _loginOvertime(nextProps: any | Object){
        if(nextProps.error && Number(nextProps.error.code) === 401){
            // 清除用户相关的所有数据
            this.props.deleteUserData && this.props.deleteUserData();

            // 删除所有书籍的缓存阅读记录
            fineCommonRemove && fineCommonRemove('allBookCapter');

            // 更新书架
            this.props.updateBookshelf && this.props.updateBookshelf(true);

            // 清除用户信息 - 本地
            removeUserSession && removeUserSession();

            // 清除redux相关的缓存
            global.persistStore && global.persistStore.purge();
        }
    }
    // 书币充值 - function
    _bookMoneyRecharge(){
        if(!this.isAuthorized()){
            return infoToast('请先登录');
        }
        const { navigation } = this.props;
        navigation && navigation.navigate('Charge');
    }
    // 开通VIP -function
    _OpenVip(){
        const { navigation } = this.props;
        const {vipDay, balance, avatar, name } = this.props;
        navigation && navigation.navigate('OpenVip',{myInfo: {vipDay, balance , avatar, name}});
    }
    _renderDay(){
        const { vipDay } = this.props;

        if(vipDay <= 3 && vipDay > 0 ){
            return <Text style={{color:'#f3916b'}}>VIP剩余:{vipDay}天</Text>
        }
    }
    // 卡片 - demo
    renderCard(){
        const { avatar, name, balance, vipDay } = this.props;

        return (
            <View style={[styles.cardBox, Styles.paddingHorizontal15, Styles.flexCenter,{marginTop:moderateScale(60)}]}>
                <View style={[styles.card, Styles.padding15]}>
                    <View style={[styles.cardHeader]}>
                        <TouchableOpacity
                            activeOpacity={1}
                            onPress={() => avatar ? {} : this._login()}
                            style={{position:'relative'}}
                        >
                            <View style={[styles.cardTx, Styles.flexCenter]}>
                                {
                                    avatar ? <Image source={{uri: avatar}} style={[styles.cardTxImage]}/> :
                                    <Image source={my.userDefault} style={[ styles.cardTxImage]}/>
                                }
                            </View>
                            <View style={{position:'absolute',right:0,zIndex:1000}}>
                                { vipDay > 0 ? <Image source={my.vipYellow}/> : <Image source={my.vipGray}/> }
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={1}
                            onPress={() => avatar ? {} : this._login()}
                        >
                        <View style={[ Styles.paddingLeft15, {justifyContent:"center", alignItems:'flex-start'}]}>
                            <Text
                                numberOfLines={1}
                                style={[Fonts.fontFamily, Fonts.fontSize15, Colors.gray_404040]}
                            >
                                { name ? name : '点击登录' }
                            </Text>
                            <View>
                               { this._renderDay() }
                            </View>
                        </View>
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.cardContent, Styles.marginTop15]}>
                        <View>
                            <View style={[ Styles.flexCenter]}>
                                <Text style={[Fonts.fontFamily, Fonts.fontSize14, Colors.gray_404040]}>我的书币</Text>
                            </View>
                            <View style={[ Styles.flexCenter]}>
                                <Text style={[Fonts.fontFamily, Fonts.fontSize20, Colors.orange_f3916b]}>
                                    { balance ? balance : 0 }
                                </Text>
                            </View>
                        </View>
                        <View style={[styles.partingLine, Styles.flexCenter]}/>
                        {/*<View style={[Styles.flex1,Styles.flexCenter,{position:'relative'}]}>*/}
                            {/*<TouchableOpacity*/}
                                {/*activeOpacity={0.5}*/}
                                {/*style={[styles.openButs, Styles.flexCenter, styles.openVipCss, {top: verticalScale(-46)}]}*/}
                                {/*onPress={this._OpenVip.bind(this)}*/}
                            {/*>*/}
                                {/*<Text style={[Fonts.fontFamily, Fonts.fontSize14, Colors.orange_f3916b]}>*/}
                                    {/*{ vipDay > 0 ? '立即续费' : '开通VIP' }*/}
                                {/*</Text>*/}
                            {/*</TouchableOpacity>*/}
                            {/*<TouchableOpacity*/}
                                {/*activeOpacity={0.5}*/}
                                {/*style={[styles.openButs, Styles.flexCenter]}*/}
                                {/*onPress={this._bookMoneyRecharge.bind(this)}*/}
                            {/*>*/}
                                {/*<Text style={[Fonts.fontFamily, Fonts.fontSize14, Colors.orange_f3916b]}>书币充值</Text>*/}
                            {/*</TouchableOpacity>*/}
                        {/*</View>*/}
                    </View>
                </View>
            </View>
        );
    }
    // 头部 - demo
    renderHeader(){
        return (
            <View style={[styles.headerContent, {backgroundColor: BackgroundColor.bg_fff}]}>
                <Image source={my.account} style={[Img.resizeModeStretch, styles.headerAccountImage,{width}]} />
                { this.renderCard() }
            </View>
        );
    }
    // 我的点评 - function
    _myComments(){
        if(!this.isAuthorized()){
            return infoToast('请先登录');
        }
        const { navigation } = this.props;
        navigation && navigation.navigate('Comments');
    }
    // 我的点评 - demo
    renderMyComments(){
        const { totalComment } = this.props;

        return (
            <Rows
                isClick={true}
                callBack={this._myComments.bind(this)}
                showLeftTitle={true}
                leftTitle={'我的点评'}
                showBottomBorder={true}
                isRightConfigure={false}
                nonConfigRightComponents={
                    <Text style={[Fonts.fontFamily, Fonts.fontSize12, Colors.gray_b2b2b2,{ marginRight: moderateScale(12)}]}>
                        { totalComment ? totalComment : "还没有点评" }
                    </Text>
                }
                showRightArrow={totalComment === 0 ? false : true}
            />
        );
    }
    // 我看过的 - function
    _iSee(){
        if(!this.isAuthorized()){
            return infoToast('请先登录');
        }
        const { navigation } = this.props;
        navigation && navigation.navigate('Historical');
    }
    // 我看过的 - demo
    renderISee(){
        const { totalRead } = this.props;

        return (
            <Rows
                isClick={true}
                callBack={this._iSee.bind(this)}
                showLeftTitle={true}
                leftTitle={'我看过的'}
                showBottomBorder={true}
                isRightConfigure={false}
                nonConfigRightComponents={
                    <Text style={[Fonts.fontFamily, Fonts.fontSize12, Colors.gray_b2b2b2, { marginRight: moderateScale(12)}]}>
                        {totalRead ? totalRead : "无" }
                    </Text>
                }
                showRightArrow={totalRead === 0 ? false : true}
            />
        );
    }
    // 线 - demo
    renderLine(){
        return (<View style={[Styles.line, {backgroundColor: BackgroundColor.bg_f1f1f1}]}/>);
    }
    // 意见反馈 - function
    _opinionFeedback(){
        if(!this.isAuthorized()){
            return infoToast('请先登录');
        }
        const { navigation } = this.props;
        navigation && navigation.navigate('Feedback');
    }
    // 意见反馈 - demo
    renderOpinionFeedback(){
        return (
            <Rows
                isClick={true}
                callBack={this._opinionFeedback.bind(this)}
                showLeftTitle={true}
                leftTitle={'意见反馈'}
                showBottomBorder={false}
                isRightConfigure={false}
                showRightArrow={true}
            />
        );
    }
    // 联系客服 - demo
    renderContactCustomerService(){
        let agentWechat = global.launchSettings && global.launchSettings.agentData && global.launchSettings.agentData.data &&
            global.launchSettings.agentData.data.wechat || 'pob9990';

        return (
            <Rows
                isClick={false}
                showLeftTitle={true}
                leftTitle={'客服微信'}
                showBottomBorder={true}
                isRightConfigure={false}
                nonConfigRightComponents={
                    <Text style={[Fonts.fontFamily, Fonts.fontSize12, Colors.gray_b2b2b2]}>{ agentWechat }</Text>
                }
            />
        );
    }
    //交流群 - demo
    renderTalke(){
        return (
            <Rows
                isClick={false}
                showLeftTitle={true}
                leftTitle={'客服QQ'}
                showBottomBorder={false}
                isRightConfigure={false}
                nonConfigRightComponents={
                    <Text style={[Fonts.fontFamily, Fonts.fontSize12, Colors.gray_b2b2b2]}>604930141</Text>
                }
            />
        );
    }
    // 我的设置 - function
    _mySetting(){
        if(!this.isAuthorized()){
            return infoToast('请先登录');
        }
        const { navigation } = this.props;
        navigation && navigation.navigate('Setting');
    }
    // 我的设置 - demo
    renderMySetting(){
        return (
            <Rows
                isClick={true}
                callBack={this._mySetting.bind(this)}
                showLeftTitle={true}
                leftTitle={'我的设置'}
                showBottomBorder={true}
                isRightConfigure={false}
                showRightArrow={true}
            />
        );
    }
    //代理后台
    _myAgent(){
        this.props.SubmitApply && this.props.SubmitApply('my');
    }
    _applyMyAgent(){
        if(!this.isAuthorized()){
            return infoToast('请先登录');
        }
        const { navigation } = this.props;
        navigation && navigation.navigate('ApplyAgent');
    }
    renderMyAgent(){
        return (
            parseInt(this.props.state) === 1?
            <View style={[{paddingVertical: verticalScale(10), paddingHorizontal: scale(10)}, Styles.flexCenter]}>
                <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={this._myAgent.bind(this)}
                >
                    <Image
                        source={agent.entrance}
                        style={[{height: verticalScale(50), width: (width - 30)}, Img.resizeModeStretch]}
                    />
                </TouchableOpacity>
            </View> :
            <View style={[{paddingVertical: verticalScale(10), paddingHorizontal: scale(10)}, Styles.flexCenter]}>
                <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={this._applyMyAgent.bind(this)}
                >
                    <Image
                        source={agent.applyEntrance}
                        style={[{height: verticalScale(50), width: (width - 30)}, Img.resizeModeStretch]}
                    />
                </TouchableOpacity>
            </View>
        );
    }
    // 内容 - demo
    renderContent(){
        return (
            <View style={[styles.content]}>
                {/*{ this.renderMyAgent() }*/}
                { this.renderMyComments() }
                { this.renderISee() }
                { this.renderMySetting() }
                { this.renderLine() }
                { this.renderOpinionFeedback() }
                { this.renderLine() }
                { this.renderContactCustomerService() }
                { this.renderTalke()}
                { this.renderBtn() }
            </View>
        );
    }
    // 登录 - function
    _login(){
        const { navigation } = this.props;
        navigation && navigation.navigate('Login');
    }
    // 登录 - demo
    renderBtn(){
        const login = this.isAuthorized();

        if(login){
            return null;
        }

        return (
            <View style={[styles.loginBtnView, Styles.flexCenter]}>
                <TouchableOpacity
                    activeOpacity={0.5}
                    style={[styles.loginBtn, Styles.flexCenter]}
                    onPress={this._login.bind(this)}
                >
                    <Text style={[Fonts.fontFamily, Fonts.fontSize16, Colors.orange_f3916b]}>登录</Text>
                </TouchableOpacity>
            </View>
        );
    }
    renderStatusBar(){
        return (
            <StatusBarSet
                backgroundColor={this.state.statusBarBackgroundColor}
                barStyle={this.state.statusBarFontColor}
            />
        );
    }
    render(){
        return (
            <ScrollView
                showsVerticalScrollIndicator={false}
                style={[Styles.container, {backgroundColor: BackgroundColor.bg_f1f1f1}]}
            >
                { this.renderHeader() }
                { this.renderContent() }
                { this.renderStatusBar() }
            </ScrollView>
        );
    }
}

const styles = ScaledSheet.create({
    loginBtnView: {
        marginVertical: '40@vs'
    },
    loginBtn: {
        height: '44@vs',
        width: '200@s',
        backgroundColor: BackgroundColor.bg_fff,
        borderRadius: '50@ms'
    },
    openButs: {
        width: '85@s',
        height: '30@vs',
        borderWidth: '1@ms',
        borderColor: BackgroundColor.bg_f3916b,
        borderRadius: '60@ms'
    },
    cardTx: {
        width: '50@s',
        height: '50@vs',
    },
    cardTxImage: {
        width: '50@s',
        height: '50@vs',
        borderRadius: '50@ms',
    },
    cardHeader: {
        flexDirection: 'row',
    },
    cardContent: {
        display:'flex',
        flexDirection: 'row',
        overflow:'hidden',
        marginLeft:'70@ms',
    },
    partingLine: {
        width: '0.5@s',
        height: '60%',
        backgroundColor: BackgroundColor.bg_e5e5e5,
        alignSelf: 'center',
    },
    content: {
        position: 'relative',
    },
    cardBox: {
        height: '170@vs',
        position: 'relative',
        backgroundColor: 'transparent',
        zIndex: 10,
        marginTop: '10@ms',
        paddingBottom: '10@ms',
    },
    card: {
        display:'flex',
        flexDirection: 'row',
        alignItems:'center',
        height: '160@vs',
        backgroundColor: BackgroundColor.bg_fff,
        elevation: '4@ms',
        borderRadius: '4@ms',
        width: '100%',
    },
    headerContent: {
        width: '100%',
        position: 'relative'
    },
    headerRecharge: {
        height: '44@vs',
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end'
    },
    headerAccountImage: {
        width: width,
        position: 'absolute',
        left: 0,
        top: 0,
        zIndex: 0,
    },
    openVipCss:{
        position:'absolute',
        zIndex: 1
    }
});

const mapStateToProps = (state, ownProps) => {
    let userData = state.getIn(['user', 'userData','myData']);
    let baseInfo = state.getIn(['user', 'userData','baseInfo']);
    let agentInfo = state.getIn(['user','userData','applyAgent']);

    if(Immutable.Map.isMap(userData)){ userData = userData.toJS() }
    if(Immutable.Map.isMap(baseInfo)){ baseInfo = baseInfo.toJS() }
    if(Immutable.Map.isMap(agentInfo)){ agentInfo = agentInfo.toJS() }

    return { ...ownProps, ...userData, ...baseInfo, ...agentInfo };
};

export default withNavigationFocus(connect(mapStateToProps,{
    VipData,
    MyData,
    SubmitApply,
    deleteUserData,
    updateBookshelf
})(My));











