import React,{Component} from 'react';
import {
    Text,
    View,
    Image,
    TextInput,
    TouchableOpacity,
    Dimensions,
    Keyboard,
    ImageBackground,
    StatusBar,
} from 'react-native';
import Toast from 'react-native-root-toast';
import {ChargeImg,arrow} from '../../common/Icons';
import { connect } from  'react-redux';
import Immutable from 'immutable';
import { ScaledSheet, Fonts} from '../../common/Style' ;
import { moderateScale,scale,verticalScale } from 'react-native-size-matters';
//import {loadBanners} from "../../actions/Bookshelf";
import { ChargeCode } from "../../actions/User";
import { infoToast } from "../../common/Tool";
import BaseComponent from "../../components/BaseComponent";

type Props={};
type State={};

class Charge extends BaseComponent<Props,State>{
    constructor(props){
        super(props);
        this.state={
            viewBottom:verticalScale(30),
            chargeCodeValue:'',
            mapLabel: new Map(),
            status: false,
            viewBgBottom:verticalScale(0)
        };
        this.updateTime = Date.now();
    }
    componentWillMount(){
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow',this._keyboardDidShow.bind(this));
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide',this._keyboardDidHide.bind(this));
    }
    componentWillReceiveProps(nextProps) {
        super.componentWillReceiveProps(nextProps);
        if(nextProps && nextProps.timeUpdated > this.updateTime){
            this.updateTime = Date.now();
            const message = "兑换成功";
            return infoToast(message);
        }
    }

    componentWillUnmount(){
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }
    render(){
        let ScreenWidth = Dimensions.get('window').width;
        let agentWechat = "pob9990";
        let qrcodeImg = 'http://novel-res.oss-cn-hangzhou.aliyuncs.com/agent_qrcode/10.jpg';
        let unitPrice = 10;
        if(global.launchSettings && global.launchSettings.agentData && global.launchSettings.agentData.data) {
            agentWechat = global.launchSettings.agentData.data.wechat;
            qrcodeImg = global.launchSettings.agentData.data.qrcodeName;
            unitPrice = global.launchSettings.agentData.data.codeUnitPrice
        }
        return(
            <ImageBackground source={ChargeImg.chargeBgImg} style={{height:'100%',width:ScreenWidth,position:'absolute',marginBottom:this.state.viewBgBottom}}>
                <StatusBar
                     backgroundColor={'#1B0d61'} barStyle={'light-content'}
                />
                <TouchableOpacity onPress={()=>{this._goBack()}} >
                    <Image source={arrow.leftWhite} style={[styles.leftArrow]}/>
                </TouchableOpacity>
                    <View style={[styles.contentView,{bottom:this.state.viewBottom}]}>
                        <View style={{marginBottom:moderateScale(15)}}>
                            <Text style={[styles.chargeCode,Fonts.fontFamily,Fonts.fontSize24]}>充值码</Text>
                        </View>
                            <TextInput placeholder='粘贴充值码' placeholderTextColor="#b2b2b2" style={[styles.copyCodeInput,Fonts.fontFamily,Fonts.fontSize12]}
                            underlineColorAndroid='transparent'
                            onChangeText={(text)=>{this.regChargeCode(text)}}
                            />
                            <TouchableOpacity style={styles.chargeButton} onPress={()=>{this.submitChargeCode()}}>
                                 <Text style={[styles.chargeButtonText,Fonts.fontFamily,Fonts.fontSize15]} >立即充值</Text>
                            </TouchableOpacity>
                            <View style={{marginBottom:moderateScale(10)}}>
                                <Image source={{uri:qrcodeImg}} style={{width:scale(100),height:verticalScale(100)}} />
                            </View>
                            <Text style={[styles.allText,styles.oneText,Fonts.fontFamily]}>每个充值码{unitPrice}元，可兑换1000书币</Text>
                            <Text style={[styles.allText,styles.oneText,Fonts.fontFamily]}>购买充值码请联系微信客服：
                                <Text style={[styles.twoText,Fonts.fontFamily]}>{ agentWechat }</Text>
                            </Text>
                    </View>
                </ImageBackground>
            )
    }
    _goBack(){
        const { navigation } = this.props;
        navigation.goBack();
    }
    _keyboardDidShow(e){
        //键盘的高度e.endCoordinates.height
        this.setState({
            viewBottom:verticalScale(-e.endCoordinates.height+150),
            viewBgBottom:verticalScale(e.endCoordinates.height)
        })
    }
    _keyboardDidHide(e){
        this.setState({
            viewBottom:verticalScale(30),
            viewBgBottom:0
        })
    }
    //输入验证码的函数
    regChargeCode(text){
        this.setState({
            chargeCodeValue:text
        })
    }
    //点击提交之后验证
    submitChargeCode(){
        // const login = isLogin(this.props);
        // if(!login){
        //     return infoToast('请先登录');
        // }

        let chargeCode=this.state.chargeCodeValue;
        //console.log(chargeCode)
        let reg=/^[0-9a-zA-Z]+$/;
        let result=reg.test(chargeCode);
        this.setState({
            status: true,
        });
        if(!result){ //不符合表达式要求
            return Toast.show('请输入正确充值码',{ duration: 2000, position: 220 })
        }
        let agentTag = (global.launchSettings && global.launchSettings.agentTag) || '10';
        this.props.ChargeCode && this.props.ChargeCode(agentTag, chargeCode)
    }
}
const styles = ScaledSheet.create({
    contentView:{
        position:'absolute',
        width:'100%',
        alignItems:'center',
    },
    chargeCode:{
        color:'#808080',
        fontWeight:'200'
    },
    copyCodeInput:{
        backgroundColor: '#f1f1f1',
        height:'44@vs',
        width:'210@s',
        borderRadius:'5@ms',
        color:'#b2b2b2',
        paddingLeft:'20@ms'
    },
    chargeButton:{
        width:'210@s',
        height:'44@vs',
        borderRadius:'22@ms',
        backgroundColor:'#f3916b',
        alignItems:'center',
        justifyContent:'center',
        marginTop:'15@ms',
        marginBottom:'15@ms'
    },
    chargeButtonText:{
        color:'#fff',
    },
    allText:{
        fontSize:10,
        alignItems:'center',
    },
    oneText:{
        color:'#b2b2b2',
    },
    twoText:{
        color:'#f3916b',
        fontSize:10
    },
    leftArrow:{
        marginTop:'30@ms',
        marginLeft:'15@ms',
    }
});

const mapStateToProps = (state,ownProps)=>{
    let userData = state.getIn(['user', 'userData','codeInfo']);
    if(Immutable.Map.isMap(userData)){ userData = userData.toJS() }
    return { ...ownProps, ...userData };
};

export default connect(mapStateToProps,{ChargeCode})(Charge);