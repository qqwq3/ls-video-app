
/*绑定手机*/

'use strict';

import React,{ Component } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Keyboard } from 'react-native';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import BackgroundTimer from 'react-native-background-timer';
import Toast from 'react-native-root-toast';
import HeaderBox from '../../../common/HeaderBox';
import { getVerCode, bindPhone } from "../../../actions/user";
import { pixel, statusBarSetPublic, zeroPadding } from "../../../common/tool";

class BindPhone extends Component{
    constructor(props){
        super(props);
        this.state={
            changePhoneNumber: 0,
            changeCode: 0,
            isCode: false,
            isPhone: false,
            isBind: true,
            showText: false,
            text: '获取验证码',
            seconds: 60,
            isShowCx: true
        }
    }
    componentWillMount() {
        statusBarSetPublic('#FFFFFF','dark-content',true);
        this.setState({isCode: false, isPhone: false});
        // 设备软键盘监听
        this._keyboardHide = Keyboard.addListener('keyboardDidHide',this._keyboardDidHideHandler.bind(this));
    }
    componentWillUnmount() {
        this.intervalId && BackgroundTimer.clearTimeout(this.intervalId);
        // 卸载设备软键盘监听
        this._keyboardHide && this._keyboardHide.remove();
    }
    componentWillReceiveProps(nextProps) {
        const { isCode, isPhone } = this.state;

        if(nextProps.userData && nextProps.userData.login){
            if(isCode && nextProps.userData.verCode){
                let verCode = nextProps.userData.verCode;

                if(verCode.isCode && verCode.sendCode && parseInt(verCode.sendCode.code) === 0){
                    Toast.show('验证码发送成功,请注意查收',{ duration: 2000, position: -55 });
                    this._setInterval();
                }
                else{
                    Toast.show(verCode.sendCode.message,{ duration: 2000, position: -55 });
                }
                this.setState({isCode: false});
            }

            if(isPhone && nextProps.userData.phone){
                let phone = nextProps.userData.phone;

                if(phone.isPhone && phone.bindPhone && parseInt(phone.bindPhone.code) === 0){
                    Toast.show('绑定成功',{ duration: 2000, position: -55 ,onHide:() => this._goBack()});
                }
                else{
                    Toast.show(phone.bindPhone.message,{ duration: 2000, position: -55 });
                }
                this.setState({isPhone: false});
            }
        }
        else {
            Toast.show('登录后才能注册手机哦',{ duration: 2000, position: -55 });
        }
    }
    // 软键盘监听对应的方法
    _keyboardDidHideHandler(){
        this.phoneNumberRef && this.phoneNumberRef.blur();
        this.codeRef && this.codeRef.blur();
    }
    // 返回
    _goBack(){
        const { goBack } = this.props.navigation;
        return goBack();
    }
    // 头部 - demo
    renderHeader(){
        return (<HeaderBox isText={true} text={'绑定手机号'} isArrow={true} goBack={this._goBack.bind(this)}/>);
    }
    // 头部提示 - demo
    renderHeaderPrompt(){
        return (
            <View style={styles.promptView}>
                <Text style={[styles.fontFamily,styles.promptText]}>绑定成功，即可开通提现到微信零钱功能</Text>
            </View>
        );
    }
    // 输入框 - demo
    renderInput(){
        const { text, showText, seconds, isShowCx } = this.state;

        return (
            <View style={styles.rows}>
                <View style={[styles.cell,styles.bottomBorder]}>
                    <View style={styles.itemName}>
                        <Text style={[styles.fontFamily,styles.itemNameText]}>绑定手机号：</Text>
                    </View>
                    <View style={styles.itemInput}>
                        <TextInput
                            keyboardType={'numeric'}
                            placeholderTextColor={'#afafc0'}
                            placeholder={'请输入手机号'}
                            style={styles.itemTextInput}
                            underlineColorAndroid={'transparent'}
                            onChangeText={(changePhoneNumber) => this.setState({changePhoneNumber})}
                            maxLength={11}
                            ref={ref => this.phoneNumberRef = ref}
                        />
                    </View>
                    <TouchableOpacity activeOpacity={0.5} style={styles.itemButton} onPress={this._getVerificationCode.bind(this)}>
                        {
                            showText ?
                            <View style={styles.cxView}>
                                {
                                    isShowCx ?
                                    <Text style={[styles.fontFamily,styles.cxTextX]}>{ text }</Text> :
                                    <Text style={[styles.fontFamily,styles.cxTextX]}>{ zeroPadding(seconds) }s</Text>
                                }
                            </View> :
                            <View style={styles.itemButInner}>
                                <Text style={[styles.fontFamily,styles.itemButtonText]}>{ text }</Text>
                            </View>
                        }
                    </TouchableOpacity>
                </View>
                <View style={[styles.cell,styles.bottomBorder]}>
                    <View style={styles.itemName}>
                        <Text style={[styles.fontFamily,styles.itemNameText]}>手机验证码：</Text>
                    </View>
                    <View style={styles.itemInput}>
                        <TextInput
                            keyboardType={'default'}
                            placeholderTextColor={'#afafc0'}
                            placeholder={'请输入验证码'}
                            style={styles.itemTextInput}
                            underlineColorAndroid={'transparent'}
                            onChangeText={(changeCode) => this.setState({changeCode})}
                            ref={ref => this.codeRef = ref}
                        />
                    </View>
                </View>
            </View>
        );
    }
    // 计时器
    _setInterval(){
        this.intervalId = BackgroundTimer.setInterval(() => {
            const { seconds } = this.state;
            let time = seconds - 1;

            if(seconds > 1){
                this.setState({seconds: time, isShowCx: false, showText: true});
            }
            else{
                this.setState({seconds: 60, text: '重新获取', isShowCx: true});
                BackgroundTimer.clearInterval(this.intervalId);
            }
        }, 1000);
    }
    // 绑定按钮 - demo
    renderSubmit(){
        return (
            <View style={styles.submitBox}>
                <TouchableOpacity
                    activeOpacity={0.5}
                    style={[styles.submit,{backgroundColor:'rgb(0,117,248)'}]}
                    onPress={() => this._confirmBind()}
                >
                    <Text style={[styles.fontFamily,styles.submitBoxText]}>确认绑定</Text>
                </TouchableOpacity>
            </View>
        );
    }
    // 确认绑定
    _confirmBind(){
        const { changeCode, changePhoneNumber } = this.state;
        const { bindPhone } = this.props;

        if(!changePhoneNumber || changePhoneNumber === 0){
            return Toast.show('请输入手机号',{ duration: 2000, position: -55 });
        }
        else if(!/^[1][3,4,5,7,8][0-9]{9}$/.test(changePhoneNumber)){
            return Toast.show('手机号格式错误',{ duration: 2000, position: -55 });
        }
        else if(!changeCode || changeCode === 0){
            return Toast.show('请输入验证码',{ duration: 2000, position: -55 });
        }
        else if(!/^\d{4,6}$/.test(changeCode)){
            return Toast.show('验证码格式错误',{ duration: 2000, position: -55 });
        }

        // 去绑定
        bindPhone && bindPhone(changePhoneNumber,changeCode);
        this.setState({isPhone: true});
    }
    // 获取验证码
    _getVerificationCode(){
        const { changePhoneNumber, isShowCx } = this.state;
        const { getVerCode, userData } = this.props;

        if(!isShowCx){
            return;
        }

        if(!changePhoneNumber || changePhoneNumber === 0){
            return Toast.show('请输入手机号',{ duration: 2000, position: -55 });
        }
        else if(!/^[1][3,4,5,7,8][0-9]{9}$/.test(changePhoneNumber)){
            return Toast.show('手机号格式错误',{ duration: 2000, position: -55 });
        }

        // 去获取验证码
        getVerCode && getVerCode(changePhoneNumber);
        this.setState({isCode: true});
    }
    render(){
        return(
            <View style={styles.content}>
                { this.renderHeader() }
                { this.renderHeaderPrompt() }
                { this.renderInput() }
                { this.renderSubmit() }
            </View>
        );
    }
}

