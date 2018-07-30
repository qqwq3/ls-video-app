
'use strict';

import React, { Component } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import { scale, verticalScale } from 'react-native-size-matters';
import { Styles, ScaledSheet, Fonts, BackgroundColor, Colors, Img } from "../../common/Style";
import Header from '../../components/Header';
import { signIn } from "../../common/Icons";
import { checkSignIn, userSignIn } from "../../actions/User";
import { infoToast, setStatusBar } from "../../common/Tool";
import BaseComponent from "../../components/BaseComponent";

type Props = {};

class SignIn extends BaseComponent<Props>{
    constructor(props){
        super(props);
        this.state = {
            sigInArr: [1, 2, 3, 4, 5, 6],
            signIn: true,
            signInDays: 0,
            totalRewards: 0
        };
        this.updateTime = Date.now();
    }
    componentDidMount() {
        const { checkSignIn } = this.props;

        setStatusBar && setStatusBar(BackgroundColor.bg_ff5a5a,true);
        checkSignIn && checkSignIn();
    }
    componentWillReceiveProps(nextProps) {
        super.componentWillReceiveProps(nextProps);

        if(nextProps && nextProps.timeCheckUpdated > this.updateTime){
            this.updateTime = Date.now();
            const code = nextProps.check.code;
            const data = nextProps.check.data;

            if(parseInt(code) === 0){
                this.setState({
                    signInDays: data.cycleDays + 1,
                    signIn: data.singed,
                    totalRewards: data.totalRewards
                });
            }
        }

        if(nextProps && nextProps.timeSignUpdated > this.updateTime){
            this.updateTime = Date.now();
            const data = nextProps.data;

            this.setState({
                signInDays: data.cycleDays + 1,
                signIn: true,
                totalRewards: data.totalRewards
            });
            infoToast && infoToast(data.text);
        }
    }
    componentWillUnmount() {
        setStatusBar && setStatusBar(BackgroundColor.bg_fff,true);
    }
    // 返回 - function
    _goBack(){
        const { navigation } = this.props;
        navigation.goBack();
    }
    // 头部 - demo
    renderHeader(){
        return (
            <Header
                isTitleRight={true}
                title={'签到'}
                titleColor={Colors.white_FFF}
                isArrow={true}
                arrowColor={BackgroundColor.bg_fff}
                borderBottomColor={BackgroundColor.bg_ff5a5a}
                goBack={this._goBack.bind(this)}
                headerBackgroundColor={BackgroundColor.bg_ff5a5a}
                // titleRightChildren={
                //     <TouchableOpacity
                //         activeOpacity={0.5}
                //         style={[styles.titleRightChildren, Styles.paddingRight15]}
                //     >
                //         <Image source={signIn.info} style={[Img.resizeModeContain, styles.titleRightChildrenImage]}/>
                //     </TouchableOpacity>
                // }
            />
        );
    }
    // 展示模块 - demo
    renderViewBox(){
        return (
            <LinearGradient colors={[BackgroundColor.bg_ff5a5a, BackgroundColor.bg_f3916b]} style={[styles.linearView]}>
                <View style={[styles.titleImage, Styles.flexCenter]}>
                    <Image source={signIn.title} style={[Img.resizeModeContain]}/>
                </View>
                <View style={styles.rewardImage}>
                    <Image
                        source={signIn.coin}
                        style={[Img.resizeModeContain, styles.coinImage, {marginTop: verticalScale(-12), marginLeft: scale(-16)}]}
                    />
                    <View style={styles.rewardBox}>
                        <View style={{alignItems:'center',marginTop: verticalScale(60)}}>
                            <Text style={[Fonts.fontFamily, Fonts.fontSize15, Colors.white_FFF]}>累计获得</Text>
                        </View>
                        <View style={{alignItems:'center',marginTop: verticalScale(25)}}>
                            <Text style={[Fonts.fontFamily, Fonts.fontSize36, Colors.white_FFF]}>{ this.state.totalRewards || 0 }</Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>
        );
    }
    // 内容 - demo
    renderContent(){
        return (
            <View style={[styles.content]}>
                <ScrollView showsVerticalScrollIndicator={true}>
                    { this.renderViewBox() }
                    { this.renderViewFooter() }
                </ScrollView>
            </View>
        );
    }
    // 底部 - demo
    renderViewFooter(){
        return (
            <View style={[styles.footerContent, Styles.flexCenter]}>
                <View style={[Styles.paddingHorizontal15, Styles.row]}>
                    <View style={styles.signInCircleCollection}>
                        {
                            this.state.sigInArr.map((item,index) => {
                                const backgroundColor = this.state.signInDays <= index ? BackgroundColor.bg_e5e5e5 : BackgroundColor.bg_f3916b;

                                return (
                                    <View key={index} style={styles.signInBox}>
                                        <View style={[{backgroundColor: backgroundColor}, styles.signInCircle, styles.signInCircleWH30, Styles.flexCenter]}>
                                            {
                                                this.state.signInDays <= index ?
                                                (<Text style={[Fonts.fontFamily, Fonts.fontSize14, Colors.white_FFF]}>{ item }</Text>) :
                                                (<Image source={signIn.tic} style={[Img.resizeModeContain]}/>)
                                            }
                                        </View>
                                        <View style={[{backgroundColor: backgroundColor}, styles.signInView]} />
                                    </View>
                                )
                            })
                        }
                    </View>
                    <View style={[{
                        backgroundColor: this.state.signInDays === 7 ? BackgroundColor.bg_f3916b : BackgroundColor.bg_e5e5e5},
                        styles.signInCircle, Styles.flexCenter, styles.signInCircleWH40]}
                    >
                        {
                            this.state.signInDays === 7 ?
                            (<Image source={signIn.tic}  style={[Img.resizeModeContain]}/>) :
                            (<Image source={signIn.gift} style={[Img.resizeModeContain]}/>)
                        }
                    </View>
                </View>
                <View style={[Styles.marginTop15, Styles.alignItemsCenter]}>
                    <Text style={[Fonts.fontFamily, Fonts.fontSize15, Colors.orange_f3916b]}>已连续签到
                    <Text style={[Fonts.fontWeightBold, Fonts.fontSize24]}> { this.state.signInDays } </Text>天</Text>
                </View>
                <View style={[Styles.alignItemsCenter]}>
                    {
                        this.state.signIn ?
                        <View style={[styles.signInButton, Styles.flexCenter, {backgroundColor: BackgroundColor.bg_e5e5e5}]}>
                            <Text style={[Fonts.fontFamily, Fonts.fontSize20, Colors.white_FFF]}>已签到</Text>
                        </View> :
                        <TouchableOpacity
                            onPress={() => this._signIn()}
                            style={[styles.signInButton, Styles.flexCenter]}
                            activeOpacity={0.75}
                        >
                            <Text style={[Fonts.fontFamily, Fonts.fontSize20, Colors.white_FFF]}>签到</Text>
                        </TouchableOpacity>
                    }
                </View>
            </View>
        );
    }
    // 签到 - function
    _signIn(){
        const { userSignIn } = this.props;

        // this.setState({
        //     signInDays: this.state.signInDays + 1,
        //     totalRewards: res.data.total_rewards,
        //     signIn: true,
        // });

        userSignIn && userSignIn();
    }
    render(){
        return (
            <View style={[Styles.container, {backgroundColor: BackgroundColor.bg_fff}]}>
                { this.renderHeader() }
                { this.renderContent() }
            </View>
        );
    }
}

