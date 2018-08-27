
/*提现*/

import React,{ Component } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import * as wechat from 'react-native-wechat';
import { withNavigationFocus } from 'react-navigation-is-focused-hoc';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import Toast from 'react-native-root-toast';
import HeaderBox from '../../common/HeaderBox';
import { withdraw } from '../../actions/wallet';
import { money, width, statusBarSetPublic } from "../../common/tool";
import Dialog from '../Common/Dialog';

class Withdrwal extends Component{
    constructor(props){
        super(props);
        this.state = {
            moneySelectIndex: 0,
            money: 0,
            currentMoney:0,
            //快速提现
            quickDay:0,
            quickMoney:0,
            //是否是新用户
            isNewUser:false,
            newText:'',
            status: false
        };
        this.moneyArr = [ 1, 30, 50, 100, 200, 500 ];
        this.startTime = Date.now();
    }
    componentWillMount() {
        let obj = (this.props.navigation && this.props.navigation.state && this.props.navigation.state.params) || false;
        const currentMoney = obj.currentMoney || 0;
        const quickDay = obj.quickDay || 0;
        let quickMoney = obj.quickMoney || 0;
        quickMoney = money(quickMoney,0);
        const isNewUser = obj.isNewUser || false;
        this.moneyArr[0] = quickMoney;
        this.setState({currentMoney:currentMoney,quickDay:quickDay,quickMoney:quickMoney,money:quickMoney,isNewUser:isNewUser});
    }
    componentWillReceiveProps(nextProps) {
        if(nextProps.txData && nextProps.txData.timeUpdated > this.startTime){
            this.startTime = nextProps.txData.timeUpdated;
            let txData = nextProps.txData;
            this._txControl(txData);
        }

        // 进入本组件的一些处理
        if (!this.props.isFocused && nextProps.isFocused) {
            this._startBarSet();
        }
        // 离开本组件的一些处理
        if (this.props.isFocused && !nextProps.isFocused) {

        }
    }
    _txControl(txData){
        this.setState({status: false});

        if(txData.code === 0){
            this.setState({currentMoney:txData.data.balance});
            //提现成功
            this.setState({newText:'提现成功，将在1~5个工作日内到账'});
            this.popExitRef && this.popExitRef.modeShow();
        }

        if(txData.code === 10000){
            this.setState({currentMoney:txData.message.balance});
            switch (txData.message.authPlatform){
                case 'SP':
                    //获取订单号
                    let num = txData.message.orderId;
                    let smallId =  txData.message.authParams;
                    //绑定小程序
                    this._bindSmall(smallId,num);
                    break;
                case 'WX':
                    let wxName =  txData.message.authParams;
                    this.setState({newText:'请在微信关注公众号“'+wxName+'”提现'});
                    this.popExitRef && this.popExitRef.modeShow();
                    break;
            }
        }

        //未绑定手机号  跳转到绑定手机号页面
        if(txData.code === 40302){
            const {navigation} = this.props;
            return navigation.navigate('BindPhone');
        }

        if(txData.code !== 0 && txData.code !== 10000  && txData.code !== 40302){
            Toast.show(txData.message,{duration:3500});
        }
    }
    // 状态栏设置
    _startBarSet() {
        statusBarSetPublic && statusBarSetPublic('rgb(0,117,248)','light-content',true);
    }
    // 状态栏还原
    _startBarReduction() {
        statusBarSetPublic && statusBarSetPublic('rgb(255,255,255)','dark-content',true);
    }
    // 返回
    _goBack(){
        const { navigation } = this.props;
        navigation.goBack();
    }
    // 提现记录
    _withdrawalRecodes(){

    }
    //提现
    _withdrawal(){
        const {withdraw} = this.props;
        const {money,currentMoney,moneySelectIndex,isNewUser,quickDay,quickMoney} = this.state;
        let amount = money*100;

        // if(amount > currentMoney){
        //     Toast.show("余额不足",{duration:3500});
        //     return;
        // }

        let type = 'large';

        if(moneySelectIndex === 0){
            //不是新用户
            if(!isNewUser){
                if(quickDay < 4){
                    let days = 4 - quickDay;
                    this.setState({newText:'继续观看' + days + '天，每天5分钟，即可提现'+quickMoney+'元'});
                    this.popExitRef && this.popExitRef.modeShow();
                    return;
                }
            }
            // else{
            //     this.setState({isNewUser:false,});
            // }
            type = 'fast';
        }

        withdraw && withdraw(amount,type);
        this.setState({status: true});
    }
    //绑定小程序
    _bindSmall(smallId,num){
        wechat.registerApp("wx4f60c8eebaec00f1");
        wechat.launchMiniProgram(smallId,'pages/main/index?index=true&num='+num)
            .then(success => {
                console.log("launchMiniProgram", success);
            })
            .catch(err => {
                console.log("launchMiniProgram", err);
            })
    }
    // 选中 - demo
    _checked(){
        return (
            <View style={styles.forBox}>
                <Image source={require('./selfImg/pay_tick.png')} resizeMode={'contain'} style={styles.iconFor} />
            </View>
        );
    }
    // 提现金额 - 点击事件
    _onPressTxMoney({item, index}){
        this.setState({moneySelectIndex: index, money: item});
    }
    // 提现金额 - demo
    _txMoneyDemo(){
        return this.moneyArr.map((item,index) => this._renderItem(item,index));
    }
    // 渲染
    _renderItem(item, index){
        const { moneySelectIndex } = this.state;
        let backgroundColor = moneySelectIndex === index ? 'rgba(0,117,248,0.1)' : 'transparent';
        let selectBorder = moneySelectIndex === index ? styles.blueBorder : styles.grayBorder;
        let selectCheckBox = moneySelectIndex === index ? this._checked() : null;
        let textColor = moneySelectIndex === index ? '#404040' : '#afafc0';

        return (
            <View key={index} style={[styles.dBoxM]}>
                <TouchableOpacity
                    activeOpacity={0.50}
                    style={[styles.dRadioBox,selectBorder,{backgroundColor:backgroundColor,flex:1}]}
                    onPress={this._onPressTxMoney.bind(this,{item,index})}
                >
                    <Text style={[styles.dTxTypeWHText,{color:textColor}]}>{ item }元</Text>
                    { selectCheckBox }
                    <View style={{position:'absolute',width:1,height:0.5,backgroundColor:'#dcdcdc'}} />
                </TouchableOpacity>
            </View>
        );
    }
    // 立即退出
    onConfirmExit(){
        this.popExitRef && this.popExitRef.modeHide();
    }
    renderNewsShow(){
        const { newText } = this.state;

        return (
            <Dialog
                popHeight={160}
                ref={ref => this.popExitRef = ref}
                animationType={'fade'}
                title={'系统提示'}
                buttonRightText={'确定'}
                buttons={1}
                mandatory={true}
                onConfirm={this.onConfirmExit.bind(this)}
            >
                <View style={styles.popContent}>
                    <Text style={styles.popContentText}>{newText}</Text>
                </View>
            </Dialog>
        );
    }
    // 头部 - demo
    renderHeader(){
        return (
            <HeaderBox
                isEdit={false} // true
                isText={true}
                text={'我的提现'}
                isArrow={true}
                backgroundColor={'rgb(0,117,248)'}
                borderBottomColor={'rgb(0,117,248)'}
                titleColor={'#FFF'}
                arrowColor={'#FFF'}
                goBack={this._goBack.bind(this)}
                rightElement={
                    <TouchableOpacity activeOpacity={0.5} onPress={this._withdrawalRecodes.bind(this)} style={styles.rightBox}>
                        <Text style={styles.rightBoxText}>提现记录</Text>
                    </TouchableOpacity>
                }
            />
        );
    }
    // 当前余额 - demo
    renderCurrentMoney(){
        const { currentMoney } = this.state;
        const showCurrentMany =  money(currentMoney);

        return (
            <LinearGradient colors={['rgb(0,117,248)', '#5CA7FF']} style={[styles.selfHeader]}>
                <View style={[styles.line,{marginTop:15,marginBottom:10}]}>
                    <Text style={[styles.currentYText,styles.fontFamily]}>当前余额</Text>
                </View>
                <View style={styles.line}>
                    <Text style={[styles.currentMoney,styles.fontFamily]}><Text style={{fontSize:18}}>￥</Text>{showCurrentMany}</Text>
                </View>
            </LinearGradient>
        );
    }
    // 提现方式 - demo
    renderWithdrawalWay(){
        return (
            <View style={[styles.layerBox]}>
                <ScrollView  showsVerticalScrollIndicator={false} style={[styles.myBox]}>
                    <View style={styles.dBox}>
                        <View style={[styles.dBoxView,{marginTop:10,paddingHorizontal:10}]}>
                            <Text style={[styles.dBoxText,styles.fontFamily]}>提现方式</Text>
                        </View>
                        <View style={[styles.dBoxView,{paddingHorizontal:10}]}>
                            <TouchableOpacity activeOpacity={0.50} style={[styles.dRadioBox,styles.blueBorder,styles.dTxTypeWH,{backgroundColor:'rgba(0,117,248,0.1)'}]}>
                                <Text style={styles.dTxTypeWHText}>微信零钱</Text>
                                <Image source={require('./selfImg/icon_wechatpay.png')} resizeMode={'contain'} style={styles.iconWx} />
                                { this._checked() }
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.dBox}>
                        <View style={[styles.dBoxView,{marginTop:10,paddingHorizontal:10}]}>
                            <Text style={[styles.dBoxText,styles.fontFamily]}>提现金额</Text>
                        </View>
                        <View style={[styles.dBoxView,{paddingBottom:0}]}>
                            { this._txMoneyDemo() }
                        </View>
                    </View>

                    <View style={styles.dBox}>
                        <Text style={[styles.dBoxText,styles.fontFamily,{fontSize:12,marginLeft:10,marginBottom:5}]}>注意事项</Text>
                        <Text style={[styles.dBoxText,styles.fontFamily,{fontSize:13,marginLeft:10,color:'red'}]}>
                            1.您需要授权“超视二维码”小程序
                        </Text>
                        <Text style={[styles.dBoxText,styles.fontFamily,{fontSize:12,marginLeft:10,marginTop:5}]}>
                            2.提现申请将在1~3个工作日内审批
                        </Text>
                    </View>

                    <View style={styles.rowsFooter}>
                        <TouchableOpacity
                            activeOpacity={0.50}
                            style={styles.withdrawalBtn}
                            onPress={this._withdrawal.bind(this)}
                        >
                            <Text style={[styles.withdrawalBtnText,styles.fontFamily]}>立即提现</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        );
    }
    // 加载 - demo
    renderLoading(){
        const { status } = this.state;
        return (!status ? null : <View style={styles.loading}><ActivityIndicator color={'rgb(0,117,248)'} size={'small'} /></View>);
    }
    render(){
        return (
            <View style={styles.content}>
                { this.renderHeader() }
                { this.renderCurrentMoney() }
                { this.renderWithdrawalWay() }
                { this.renderNewsShow() }
                { this.renderLoading() }
            </View>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    let data = state.getIn(['wallet','withdraw']);

    if (Immutable.Map.isMap(data)) { data = data.toJS() }
    return { ...ownProps, ...data };
};

export default withNavigationFocus(connect(mapStateToProps, { withdraw })(Withdrwal));

const styles = StyleSheet.create({
    layerBox:{
        flex:1,
        position:'relative',
        zIndex:100,
        marginTop: moderateScale(-40)
    },
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
    popContent:{
        flex:1,
        justifyContent:'center',
        alignItems:'center'
    },
    popContentText:{
        fontSize:14,
        color:'#333'
    },
    fontFamily: {
        fontFamily: 'PingFangSC-Medium',
    },
    blueBorder:{
        borderWidth:0.5,
        borderColor:'rgb(0,117,248)'
    },
    grayBorder:{
        borderWidth:0.5,
        borderColor:'#afafc0'
    },
    dTxMoneyWH:{
        height:50,
        width:90,
    },
    dBoxM:{
        width: (width - 40) / 3,
        height: 50,
        paddingHorizontal: 10,
        marginBottom:20
    },
    forBox:{
        position:'absolute',
        top:5,
        left:5,
        width:15,
        height:15,
        borderRadius:10,
        overflow:'hidden',
        zIndex:10,
        backgroundColor:'rgb(0,117,248)',
        justifyContent:'center',
        alignItems:'center'
    },
    iconFor:{
        height:8,
        width:8
    },
    dBox:{

    },
    iconWx:{
        width:32,
        height:32,
        marginLeft:10
    },
    dBoxView:{
        paddingBottom:15,
        flexDirection:'row',
        flexWrap: 'wrap'
    },
    dRadioBox:{
        borderRadius:4,
        overflow:'hidden',
        position:'relative',
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center'
    },
    dTxTypeWH:{
        width:140,
        height:70,
    },
    dTxTypeWHText:{
        fontSize:16,
        color:'#404040'
    },
    dBoxText:{
        fontSize:14,
        color:'#afafc0'
    },
    currentYText:{
        fontSize:12,
        color:'#ffffff'
    },
    withdrawalBtn:{
        width:150,
        height:40,
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:'rgb(0,117,248)',
        overflow:'hidden',
        borderRadius:40,
        elevation:2,
    },
    withdrawalBtnText:{
        fontSize:16,
        color:'#fff'
    },
    rowsFooter:{
        flexDirection:'row',
        alignItems:"center",
        justifyContent:'center',
        paddingVertical:40
    },
    myBox: {
        position: 'relative',
        marginHorizontal:10,
        // height: verticalScale(390),
        backgroundColor: '#FFFFFF',
        borderTopRightRadius:6,
        borderTopLeftRadius:6,
        elevation: 2.5,
        zIndex: 100,
        padding:10,
        flex:1
    },
    currentMoney:{
        fontSize:24,
        color:'#ffffff'
    },
    line:{
        flexDirection:'row',
        justifyContent:'center'
    },
    rightBox:{
        width:100,
        height:44,
        justifyContent:'flex-end',
        alignItems:'center',
        position:'absolute',
        top:0,
        right:0,
        zIndex:100,
        flexDirection:'row',
        paddingRight:15
    },
    rightBoxText:{
        color:'#fff',
        fontSize:14,
    },
    selfHeader: {
        height: verticalScale(136),
        backgroundColor: 'rgb(0,117,248)',
        position: "relative"
    },
    content:{
        flex:1,
        backgroundColor:'#fff',
        position:'relative',
        overflow:'hidden'
    },
});




























