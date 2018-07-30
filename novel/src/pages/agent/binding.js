'use strict';

import React,{ Component } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, TouchableHighlight, TextInput, Dimensions, StatusBar } from 'react-native';
import { connect } from 'react-redux';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import BackgroundTimer from 'react-native-background-timer';
import Immutable from 'immutable';
import Toast from 'react-native-root-toast';
import { Styles, ScaledSheet,Img, Fonts, Colors, BackgroundColor } from "../../common/Style";
import Header from '../../components/Header';
import { SendVercode, ApplyText } from "../../actions/User";
import BaseComponent from "../../components/BaseComponent";
import {infoToast} from "../../common/Tool";

type Props = {};

class Binding extends BaseComponent<Props>{
    constructor(props) {
        super(props);
        this.state={
            mobile: '',
            vcode: '',
            canBtn:true,
            showText: false,
            text: '发送验证码',
            seconds: 60,
            nobtn:false,
        };
        this.updateTime = Date.now();
    }
    componentWillUnmount(){
        this.timer && clearInterval(this.timer);
        this.setState = () => {return};
    }
    componentWillReceiveProps(nextProps){
        super.componentWillReceiveProps(nextProps);
        const { navigation } = nextProps;
        /*if(nextProps.userData.applyText){
            let code = nextProps.userData.applyText.code;
            if(parseInt(code) == 0){
                const { navigation } = this.props;
                navigation && navigation.navigate('ApplySuccess');
            }
        }*/


        if(nextProps && nextProps.applyTextTimeUpdated > this.updateTime){
            this.updateTime = Date.now();
            let applyText = parseInt(nextProps.code);
            if (applyText === 0) {
                navigation && navigation.navigate('ApplySuccess');
            }
        }


    }
    _goBack(){
        const { navigation } = this.props;
        navigation.goBack();
    }
    // 头部 - demo
    renderHeader(){
        return (
            <Header
                title={'绑定手机'}
                isArrow={true}
                goBack={this._goBack.bind(this)}
            />
        );
    }

    //手机号
    _changePhone(inputData){
        this.setState({mobile:inputData});

    }
    //验证码
    _changeVerificationCode(inputData){
        this.setState({vcode:inputData});
        if(inputData==='') {
            this.setState({
                canBtn:true
            });
        }else{
            this.setState({
                canBtn:false
            });
        }

    }

    // 倒计时,验证码
    _setInterval(){
        const { mobile } = this.state;
        const { SendVercode } = this.props;
        this.setState({nobtn:true});
        if(!/^[1][3,4,5,7,8][0-9]{9}$/.test(mobile)){
            return Toast.show('手机号格式错误',{duration: 2000,postion:-55});
        }else{
            SendVercode && SendVercode(Number(mobile));
            this.timer = BackgroundTimer.setInterval(() => {
                const { seconds } = this.state;
                let time = seconds - 1;
                if(seconds > 1){
                    this.setState({seconds: time, showText: true,nobtn:true});

                }
                else{
                    this.setState({seconds: 60, text: '重新获取', showText: false,nobtn:false});
                    BackgroundTimer.clearInterval(this.timer);
                }

            }, 1000);
        }
    }




    renderPhone(){
        return(
            <View>
                <View style={{paddingLeft:moderateScale(20),paddingTop:moderateScale(5),backgroundColor:'#f3916b',height:verticalScale(30)}}>
                    <Text style={[Fonts.fontFamily,Fonts.fontSize12,{color:'white'}]}>
                        请验证手机号并申请成为代理
                    </Text>
                </View>
                {/*手机号*/}
                <View style={[styles._border]}>
                    <TextInput
                        style={[styles._input]}
                        placeholder={"手机号码"}
                        placeholderTextColor={'#808080'}
                        underlineColorAndroid={"transparent"}
                        maxLength={11}
                        multiline={true}
                        onChangeText={this._changePhone.bind(this)}
                    >
                    </TextInput>
                </View>

                {/*验证码*/}
                <View style={{position:'relative'}}>
                    <TextInput
                        style={[styles._input]}
                        placeholder={"验证码"}
                        placeholderTextColor={'#808080'}
                        underlineColorAndroid={"transparent"}
                        maxLength={11}
                        multiline={true}
                        onChangeText={this._changeVerificationCode.bind(this)}
                    >
                    </TextInput>
                    <View style={[styles._vercodeBorder,{position:'absolute',right:moderateScale(15),top:moderateScale(8),width:scale(75),height:verticalScale(26),alignItems:'center',justifyContent:'center'}]}>
                        <TouchableOpacity
                            onPress={this._setInterval.bind(this)}
                            disabled={this.state.nobtn}
                            style={{alignItems:'center',justifyContent:'center'}}
                        >
                            <Text style={[Fonts.fontFamily,Fonts.fontSize12,{color:'#f3916b',justifyContent:'center',alignItems:'center'}]}>{this.state.showText ? this.state.seconds+'s':this.state.text  }</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        )
    }

    _Submit(){
        const { ApplyText } = this.props;
        const { mobile,vcode } = this.state;
        ApplyText && ApplyText(mobile,vcode);
    }
    //验证并申请
    renderBtn(){
        const btnColor= this.state.canBtn ? '#b2b2b2' :'#f3916b';
        return(
            <View style={{alignItems:'center',paddingTop:moderateScale(50),backgroundColor:'#EEEEEE',height:'100%'}}>
                <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={this._Submit.bind(this)}
                    disabled={this.state.canBtn}
                >
                    <View style={{backgroundColor:btnColor,height:verticalScale(44),width:verticalScale(300),paddingTop:moderateScale(10),borderRadius:moderateScale(22)}}>
                        <Text style={[Fonts.fontFamily,Fonts.fontSize18,{color:'#ffffff',textAlign:'center',}]}>
                            验证并申请
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        )
    }

    render(){

        return (
            <View style={[Styles.container]}>
                {this.renderHeader()}
                {this.renderPhone()}
                {this.renderBtn()}
            </View>

        );
    }
}

const styles=ScaledSheet.create({
    _input:{
        height:'44@vs',
        paddingTop:'10@ms',
        paddingLeft:'15@ms',
    },
    _border:{
        borderStyle:'solid',
        borderBottomWidth:1,
        borderColor:'#e5e5e5'
    },
    _vercodeBorder:{
        borderStyle:'solid',
        borderWidth:1,
        borderColor:'#f3916b',
        borderRadius:'13@ms',
    }
});
const mapStateToProps = (state, ownProps) => {
    let data = state.getIn(['user','userData','applyText']);
    let applyVercode = state.getIn(['user','userData','sendVercode']);
    if(Immutable.Map.isMap(data)){ data = data.toJS() }
    if(Immutable.Map.isMap(applyVercode)){ applyVercode = applyVercode.toJS() }
    return { ...ownProps, ...data, ...applyVercode };
};

export default connect(mapStateToProps,{ SendVercode , ApplyText})(Binding);




