
'use strict';

import React,{ Component } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import * as weChat from 'react-native-wechat';
import { Styles, ScaledSheet, Img, Fonts, Colors, BackgroundColor } from "../../common/Style";
import { mix } from "../../common/Icons";
import { weChatLogin, loadScopeAndState } from "../../actions/User";
import { infoToast } from "../../common/Tool";
import { verticalScale } from 'react-native-size-matters';
import { userInfo } from "../../common/UserTool";
import BaseComponent from "../../components/BaseComponent";
import { updateBookshelf, updateChapter } from '../../actions/LocalAction';

type Props = {};

class Login extends Component<Props>{
    constructor(props){
        super(props);
        this.state = {
            status: false,
            scope: null,
            state: null,
            appId: null,
        };
        this._scope = 'snsapi_userinfo';
        this._state = 'app:1530754690';
        this._appId = 'wxd79fff9d3b933e8b';
        this.updateTime = Date.now();
    }
    componentWillMount() {
        const { loadScopeAndState } = this.props;
        loadScopeAndState && loadScopeAndState();
    }
    componentDidMount(){
        const { data } = this.props;

        if(data){
            this._weChatRegisterApp(data.appid || this._appId);
            this.setState({scope: data.scope, state: data.state, appId: data.appid});
            return;
        }

        this._weChatRegisterApp(this._appId);
        this.setState({scope: this._scope, state: this._state, appId: this._appId});
    }
    componentWillReceiveProps(nextProps){
        //super.componentWillReceiveProps(nextProps);
        const { navigation, updateBookshelf, updateChapter } = nextProps;

        // if(nextProps.getAppInfoTimeUpdated > this.updateTime){
        //     this.updateTime = Date.now();
        //     let data = nextProps.data;
        //     if(data){
        //         this._weChatRegisterApp(data.appid || this._appId);
        //         this.setState({scope: data.scope, state: data.state, appId: data.appid});
        //     }
        // }

        if(this.state.status && nextProps.loginTimeUpdated > this.updateTime){
            this.updateTime = Date.now();
            this.setState({status: false});

            infoToast && infoToast('登录成功');
            updateBookshelf && updateBookshelf(true);
            updateChapter && updateChapter(true);
            navigation && navigation.goBack();
        }
    }
    // 注册微信app
    _weChatRegisterApp(appId: string){
        try{
            weChat.registerApp(appId);
        }
        catch (err){
            infoToast && infoToast('错误：' + err);
        }
    }
    //点击跳过 直接不登录
    jumpOver(){
        const { navigation } = this.props;
        navigation.goBack();
    }
    // 登录 - function
    _login(){
        const scope = this.state.scope || this._scope;
        const state = this.state.state || this._state;
        const { weChatLogin } = this.props;

        if(state && scope){
            this.setState({status: true});

            //判断微信是否安装
            weChat.isWXAppInstalled().then((isInstalled) => {
                if (isInstalled) {
                    //发送授权请求
                    weChat.sendAuthRequest(scope, state)
                        .then(success => {
                            weChatLogin && weChatLogin(success.code, state);
                        })
                        .catch(err => {
                            infoToast('登录授权发生错误：' + err.message);
                            this.setState({status: false});
                        })
                }
                else {
                    this.setState({status: false});
                    infoToast("亲，您没有安装微信哦");
                }
            });

            return;
        }

        this.setState({status: false});
        return infoToast('登录出故障了，请重新登录');
    }
    render(){
        return (
            <View style={[Styles.container, {backgroundColor: BackgroundColor.bg_fff}]}>
                <View style={[styles.jumpOverIndex]}>
                    <TouchableOpacity  activeOpacity={0.70} onPress={this.jumpOver.bind(this)}>
                        <Text style={[Fonts.fontSize15,Colors.gray_404040]}>跳过</Text>
                    </TouchableOpacity>
                </View>
                <View style={[styles.imageView, Styles.flexCenter]}>
                    <Image source={mix.login} style={[Img.resizeModeContain, styles.image]}/>
                </View>
                <View style={[Styles.row, styles.rows]}>
                    <TouchableOpacity
                        activeOpacity={0.50}
                        style={[styles.btn, Styles.row, Styles.flexCenter]}
                        onPress={this._login.bind(this)}
                    >
                        <Image source={mix.weChat} style={[Img.resizeModeContain, styles.imageWeChat]} />
                        <Text style={[Fonts.fontFamily, Fonts.fontSize16, Colors.white_FFF]}>微信登录</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.agreenAgreement}>
                    <TouchableOpacity activeOpacity={0.80} style={[Styles.flexCenter]}>
                        <Text style={[Fonts.fontSize12]}>同意《协议内容》</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}

const styles = ScaledSheet.create({
    agreenAgreement:{
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom:'30@ms',
        paddingTop:'15@ms',
    },
    rows: {
        height: '120@vs',
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    btn: {
        width: '300@s',
        height: '44@vs',
        borderRadius: '50@ms',
        backgroundColor: BackgroundColor.bg_00bc0c,
        overflow: 'hidden'
    },
    imageWeChat: {
        width: '30@s',
        height: "24@vs",
        marginRight: '20@s'
    },
    image: {
        width: '285@s',
        // height: '330@vs',
    },
    imageView: {
        flex: 1,
        position: 'relative',
    },
    jumpOverIndex:{
       flexDirection:'row',
       justifyContent:'flex-end',
       marginTop:'25@ms',
       marginRight:'15@ms'
    }
});

const mapStateToProps = (state, ownProps) => {
    let userData = state.getIn(['user','userData','baseInfo']);

    if(Immutable.Map.isMap(userData)){ userData = userData.toJS() }
    return { ...ownProps, ...userData };
};

export default connect(mapStateToProps,{
    weChatLogin,
    loadScopeAndState,
    updateBookshelf,
    updateChapter
})(Login);