const styles = ScaledSheet.create({
    signInView: {
        flex: 1,
        height: '2@vs',
    },
    signInButton:{
        backgroundColor:'#f3916b',
        height: '40@vs',
        width: '190@s',
        borderRadius: '20@ms',
        overflow: 'hidden',
        marginTop: '30@ms',
    },
    signInCircleWH30: {
        width: '31@s',
        height: '31@vs'
    },
    signInCircleWH40: {
        width: '40@s',
        height: '40@vs'
    },
    signInCircle: {
        borderRadius: '40@ms',
        overflow: 'hidden',
    },
    signInBox:{
        flex: 1,
        height: '40@vs',
        flexDirection: 'row',
        alignItems: 'center',
    },
    signInCircleCollection:{
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerContent: {
        height: '210@vs',
        position: 'relative'
    },
    coinImage: {
        alignSelf:'center',
    },
    linearView: {
        paddingBottom: '40@ms',
    },
    rewardBox:{
        backgroundColor: 'transparent',
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        right: 0,
        zIndex: 200,
    },
    titleImage:{
        flexDirection: 'row',
        overflow: "hidden",
        marginTop: '20@ms',
        marginBottom: '20@ms',
    },
    rewardImage:{
        overflow: 'hidden',
        position: 'relative',
    },
    content: {
        flex: 1,
        position: 'relative'
    },
    titleRightChildren: {
        height: '100%',
        width: '100@s',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    titleRightChildrenImage: {
        width: "16@s",
        height: "16@vs",
        tintColor: BackgroundColor.bg_fff,
    },
});

const mapStateToProps = (state, ownProps) => {
    let userData = state.getIn(['user','userData','signIn']);

    if(Immutable.Map.isMap(userData)){ userData = userData.toJS() }
    return { ...ownProps, ...userData };
};

export default connect(mapStateToProps,{ checkSignIn, userSignIn })(SignIn);
