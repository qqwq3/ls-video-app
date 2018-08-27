
/*设置*/

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { connect } from 'react-redux';
import Immutable from 'immutable';
import Toast from 'react-native-root-toast';
import Switch from 'react-native-switch-pro';
import clear from 'react-native-clear-cache';
import HeaderBox from '../../common/HeaderBox';
import { pixel, statusBarSetPublic, isLogout } from "../../common/tool";
import { bindInvite } from "../../actions/user";
import Dialog from '../Common/Dialog';
import { loadSession, wxLogIn, logOut, newMessagePrompt } from '../../actions/user';

class Setting extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            cacheSize: 0,
            value: false,
            unit: ''
        };
    }
    componentWillMount() {
        const { userData } = this.props;
        const showMessageStatus = userData && userData.login && userData.message && userData.message.isMessage;

        statusBarSetPublic && statusBarSetPublic('#FFFFFF','dark-content',true);
        this._getApplicationCache();
        this.setState({value: showMessageStatus});
    }
    componentWillReceiveProps(nextProp) {
        if(this.props.userData
            && this.props.userData.message
            && nextProp.userData
            && nextProp.userData.login
            && nextProp.userData.message
        ){
            const nextMessageStatus = nextProp.userData.message.isMessage;
            const prevMessageStatus = this.props.userData.message.isMessage;

            if(prevMessageStatus !== nextMessageStatus){
                this.setState({value: nextMessageStatus});
            }
        }
    }
    // 获取app应用缓存大小
    _getApplicationCache(){
        clear.getCacheSize((value,unit)=>{
            this.setState({
                cacheSize: value, //缓存大小
                unit: unit  //缓存单位
            })
        });
    }
    // 清除app应用缓存
    _clearApplicationCache(){
        clear.runClearCache(()=>{
            Toast.show('清除成功',{ duration: 2000, position: -55 });
            this._getApplicationCache();
        });
    }
    // 去绑定手机
    _bindPhone() {
        const { navigate } = this.props.navigation;
        return navigate('BindPhone');
    }
    // 退出登录
    _loginOut() {
        const { navigation } = this.props;

        if(isLogout(this.props)){
            return navigation.navigate('Login');
        }

        this.popRef && this.popRef.modeShow();
    }
    // 取消登录
    onDismiss(){
        this.popRef && this.popRef.modeHide();
    }
    // 确认退出登录
    onConfirm(){
        const { logOut, navigation } = this.props;

        logOut && logOut();
        this.onDismiss();

        Toast.show('退出成功',{duration: 2000, position: -55});
        navigation.navigate('Login');
    }
    // 返回
    _goBack(){
        const { goBack } = this.props.navigation;
        return goBack();
    }
    // 头部栏
    renderHeader(){
        return (
            <HeaderBox
                isText={true}
                text={'设置'}
                isArrow={true}
                goBack={this._goBack.bind(this)}
            />
        );
    }
    // 退出弹出层选择提示
    renderPop(){
        return (
            <Dialog
                popHeight={180}
                ref={ref => this.popRef = ref}
                animationType={'fade'}
                title={'温馨提示'}
                buttonLeftText={'不想退出'}
                buttonRightText={'退出登录'}
                popBackgroundColor={'rgba(0,0,0,0)'}
                mandatory={false}
                onDismiss={this.onDismiss.bind(this)}
                onConfirm={this.onConfirm.bind(this)}
            >
                <View style={styles.popContent}>
                    <Text style={styles.popContentText}>亲，退出登录后我们还会继续保留您的应用数据的，记得常回来看看哦！</Text>
                </View>
            </Dialog>
        );
    }
    _onSyncPress(value = {}){
        const { newMessagePrompt } = this.props;
        newMessagePrompt && newMessagePrompt(value);
    }
    // 清除app应用缓存
    _clearCache(){
        const { cacheSize } = this.state;

        if(cacheSize === (0 || '0')){
            return Toast.show('暂无应用缓存',{ duration: 2000, position: -55 });
        }

        Alert.alert('提示','确定要清除APP当前应用缓存吗？',[
            { text: '取消', onPress: () => {} },
            { text: '确定', onPress: () => this._clearApplicationCache() }
        ]);
    }
    // 填写邀请码
    _inviteCode(){
        const { navigation } = this.props;
        navigation.navigate('BindInviteCode',{name:'Setting'});
    }
    // 空方法
    _empty(){
        return null;
    }
    // 绑定手机 - demo
    renderBindPhone(){
        const { userData } = this.props;
        const status = userData && userData.login && userData.phone && userData.phone.isPhone;
        const activeOpacity: number = status ? 1 : 0.50;
        const text = status ? "已绑定" : '立刻绑定';

        return (
            <TouchableOpacity
                activeOpacity={activeOpacity}
                onPress={() => status ? {} : this._bindPhone()}
                style={styles.rows}
            >
                <View style={[styles.bottomBorder,styles.rowsInner]}>
                    <View style={[styles.item,{flex:3}]}>
                        <Text style={[styles.fontFamily,styles.itemFont,{color:'#404040'}]}>绑定手机</Text>
                        <Text style={[styles.fontFamily,styles.itemSmallFont,{color:'#ff3e3e',marginLeft:10}]}>绑定手机开启提现功能</Text>
                    </View>
                    <View style={[styles.item,{flex:1,justifyContent:'flex-end'}]}>
                        <Text style={[styles.fontFamily,styles.itemFont,{color:'#afafc0'}]}>{ text }</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
    // 填写邀请码 - deom
    renderInviteCode(){
        const { userData } = this.props;
        const status = userData && userData.login && userData.invite && userData.invite.prompt;
        const activeOpacity: number = status ? 1 : 0.50;
        const text = status ? "已填写" : '立刻填写';

        return (
            <TouchableOpacity
                activeOpacity={activeOpacity}
                style={styles.rows}
                onPress={() => !status ? (userData.invite && userData.invite.prompt ? this._empty() : this._inviteCode()) : this._empty()}
            >
                <View style={[styles.bottomBorder,styles.rowsInner]}>
                    <View style={[styles.item,{flex:3}]}>
                        <Text style={[styles.fontFamily,styles.itemFont,{color:'#404040'}]}>填写邀请码</Text>
                        <Text style={[styles.fontFamily,styles.itemSmallFont,{color:'#ff3e3e',marginLeft:10}]}>填写邀请码获0.8元现金</Text>
                    </View>
                    <View style={[styles.item,{flex:1,justifyContent:'flex-end'}]}>
                        <Text style={[styles.fontFamily,styles.itemFont,{color:'#afafc0'}]}>{ text }</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
    // 新消息通知 - demo
    renderPrompt(){
        return (
            <View style={styles.rows}>
                <View style={[styles.bottomBorder,styles.rowsInner]}>
                    <View style={[styles.item,{flex:3}]}>
                        <Text style={[styles.fontFamily,styles.itemFont,{color:'#404040'}]}>新消息通知</Text>
                    </View>
                    <TouchableOpacity activeOpacity={.50} style={[styles.item,{flex:2,justifyContent:'flex-end'}]}>
                        <Switch
                            width={50}
                            height={25}
                            style={{marginTop: 0}}
                            value={this.state.value}
                            backgroundActive={'#0076f8'}
                            backgroundInactive={'#dcdcdc'}
                            onSyncPress={this._onSyncPress.bind(this)}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
    // 清除应用缓存 - demo
    renderCleanCache(){
        return (
            <TouchableOpacity activeOpacity={0.5} onPress={this._clearCache.bind(this)} style={styles.rows}>
                <View style={[styles.rowsInner]}>
                    <View style={[styles.item,{flex:3}]}>
                        <Text style={[styles.fontFamily,styles.itemFont,{color:'#404040'}]}>清除应用缓存</Text>
                    </View>
                    <View style={[styles.item,{flex:2,justifyContent:'flex-end'}]}>
                        <Text style={[styles.fontFamily,styles.itemFont,{color:'#afafc0'}]}>{this.state.cacheSize}{this.state.unit}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
    // 免责声明 - demo
    renderDisclaimer(){
        return (
            <TouchableOpacity activeOpacity={0.5} style={[styles.rows,{marginTop:10}]}>
                <View style={[styles.bottomBorder,styles.rowsInner]}>
                    <View style={[styles.item,{flex:3}]}>
                        <Text style={[styles.fontFamily,styles.itemFont,{color:'#404040'}]}>免责声明</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
    // 关于 - demo
    renderAbout(){
        return (
            <TouchableOpacity activeOpacity={0.5} style={styles.rows}>
                <View style={[styles.rowsInner]}>
                    <View style={[styles.item,{flex:3}]}>
                        <Text style={[styles.fontFamily,styles.itemFont,{color:'#404040'}]}>关于</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
    // 退出当前账号 - demo
    renderLogout(){
        const status = isLogout(this.props);
        const text = status ? '立即登录' : '退出当前账号';
        const textColor = status ? 'rgb(0,117,248)' : '#ff3e3e';

        return (
            <TouchableOpacity activeOpacity={0.5} onPress={this._loginOut.bind(this)} style={[styles.rows,{marginTop:40}]}>
                <View style={[styles.rowsInner]}>
                    <View style={[styles.item,{flex:3,justifyContent:'center'}]}>
                        <Text style={[styles.fontFamily,styles.itemFont,{color: textColor}]}>{ text }</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
    render() {
        return (
            <View style={styles.content}>
                { this.renderHeader() }
                { this.renderPop() }
                { this.renderInviteCode() }
                { this.renderBindPhone() }
                { this.renderPrompt() }
                { this.renderCleanCache() }
                { this.renderLogout() }
            </View>
        )
    }
}

const styles = StyleSheet.create({
    popContent:{
        flex:1,
        justifyContent:'center',
        alignItems:'center',
        paddingHorizontal:15
    },
    popContentText:{
        fontSize:14,
        color:'red',
        lineHeight:24
    },
    fontFamily: {
        fontFamily: 'PingFangSC-Medium',
    },
    bottomBorder:{
        borderBottomWidth: 1 / pixel,
        borderBottomColor: '#dcdcdc',
    },
    itemFont:{
        fontSize:14,
    },
    itemSmallFont:{
        fontSize:12
    },
    item:{
        height:50,
        overflow:'hidden',
        flexDirection:'row',
        alignItems:'center'
    },
    rows:{
        height:50,
        backgroundColor:"#fff",
        paddingHorizontal:7.5,
    },
    rowsInner:{
        flex:1,
        flexDirection:'row',
        alignItems:'center',
        paddingHorizontal:7.5
    },
    content:{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        backgroundColor:'#EFEFEF'
    },
});

const mapStateToProps = (state, ownProps) => {
    let userSessionData = state.getIn(['user']);

    if (Immutable.Map.isMap(userSessionData)) {
        userSessionData = userSessionData.toJS();
    }

    return { ...ownProps, ...userSessionData };
};

export default connect(mapStateToProps, {loadSession, bindInvite, wxLogIn, logOut, newMessagePrompt})(Setting);


