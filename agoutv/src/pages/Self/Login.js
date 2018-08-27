
/*登录界面单独处理*/

import React,{ Component } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, StatusBar, ActivityIndicator } from 'react-native';
import Immutable from 'immutable';
import * as wechat from 'react-native-wechat';
import Toast from 'react-native-root-toast';
import { connect } from 'react-redux';
import { wxLogIn, loadSession } from '../../actions/user';

class Login extends Component{
    constructor(props){
        super(props);
        this.state = {
            status: false
        };
        this._scope = 'snsapi_userinfo';
        this._state = 'app:1512812889';
        this._registerCode = 'wx4f60c8eebaec00f1';
    }
    componentWillMount() {
        const { userData } = this.state;

        this._statusBarSet();

        if(userData && userData.login){ this.props.loadSession() }
        else{ this._wechatRegisterApp() }
    }
    componentWillReceiveProps(nextProps) {
        const { navigation } = this.props;
        const { status } = this.state;

        if(nextProps.userData && nextProps.userData.login && status){
            Toast.show('登录成功',{duration: 2000, position: -55});
            this.setState({status: false});
            navigation.goBack();

            // 将用户信息设置为全局
            // global.userData = nextProps.userData || {};
        }

        // 登录失败
        if(nextProps.userData && nextProps.userData.error){
            let error = nextProps.userData.error;
            Toast.show('登录失败,请重新登录',{duration: 2000, position: -55});
            this.setState({status: false});
        }
    }
    _wechatRegisterApp(){
        let registerCode = this._registerCode;
        try {wechat.registerApp(registerCode)}
        catch (e) {Toast.show(e,{duration: 2000, position: -55})}
    }
    // 设置头部状态栏
    _statusBarSet(){
        StatusBar.setBackgroundColor('#5BA6FF',true);
        StatusBar.setBarStyle('light-content');
    }
    // 登录 - 事件
    _login(){
        const scope = this._scope;
        const state = this._state;
        const { wxLogIn } = this.props;

        this.setState({status: true});

        //判断微信是否安装
        wechat.isWXAppInstalled().then((isInstalled) => {
            if (isInstalled) {
                //发送授权请求
                wechat.sendAuthRequest(scope, state)
                    .then(success => {
                        wxLogIn && wxLogIn(success.code, state);
                    })
                    .catch(err => {
                        Toast.show(err.code, err.errStr);
                        this.setState({status: false});
                    })
            } else {
                this.setState({status: false});
                Toast.show("亲，您没有安装微信哦！",{duration: 2000, position: -55});
            }
        });
    }
    // 继续使用
    _continue(){
        const { navigation } = this.props;
        navigation.goBack();
    }
    render(){
        const { status } = this.state;
        const loginMainImg = require('../imgs/login_main_img.png');

        return (
            <View style={styles.content}>
                <View style={styles.header}>
                    <Image resizeMode={'cover'} style={styles.headerImage} source={loginMainImg} />
                </View>

                <View style={styles.butBox}>
                    <TouchableOpacity activeOpacity={0.5} onPress={this._login.bind(this)} style={styles.loginBtn}>
                        <Text style={[styles.loginText,styles.fontFamily]}>微信登录</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.rows}>
                    <Text style={[styles.fontFamily,styles.orText,{marginTop:15}]}>或</Text>
                    <TouchableOpacity activeOpacity={.5} onPress={this._continue.bind(this)} style={styles.continue}>
                        <Text style={[styles.fontFamily,styles.continueText]}>继续试用</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.prompt}>
                    <Text style={[styles.fontFamily,styles.promptText]}>登录即代表同意本<Text style={{textDecorationLine:'underline'}}>软件许可及服务协议</Text></Text>
                </View>

                { !status ? null : <View style={styles.loading}><ActivityIndicator color={'rgb(0,117,248)'} size={'small'} /></View> }
            </View>
        );
    }
}

const styles = StyleSheet.create({
    loading:{
        position:'absolute',
        left:0,
        bottom:0,
        right:0,
        top:0,
        zIndex:100,
        backgroundColor:'rgba(0,0,0,0.5)',
        justifyContent:'center',
        alignItems:'center'
    },
    fontFamily: {
        fontFamily: 'PingFangSC-Medium',
    },
    header:{
        height:380,
        overflow:'hidden',
    },
    promptText:{
        fontSize:12,
        color:'#afafc0'
    },
    prompt:{
        flex:1,
        flexDirection:'row',
        alignItems:'flex-end',
        justifyContent:'center',
        paddingBottom:20
    },
    continue:{
        height:40,
        width:220,
        justifyContent:'center',
        alignItems:'center'
    },
    continueText:{
        fontSize:14,
        color:'#0076f8'
    },
    butBox:{
        marginTop:60,
        justifyContent:"center",
        alignItems:'center'
    },
    rows:{
        justifyContent:'center',
        alignItems:'center'
    },
    orText:{
        fontSize:14,
        color:'#afafc0'
    },
    headerImage:{
        width: '100%',
    },
    content:{
        flex:1,
        backgroundColor:'#FFFFFF',
        position:'relative',
        overflow:'hidden',
    },
    loginText:{
        fontSize: 16,
        color:'#fff',
    },
    loginBtn:{
        height:44,
        width:220,
        backgroundColor:'#0076f8',
        borderRadius:25,
        justifyContent:'center',
        alignItems:'center',
        flexDirection:'row'
    },
});

const mapStateToProps = (state, ownProps) => {
    let userSessionData = state.getIn(['user']);

    if (Immutable.Map.isMap(userSessionData)) {
        userSessionData = userSessionData.toJS();
    }

    return { ...ownProps, ...userSessionData };
};

export default connect(mapStateToProps, {wxLogIn, loadSession})(Login);




































