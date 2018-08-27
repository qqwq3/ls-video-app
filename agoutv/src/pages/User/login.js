'use strict';

import React from 'react';
import {
    ActivityIndicator,
    View,
    Image,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import {connect} from 'react-redux';
import Toast from 'react-native-root-toast';
import Immutable from 'immutable';
import BaseComponent from '../../components/BaseComponent';
import {wxLogIn} from "../../actions/user";
import *as wechat from 'react-native-wechat';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 142,
        height: 127,
    },
    formContainer: {
        marginTop: 75,
    },
    formRow: {
        height: 50,
        borderBottomColor: '#808080',
        borderBottomWidth: 1,
        flexDirection: 'row',
        width: 300,
        alignItems: 'center',
        marginTop: 25,
    },
    icon: {
        width: 24,
        height: 24,
        marginRight: 15,
        marginLeft: 5,
    },
    inputBox: {
        flex: 1,
        color: '#fff',
        fontSize: 15,
    },
    submitButton: {
        width: 300,
        height: 50,
        backgroundColor: '#eb832e',
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    submitText: {
        fontSize: 15,
        color: '#fff',
    },
    registerText: {
        fontSize: 12,
        color: '#eb832e',
    },
    backButton: {
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 10000,
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    disabled: {
        backgroundColor: '#ccc'
    },
    wxIconStyle: {
        width:80,
        height:80
    },
});
class LoginScreen extends BaseComponent {
    static navigationOptions = ({navigation}) => ({
        header: null,
    });
    constructor(props) {
        super(props);
        this.state = {
            isLoading:false,
        }
        this.emailInput = null;
        this.passwdInput = null;

    }

    componentDidMount() {
        try {
            wechat.registerApp('wx9df0c271a2b7df7c');//从微信开放平台申请
        } catch (e) {
            Toast.show(e);
        }
        //analyticsUtil.pageStart('登录');
    }

    componentWillUnmount() {
        //analyticsUtil.pageEnd('登录');
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.user.id !== this.props.user.id) {
            this._showMessage(nextProps);
        }
    }
    _logIn = () => {
        let scope = 'snsapi_userinfo';
        let state = 'app:1512812889';
        //判断微信是否安装
        this.setState({ isLoading: true });
        wechat.isWXAppInstalled()
            .then((isInstalled) => {
                if (isInstalled) {
                    //发送授权请求
                    wechat.sendAuthRequest(scope, state)
                        .then(success => {
                            //console.log('code:', success.code);
                            this.props.wxLogIn(success.code, state)
                        })
                        .catch(err => {
                            Toast.show(err.code, err.errStr);
                        })
                } else {
                    Toast.show("没有安装微信");
                }
            })

        //this._showMessage(this.props);
    };

    _showMessage = (props) => {
        if (props.user.authorizedKey) {
            Toast.show('登录成功');
            // 返回
            let navigationRet = props.navigation.navigate('MainTab');
            if (navigationRet === true) {
                this.setState({ isLoading: false });
            }
        } else if (props.user.error) {
            Toast.show(props.user.error.message);
        }
    };

    render() {
        let loadingState = this.state.isLoading;
        //console.log("loading:", loadingState);
        return (
            <View style={styles.container}>
                    <View style={{marginTop: 50,}}>
                        <TouchableOpacity  onPress={this._logIn} disabled={loadingState}>
                            {loadingState ? <ActivityIndicator/> : null}
                            <Image
                                source={require('./loginImg/icon_login_wechat.png')}
                                style={styles.wxIconStyle}
                            />
                        </TouchableOpacity>
                    </View>
            </View>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    let userSession = state.getIn(['user', 'session']);
    if (Immutable.Map.isMap(userSession)) {
        userSession = userSession.toJS();
    }

    return {
        ...ownProps,
        user: userSession,
        //isLoading: state.getIn(['loading', 'isLoading']),
    };
};

export default connect(mapStateToProps, {
    wxLogIn,
})(LoginScreen);
