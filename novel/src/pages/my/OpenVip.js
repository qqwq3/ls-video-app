'use strict';

import React,{ Component } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, TouchableHighlight, TextInput, Dimensions, StatusBar } from 'react-native';
import { connect } from 'react-redux';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import Immutable from 'immutable';
import { Styles, ScaledSheet,Img, Fonts, Colors, BackgroundColor } from "../../common/Style";
import {arrow, my, openVip} from "../../common/Icons";
import { VipData } from "../../actions/User";
import { infoToast } from "../../common/Tool";
import { pixel } from "../../common/Tool";
import BaseComponent from "../../components/BaseComponent";
import { isVip } from '../../actions/LocalAction';

type Props = {};

class OpenVip extends BaseComponent<Props>{
    constructor(props) {
        super(props);
        this.state={
            days:0,
            balance:0,
            avatar:'',
            name:'未登录',
        };
        this.updateTime = Date.now();
    }

    componentWillMount(){
        const { navigation } = this.props;
        const myInfo = navigation.getParam('myInfo');
        this.setState({
            balance:myInfo.balance !=undefined  ? myInfo.balance : 0,
            days:myInfo.vipDay !=undefined  ? myInfo.vipDay : 0 ,
            name:myInfo.name !=undefined ? myInfo.name : '未登录',
            avatar:myInfo.avatar !=undefined ? myInfo.avatar :'',
        })
    }
    componentWillReceiveProps(nextProps){
        super.componentWillReceiveProps(nextProps);
        const code=nextProps.code;
            if(nextProps && nextProps.timeUpdated> this.updateTime){
                    this.updateTime = Date.now();

                    if(parseInt(code)===0){
                        this.setState({
                            balance: nextProps.data.balance,
                            days: nextProps.data.todayExpire,

                        });
                        infoToast('开通成功');
                        this.props.isVip && this.props.isVip(nextProps.data);
                    }else{
                        infoToast('开通失败');
                    }
            }

    }
    _immediatelyOpen(){
        this.props.VipData && this.props.VipData();
    }


    _goBack(){
        const { navigation } = this.props;
        navigation.goBack();
    }

    renderHeader(){
         return(
            <View style={{paddingBottom:moderateScale(30),backgroundColor:'#272A30'}}>
                <StatusBar
                    backgroundColor="#272A30"
                    barStyle={'light-content'}
                />
                <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={this._goBack.bind(this)}
                >
                    <Image source={arrow.leftWhite} style={[styles.arrow]}/>
                </TouchableOpacity>
            </View>
        )
    }
    renderCard(){
        const ScreenWidth = Dimensions.get('window').width-scale(30);
        const data=this.state.avatar!='' ? true : false;
        return(
            <View style={{backgroundColor:'#272A30',position:'relative'}}>
                <Image source={openVip.card} style={{width:ScreenWidth,height:verticalScale(168),marginLeft:moderateScale(15),borderTopRightRadius:moderateScale(10),borderTopLeftRadius:moderateScale(10)}}/>

                <View style={[styles.readBook,{flexDirection:'row',alignItems:'center'}]}>
                    {
                        data ?
                          <Image source={{uri:this.state.avatar}} style={[Img.resizeModeContain, styles.cardTxImage,{borderRadius:moderateScale(50),marginRight:moderateScale(10)}]}/> :
                          <Image source={my.userDefault} style={[Img.resizeModeContain, styles.cardTxImage,{marginRight:moderateScale(10)}]}/>
                    }
                    <Text style={[Fonts.fontFamily,Fonts.fontSize14,{color:'white'}]}>{this.state.name}</Text>
                </View>

                <View style={[styles.VipSurplus,{flexDirection:'row'}]}>
                    <Text style={[Fonts.fontFamily,Fonts.fontSize12,{color:'white'}]}>VIP 剩余:  </Text>
                    <Text style={[Fonts.fontFamily,Fonts.fontSize12,{color:'white'}]}>{this.state.days}</Text>
                    <Text style={[Fonts.fontFamily,Fonts.fontSize12,{color:'white'}]}>天</Text>
                </View>
            </View>
        )
    }

