
'use strict';

import React, { Component } from 'react';
import {View, Text, TouchableOpacity, Alert, BackHandler} from 'react-native';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import { scale, verticalScale } from 'react-native-size-matters';
import Switch from 'react-native-switch-pro';
import clear from 'react-native-clear-cache';
import { Styles, ScaledSheet, Fonts, BackgroundColor, Colors } from "../../common/Style";
import Header from '../../components/Header';
import Rows from '../../components/Rows';
import { logout } from "../../actions/User";
import { infoToast, setAppBrightness } from "../../common/Tool";
import { updateBookshelf } from '../../actions/LocalAction';
import { commonSave, commonLoad } from "../../common/Storage";
import { VERSION } from "../../common/Keys";
import Dialog from '../../components/Dialog';

type Props = {};

class Setting extends Component<Props>{
    constructor(props){
        super(props);
        this.state = {
            value: false,
            currentState: false,
            cacheSize: 0,
            unit: ''
        };
        this.currentTime = Date.now();
    }
    async componentWillMount() {
        let mode = await commonLoad('modeChange');

        mode && this.setState({value: mode.value});

        // 获取app应用缓存大小
        this._getApplicationCache();
    }
    componentWillReceiveProps(nextProps){
        const { navigation, updateBookshelf } = nextProps;

        if(!nextProps.login && this.state.currentState){
            if(parseInt(nextProps.code) === 0 && nextProps.logoutTimeUpdated > this.currentTime){
                this.currentTime = nextProps.logoutTimeUpdated;

                updateBookshelf && updateBookshelf(true);

                infoToast && infoToast('退出成功',{
                    duration: 2000,
                    position: verticalScale(-55),
                    delay: 0,
                    onHide: () => {
                        navigation && navigation.goBack();
                    }
                });
            }

            this.setState({currentState: false});
        }
    }
    // 获取app应用缓存大小 - function
    _getApplicationCache(){
        clear.getCacheSize((value,unit)=>{
            this.setState({
                cacheSize: value, // 缓存大小
                unit: unit  // 缓存单位
            })
        });
    }
    // 清除缓存 - function
    _clearApplicationCache(){
        clear.runClearCache(()=>{
            infoToast && infoToast('清除成功');
            this._getApplicationCache();
        });
    }
    // 清除缓存 - 确定 - function
    onDismissExit(){
        this._clearApplicationCache();
        this.popExitRef && this.popExitRef.modeHide();
    }
    // 清除缓存 - 取消 - function
    onConfirmExit(){
        this.popExitRef && this.popExitRef.modeHide();
    }
    // 清除缓存提示 - demo
    renderClearCachePrompt(){
        return (
            <Dialog
                popHeight={verticalScale(180)}
                ref={ref => this.popExitRef = ref}
                animationType={'slide'}
                title={'系统提示'}
                buttonLeftText={'确定'}
                buttonRightText={'取消'}
                mandatory={true}
                onDismiss={this.onDismissExit.bind(this)}
                onConfirm={this.onConfirmExit.bind(this)}
            >
                <View style={[Styles.flexCenter, Styles.flex1]}>
                    <Text style={[Fonts.fontSize15, Fonts.fontFamily, Colors.gray_404040]}>确定要清除APP当前应用缓存吗？</Text>
                </View>
            </Dialog>
        );
    }
    // 清除app应用缓存
    _clearCache(){
        const { cacheSize } = this.state;

        if(cacheSize === (0 || '0')){
            return infoToast && infoToast('暂无应用缓存');
        }

        // Alert.alert('系统提示','确定要清除APP当前应用缓存吗？',[
        //     { text: '取消', onPress: () => {} },
        //     { text: '确定', onPress: () => this._clearApplicationCache() }
        // ]);

        this.popExitRef && this.popExitRef.modeShow();
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
                title={'设置中心'}
                isArrow={true}
                goBack={this._goBack.bind(this)}
            />
        );
    }
    // 切换模式 - function - 2
    _onSyncPress(value = {}){
        // 开启夜间模式
        if(value === true){
            setAppBrightness(0.05);
        }

        // 关闭夜间模式
        if(value === false){
            setAppBrightness(0.20);
        }

        this.setState({value: value});

        // 本地缓存
        commonSave && commonSave('modeChange', {value});
    }
    // 夜间模式 - demo
    renderModeSwitching(){
        return (
            <Rows
                isClick={false}
                showLeftTitle={true}
                leftTitle={this.state.value ? '夜间模式' : '日间模式'}
                showBottomBorder={true}
                isRightConfigure={false}
                nonConfigRightComponents={
                    <Switch
                        width={scale(50)}
                        height={verticalScale(25)}
                        style={{marginTop: 0}}
                        value={this.state.value}
                        backgroundActive={BackgroundColor.bg_f3916b}
                        backgroundInactive={'#dcdcdc'}
                        onSyncPress={this._onSyncPress.bind(this)}
                    />
                }
            />
        );
    }
    // 清理缓存 - demo
    renderCleanCache(){
        return (
            <Rows
                isClick={true}
                callBack={this._clearCache.bind(this)}
                showLeftTitle={true}
                leftTitle={'清理缓存'}
                showBottomBorder={false}
                isRightConfigure={false}
                nonConfigRightComponents={
                    <Text
                        style={[Fonts.fontFamily, Fonts.fontSize12, Colors.gray_b2b2b2]}
                    >
                        { this.state.cacheSize }
                        { this.state.unit }
                    </Text>
                }
            />
        );
    }
    // 线 - demo
    renderLine(){
        return (<View style={[Styles.line, {backgroundColor: BackgroundColor.bg_f1f1f1}]}/>);
    }
    // 退出登录 - demo
    renderButton(){
        return (
            <View style={[Styles.row, styles.butBox, Styles.flexCenter]}>
                <TouchableOpacity
                    activeOpacity={0.5}
                    style={[styles.but, Styles.flexCenter]}
                    onPress={this._logout.bind(this)}
                >
                    <Text style={[Fonts.fontFamily, Fonts.fontSize15, Colors.orange_f3916b]}>退出登录</Text>
                </TouchableOpacity>
            </View>
        );
    }
    // 退出登录 - function
    _logout(){
        const { logout  } = this.props;

        logout && logout();
        this.setState({currentState: true});
    }
    // 当前App版本 - demo
    renderCurrentAppVersion(){
        return (
            <Rows
                isClick={false}
                showLeftTitle={true}
                leftTitle={'当前版本'}
                showBottomBorder={false}
                isRightConfigure={false}
                nonConfigRightComponents={
                    <Text style={[Fonts.fontFamily, Fonts.fontSize12, Colors.gray_b2b2b2]}>
                        { VERSION }
                    </Text>
                }
            />
        );
    }
    render(){
        return (
            <View style={[Styles.container, {backgroundColor: BackgroundColor.bg_f1f1f1}]}>
                { this.renderHeader() }
                { this.renderLine() }
                { this.renderModeSwitching() }
                { this.renderCleanCache() }
                { this.renderLine() }
                { this.renderCurrentAppVersion() }
                { this.renderButton() }
                { this.renderClearCachePrompt() }
            </View>
        );
    }
}

const styles = ScaledSheet.create({
    butBox: {
        marginTop: '60@ms',
    },
    but: {
        width: '80%',
        height: '44@vs',
        backgroundColor: BackgroundColor.bg_fff,
        borderRadius: '50@ms',
        overflow: 'hidden',
    },
});

const mapStateToProps = (state, ownProps) => {
    let data = state.getIn(['user', 'userData']);

    if(Immutable.Map.isMap(data)){ data = data.toJS() }
    return { ...ownProps, ...data };
};

export default connect(mapStateToProps, { logout, updateBookshelf })(Setting);




