const styles = StyleSheet.create({
    cxText:{
        fontSize:14,
        color:"#d0d0d0",
    },
    cxTextX:{
        color:'rgb(0,117,248)',
        fontSize:14
    },
    cxView:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'flex-end',
    },
    submitBox:{
        paddingHorizontal:30,
        marginTop:60
    },
    submit:{
        height:44,
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:'rgb(0,117,248)',
        borderRadius:50,
        elevation:3
    },
    submitBoxText:{
        fontSize:14,
        color:"#FFF"
    },
    itemTextInput:{
        flex:1,
        flexDirection:'row',
        justifyContent:'flex-end',
        alignItems:'center'
    },
    itemButton:{
        width:80,
        height:50,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'flex-end'
    },
    itemInput:{
        flex:1,
    },
    itemName:{
        flexDirection:'row',
        alignItems:'center',
    },
    itemNameText:{
        fontSize:14,
        color:'#404040'
    },
    itemButInner:{
        width:80,
        height:25,
        justifyContent:"center",
        alignItems:'center',
        backgroundColor:'rgb(0,117,248)',
        borderRadius:50,
        overflow:'hidden'
    },
    itemButtonText:{
        fontSize:12,
        color:'#fff'
    },
    bottomBorder:{
        borderBottomColor:'#dcdcdc',
        borderBottomWidth: 1 / pixel,
    },
    cell:{
        height:50,
        width: '100%',
        flexDirection:'row'
    },
    rows:{
        position:'relative',
        overflow:'hidden',
        flexDirection:'column',
        paddingHorizontal:15,
    },
    content:{
        flex:1,
        backgroundColor:'#fff',
        position:'relative'
    },
    fontFamily: {
        fontFamily: 'PingFangSC-Medium',
    },
    promptView:{
        height:50,
        backgroundColor:'#0076f8',
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center'
    },
    promptText:{
        fontSize: 14,
        color:'#FFFFFF'
    }
});

const mapStateToProps = (state, ownProps) => {
    let data = state.getIn(['user']);

    if (Immutable.Map.isMap(data)) {data = data.toJS()}
    return { ...ownProps, ...data };
};

export default connect(mapStateToProps, {getVerCode, bindPhone})(BindPhone);
