'use strict';

import React from 'react';
import {
    View,
    Text,
    TextInput,
    Image,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import {connect} from 'react-redux';
import Immutable from 'immutable';
import Toast from 'react-native-root-toast';
import BaseComponent from '../../components/BaseComponent';
import {BackwardButton} from "../../components/Header";
import XingrenButton from '../../components/XingrenButton';
import {register} from "../../actions/user";

const util = require('../../common/Util');
const analyticsUtil = require('../../common/AnalyticsUtil');

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
        marginTop: 45,
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
});


class RegisterScreen extends BaseComponent {
    static navigationOptions = ({navigation}) => ({
        header: null,
    });

    constructor(props) {
        super(props);

        this.emailInput = null;
        this.passwdInput = null;
        this.confirmPasswdInput = null;
    }

    componentDidMount() {
        analyticsUtil.pageStart('注册');
    }

    componentWillMount() {
        analyticsUtil.pageEnd('注册')
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.user && nextProps.user.processID !== this.props.user.processID) {
            this._showMessage(nextProps);
        }
    }

    _register = () => {
        if (!this.emailInput) {
            return Toast.show('请输入邮箱地址');
        }
        if (!util.isEmail(this.emailInput)) {
            return Toast.show('无效的邮箱地址格式');
        }
        if (!this.passwdInput) {
            return Toast.show('请输入登录密码');
        }
        if (!this.confirmPasswdInput) {
            return Toast.show('请输入确认密码');
        }
        if (util.md5(this.passwdInput) !== util.md5(this.confirmPasswdInput)) {
            return Toast.show('两次输入的密码不一致');
        }

        this.props.register(this.emailInput, this.passwdInput);
    };

    _showMessage = (props) => {
        if (props.user.authorizedKey) {
            Toast.show('注册成功');
            props.navigation.goBack();
        } else if (props.user.error) {
            Toast.show(props.user.error.message);
        }
    };

    render() {
        return (
            <View style={styles.container}>
                <Image
                    source={require('../imgs/icon_almond2.png')}
                    style={styles.logo}/>
                <View style={styles.formContainer}>
                    <View style={styles.formRow}>
                        <Image
                            source={require('../imgs/icon_account.png')}
                            style={styles.icon}
                        />
                        <TextInput
                            style={styles.inputBox}
                            placeholder="请输入邮箱地址"
                            placeholderTextColor="#808080"
                            underlineColorAndroid="transparent"
                            onChangeText={(text) => this.emailInput = text}
                            keyboardType="email-address"
                        />
                    </View>
                    <View style={styles.formRow}>
                        <Image
                            source={require('../imgs/icon_password.png')}
                            style={styles.icon}
                        />
                        <TextInput
                            style={styles.inputBox}
                            placeholder="请输入密码"
                            placeholderTextColor="#808080"
                            underlineColorAndroid="transparent"
                            onChangeText={(text) => this.passwdInput = text}
                            secureTextEntry={true}
                        />
                    </View>
                    <View style={styles.formRow}>
                        <Image
                            source={require('../imgs/icon_password.png')}
                            style={styles.icon}
                        />
                        <TextInput
                            style={styles.inputBox}
                            placeholder="请再次输入密码"
                            placeholderTextColor="#808080"
                            underlineColorAndroid="transparent"
                            onChangeText={(text) => this.confirmPasswdInput = text}
                            secureTextEntry={true}
                        />
                    </View>
                    <View style={[styles.formRow, {marginTop: 50,}]}>
                        <XingrenButton
                            text="注册"
                            style={[styles.submitButton]}
                            textStyle={styles.submitText}
                            indicatorStyle={{marginRight: 10,}}
                            indicatorColor="#fff"
                            onPress={this._register}
                            disabled={this.props.isLoading}
                            loading={this.props.isLoading}
                        />
                    </View>
                    <View style={{marginTop: 25}}>
                        <TouchableOpacity onPress={() => this.backNavigate('logIn')}>
                            <Text style={styles.registerText}>已有账号，立即登录</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <BackwardButton style={styles.backButton} onPress={() => this.props.navigation.goBack()} />
            </View>
        );
    }
};

const mapStateToProps = (state, ownProps) => {
    let session = state.getIn(['user', 'session']);
    return {
        ...ownProps,
        user: (Immutable.Map.isMap(session) ? session.toJS() : session),
        isLoading: state.getIn(['loading', 'isLoading']),
    };
};

export default connect(mapStateToProps, {
    register,
})(RegisterScreen);