    renderBalance(){
        return(
            <View style={{justifyContent:'flex-end',flexDirection:'row',alignItems:'center'}}>
                <View style={[styles.balance,{marginTop:verticalScale(15),marginRight:verticalScale(15),flexDirection:'row',justifyContent:'center',alignItems:'center'}]}>
                    <Text style={[Fonts.fontFamily,Fonts.fontSize12,{color:'#f3916b'}]}>余额：</Text>
                    <Text style={[Fonts.fontFamily,Fonts.fontSize12,{color:'#f3916b'}]}>{this.state.balance}</Text>
                </View>
            </View>
        )
    }

    renderContent(){
        return(
            <View style={{alignItems:'center',marginTop:moderateScale(30)}}>
                <View>
                <View style={[styles.center]}>
                    <Image source={openVip.coin} style={{marginRight:moderateScale(20)}}/>
                    <Text style={[Fonts.fontFamily,Fonts.fontSize16,{color:'#808080'}]}>只需<Text style={[Fonts.fontFamily,Fonts.fontSize24,{color:'#f3916b'}]}> 1800 </Text>书币</Text>
                </View>
                <View style={[styles.center]}>
                    <Image source={openVip.books} style={{marginRight:moderateScale(20)}}/>
                    <Text style={[Fonts.fontFamily,Fonts.fontSize16,{color:'#808080'}]}>畅读<Text style={[Fonts.fontFamily,Fonts.fontSize24,{color:'#f3916b'}]}>所有</Text>书籍</Text>
                </View>
                <View style={[styles.center]}>
                    <Image source={openVip.calendar} style={{marginRight:moderateScale(20)}}/>
                    <Text style={[Fonts.fontFamily,Fonts.fontSize16,{color:'#808080'}]}>持续<Text style={[Fonts.fontFamily,Fonts.fontSize24,{color:'#f3916b'}]}> 30 </Text>天</Text>
                </View>
                </View>
            </View>
        )
    }

    renderOpenup(){
        return(
            <View style={{justifyContent:'center',alignItems:'center',marginTop:moderateScale(20)}}>
                <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={this._immediatelyOpen.bind(this)}
                >
                    <View style={{width:scale(300),height:verticalScale(44),backgroundColor:'#f3916b',borderRadius:moderateScale(22),justifyContent:'center',alignItems:'center'}}>
                        <Text style={[Fonts.fontFamily,Fonts.fontSize16,{color:'#ffffff',textAlign:'center'}]}>立即开通</Text>
                    </View>
                </TouchableOpacity>
            </View>
        )
    }

        render(){
            return (
                <View style={[Styles.container]}>
                    {this.renderHeader()}
                    {this.renderCard()}
                    {this.renderBalance()}
                    {this.renderContent()}
                    {this.renderOpenup()}
                </View>
            );
        }
}

const styles = ScaledSheet.create({
    arrow: {
        marginLeft:'15@ms',
        marginTop:'30@ms',
    },
    VipSurplus: {
        position:'absolute',
        bottom:'15@ms',
        right:'40@ms',
    },
    readBook: {
        position:'absolute',
        left:'30@ms',
        top:'15@ms',
    },
    balance: {
        width:'90@s',
        height:'25@vs',
        borderStyle:'solid',
        borderWidth:1,
        borderRadius:'3@ms',
        borderColor:'#f3916b',
    },
    center: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom:'20@ms'
    },
    cardTxImage: {
        width: '50@s',
        height: '50@vs',
    },
});
const mapStateToProps = (state, ownProps) => {
    let userData = state.getIn(['user','userData','openVip']);

    if(Immutable.Map.isMap(userData)){ userData = userData.toJS() }
    return { ...ownProps, ...userData };
};

export default connect(mapStateToProps,{VipData, isVip})(OpenVip);