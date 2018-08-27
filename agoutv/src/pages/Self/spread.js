'use strict';

import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Share,
    Clipboard,
    StatusBar,
    Alert,
    Keyboard,
} from 'react-native';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import Toast from 'react-native-root-toast';
import XingrenInputModal from '../../components/XingrenInputModal';
import HeaderBox from '../../common/HeaderBox';
import RightElement from './RightElement';
import {loadDevice, bindInvite, switchAccount} from "../../actions/spread";
import { pixel } from "../../common/tool";

const util = require('../../common/Util');

class SpreadScreen extends React.Component {
    static navigationOptions = {
        header: null,
        tabBarVisible: false,
    };
    static propTypes = {
        timeUpdated: PropTypes.number,
        isLoading: PropTypes.bool,
    };
    constructor(props) {
        super(props);
        this._icModal = null;
        this._acModal = null;
        this.params = this.props.navigation.state.params;
    }
    componentDidMount() {
        let {params} = this.props.navigation.state;

        this.props.loadDevice();
        this._keyboardHide = Keyboard.addListener('keyboardDidHide',this._keyboardDidHideHandler.bind(this));

        if(this.params !== undefined){
            if(this.params.setTranslucent && (this.params.setTranslucent === 'setTranslucent')){
                StatusBar.setBackgroundColor('rgb(255,255,255)',true);
                StatusBar.setBarStyle('dark-content');
            }
        }

        (!util.isEmptyObject(params) && typeof params['code'] === 'string') && this._exchagne(params['code']);
    }
    componentWillUnmount() {
        this._keyboardHide && this._keyboardHide.remove();

        if(this.params !== undefined){
            if(this.params.setTranslucent && (this.params.setTranslucent === 'setTranslucent')){
                StatusBar.setBackgroundColor('#000000',true);
                StatusBar.setBarStyle('light-content');
            }
        }
    }
    componentWillReceiveProps(nextProps) {
        if (this.props.device && nextProps.device) {
            if (this.props.device.totalInvites !== nextProps.device.totalInvites) {
                let totalInvites = parseInt(nextProps.device.totalInvites);
                if (!isNaN(totalInvites)) {
                    launchSettings.spi.merge({totalInvites,});
                }
            }

            if (this._diffProps(this.props.device.bind, nextProps.device.bind)) {
                Toast.show(nextProps.device.bind.message);
                this._icModal && this._icModal.close();
            }

            if (this._diffProps(this.props.device.switch, nextProps.device.switch)) {
                Toast.show(nextProps.device.switch.message);
                this._acModal && this._acModal.close();
            }
        }

        let thisParams = this.props.navigation.state.params;
        let nextParams = nextProps.navigation.state.params;

        if (nextParams) {
            if ((util.isEmptyObject(thisParams) || typeof thisParams['code'] === 'undefined') || thisParams['code'] !== nextParams['code']) {
                this._exchagne(nextParams['code']);
            }
        }
    }
    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.device.timeUpdated !== this.props.device.timeUpdated
            || nextProps.device.isLoading !== this.props.device.isLoading
            || this._diffProps(this.props.device.bind, nextProps.device.bind) === true
            || this._diffProps(this.props.device.switch, nextProps.device.switch) === true;
    }
    getAccountCode() {
        return launchSettings.spi.instanceCode.toUpperCase();
    }
    getInviteLink() {
        return launchSettings.inviteDomain.replace('%(code)s', launchSettings.spi.uniqueId).replace('%(channel)s', global.launchSettings.channelID);
    }
    _keyboardDidHideHandler(){
        this._acModal && this._acModal.close();
        this._icModal && this._icModal.close();
    }
    _diffProps(thisProps, nextProps) {
        return (typeof thisProps === 'undefined' && nextProps) || (thisProps && nextProps && thisProps.timeUpdated < nextProps.timeUpdated);
    }
    _switch() {
        this._acModal && this._acModal.show();
    }
    _switchSubmit(code) {
        if (code) {
            this._acModal.busy();
            this.props.switchAccount(code);
        }
        else {
            Toast.show('请输入有效的账户编码');
        }
    }
    _exchagne(code) {
        if (typeof code !== 'string') {
            code = '';
        }

        this._icModal && this._icModal.show(code);
    }
    _exchangeSubmit(code) {
        if (code) {
            this._icModal && this._icModal.close();
            this.props.bindInvite(code);
        }
        else {
            Toast.show('请输入有效的兑换码');
        }
    }
    _refresh() {
        this.props.loadDevice();
    }
    _copyCode() {
        Clipboard.setString(this.getAccountCode());
        Toast.show('账户编码已复制');
    }
    _copyLink() {
        Clipboard.setString(this.getInviteLink());
        Toast.show('链接已复制');
    }
    _shareLink() {
        Share.share({
            message: this.getInviteLink(),
        }, {
            dialogTitle: '分享推广链接',
        }).then((result) => {
            if (result.action === Share.dismissedAction) {
                Toast.show('取消分享');
            }
        }).catch((error) => {
            console.log('Share Error', error);
        });
    }
    _editFunc(){
        return this._switch();
    }
    _goBack(){
        const { goBack } = this.props.navigation;
        return goBack();
    }
    render() {
        let showDetail = typeof launchSettings.spi !== 'undefined';

        return (
            <View style={[styles.container,{backgroundColor:'#FFFFFF'}]}>
                <HeaderBox
                    isText={true}
                    text={'观影券'}
                    isArrow={true}
                    goBack={this._goBack.bind(this)}
                    // isEdit={true}
                    // rightElement={<RightElement isEdit={true} editText={'账号切换'} editFunc={this._editFunc.bind(this)}/>}
                />

                {showDetail &&
                <ScrollView
                    style={{flexDirection:'column', flex:1}}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={{backgroundColor:'#ffff',flexDirection:"column",paddingBottom: 10,marginBottom:10}}>
                        <View style={{flexDirection:'row',justifyContent:'center',marginTop:20}}>
                            <Text style={{fontSize:18,color:'rgb(64,64,64)',fontFamily:'PingFangSC-Semibold'}}>
                                当前观影卷：<Text  style={{fontSize:24,color:'rgb(0,118,248)'}}>{launchSettings.spi.remainsPlay}</Text>
                            </Text>
                        </View>
                        <View style={{justifyContent:'center', alignItems:'center',marginTop:10,paddingVertical:10}}>
                            <Image source={require('../imgs/my_ticket.png')} style={{height:110}} resizeMode={'contain'}/>
                        </View>
                        <View style={{flexDirection:'row',justifyContent:'center',marginTop:30,paddingBottom:10}}>
                            <Text style={{fontSize:14,color:'rgb(175,175,192)',fontFamily:'PingFangSC-Semibold'}}>邀请码：{launchSettings.spi.uniqueId}</Text>
                        </View>
                        {/*<View style={{flexDirection:'row',justifyContent:'center'}}>*/}
                            {/*<TouchableOpacity onPress={this._exchagne.bind(this)} accessible={true} activeOpacity={0.5} style={styles.dhBut}>*/}
                                {/*<Text style={{fontSize:16, color:'#ffffff'}}>兑换</Text>*/}
                            {/*</TouchableOpacity>*/}
                        {/*</View>*/}
                    </View>

                    {/*<View style={{backgroundColor:'rgb(239,239,239)',height:10}}/>*/}

                    {/*<View style={{justifyContent:'space-between',paddingHorizontal:10,height:50,backgroundColor:'#ffffff',flexDirection:'row',alignItems:'center'}}>*/}
                        {/*<View style={{flexDirection:'row',}}>*/}
                            {/*<View style={{marginRight:10}}><Text style={{fontSize:14, color:'rgb(64,64,64)'}}>账户编号</Text></View>*/}
                            {/*<View><Text style={{fontSize:14, color:'rgb(64,64,64)'}}>{this.getAccountCode()}</Text></View>*/}
                        {/*</View>*/}
                        {/*<TouchableOpacity onPress={this._copyCode.bind(this)} activeOpacity={0.5} accessible={true} style={styles.fzbhBut}>*/}
                            {/*<Text style={{fontSize:12, color:'rgb(0,117,248)'}}>复制编号</Text>*/}
                        {/*</TouchableOpacity>*/}
                    {/*</View>*/}

                    <View style={{backgroundColor:'#dcdcdc',height:1/pixel,marginHorizontal:10}}/>

                    <View style={{backgroundColor:'#ffffff',paddingHorizontal:10,overflow:'hidden'}}>
                        <View style={{paddingVertical:6,marginTop:30,flexDirection:'row',justifyContent:'center'}}>
                            <Text style={[styles.remainsTitle,{color:'rgb(64,64,64)',fontSize:18,fontWeight:'bold',fontFamily:'PingFangSC-Semibold'}]}>成功邀请好友可增加每日观影卷数量</Text>
                        </View>
                        <View style={[styles.cellContainer, styles.taskRow,{marginTop:20}]}>
                            <Text style={[styles.taskText]}>邀请1人</Text>
                            <Text style={[styles.taskText, {width: 100}]}>每日观影卷+2</Text>
                            <Text style={[styles.taskText]}>({Math.min(1, launchSettings.spi.totalInvites)}/1)</Text>
                        </View>
                        <View style={[styles.cellContainer, styles.taskRow]}>
                            <Text style={styles.taskText}>邀请2人</Text>
                            <Text style={[styles.taskText, {width: 100}]}>每日观影卷+4</Text>
                            <Text style={styles.taskText}>({Math.min(2, launchSettings.spi.totalInvites)}/2)</Text>
                        </View>
                        <View style={[styles.cellContainer, styles.taskRow]}>
                            <Text style={styles.taskText}>邀请3人</Text>
                            <Text style={[styles.taskText, {width: 100}]}>每日观影劵无限</Text>
                            <Text style={styles.taskText}>({Math.min(3, launchSettings.spi.totalInvites)}/3)</Text>
                        </View>
                        {/*<View style={[styles.cellContainer, styles.taskRow]}>*/}
                            {/*<Text style={styles.taskText}>成功推广 3 人</Text>*/}
                            {/*<Text style={[styles.taskText, {width: 100}]}>+20</Text>*/}
                            {/*<Text style={styles.taskText}>({Math.min(3, launchSettings.spi.totalInvites)}/3)</Text>*/}
                        {/*</View>*/}
                        {/*<View style={[styles.cellContainer, styles.taskRow]}>*/}
                            {/*<Text style={styles.taskText}>成功推广 10 人</Text>*/}
                            {/*<Text style={[styles.taskText, {width: 100}]}>无限</Text>*/}
                            {/*<Text style={styles.taskText}>({Math.min(10, launchSettings.spi.totalInvites)}/10)</Text>*/}
                        {/*</View>*/}
                        {/*<View style={[styles.cellContainer, styles.taskRow]}>*/}
                            {/*<Text style={styles.taskText}>成功推广 100 人</Text>*/}
                            {/*<Text style={[styles.taskText, {width: 100}]}>无限，无广告</Text>*/}
                            {/*<Text style={styles.taskText}>({Math.min(100, launchSettings.spi.totalInvites)}/100)</Text>*/}
                        {/*</View>*/}
                    </View>

                    <View style={{flex:1,backgroundColor:'#FFFFFF', flexDirection:'row',marginVertical:30}}>
                        <View style={[styles.bottomButsView,{paddingLeft:20,paddingRight:10,marginTop:20}]}>
                            <TouchableOpacity onPress={this._shareLink.bind(this)} accessible={true} activeOpacity={0.5} style={styles.dhBut}>
                                <Text style={styles.bottomButsText}>分享</Text>
                            </TouchableOpacity>
                        </View>
                        {/*<View style={[styles.bottomButsView,{paddingLeft:10,paddingRight:20}]}>*/}
                            {/*<TouchableOpacity onPress={this._copyLink.bind(this)} accessible={true} activeOpacity={0.5} style={styles.bottomButs}>*/}
                                {/*<Text style={styles.bottomButsText}>复制推广链接</Text>*/}
                            {/*</TouchableOpacity>*/}
                        {/*</View>*/}
                    </View>
                </ScrollView>}
                {/*<XingrenLoading visible={this.props.device.isLoading}/>*/}
                <XingrenInputModal ref={(ref) => this._icModal = ref} title={"请输入兑换码"}          onSubmit={this._exchangeSubmit.bind(this)}/>
                {/*<XingrenInputModal ref={(ref) => this._acModal = ref} title={"请输入要切换账户编码"}   onSubmit={this._switchSubmit.bind(this)}/>*/}
            </View>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    let data = state.getIn(['spread', 'device']);
    return {...ownProps, device: util.toJS(data)};
};

export default connect(mapStateToProps, {
    loadDevice,
    bindInvite,
    switchAccount,
})(SpreadScreen);

const styles = StyleSheet.create({
    bottomButsText:{
        fontSize:15,
        color:"rgb(255,255,255)",
    },
    bottomButsView:{
        flex:1,
        justifyContent:'center',
        alignItems:'center',
        flexDirection:'row'
    },
    bottomButs:{
        height:40,
        justifyContent:'center',
        alignItems:'center',
        borderWidth:0.5,
        borderColor:'rgb(0,117,248)',
        overflow:'hidden',
        borderRadius: 20,
        flex:1
    },
    fzbhBut:{
        width: 80,
        height:30,
        justifyContent:'center',
        alignItems:'center',
        borderWidth:0.5,
        borderColor:'rgb(0,117,248)',
        overflow:'hidden',
        borderRadius:15
    },
    dhBut:{
        backgroundColor:'rgb(0,117,248)',
        height: 40,
        justifyContent:'center',
        alignItems:'center',
        width: 120,
        borderRadius: 20,
        overflow:'hidden'
    },
    container: {
        flex: 1,
    },
    tabIcon: {
        width: 31,
        height: 28,
    },
    topButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 20,
        paddingLeft: 16,
        paddingRight: 16,
    },
    topButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    exchangeButtonText: {
        fontSize: 15,
        color: '#fff',
        marginRight: 4,
    },
    refreshButtonText: {
        fontSize: 15,
        color: '#fff',
        marginRight: 4,
    },

    remainsContainer: {
        marginTop: 10,
        marginBottom: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    remainsTitle: {
        fontSize: 13,
        color:'rgb(64,64,64)',
        backgroundColor: 'transparent',
    },
    remainsValue: {
        fontSize: 77,
        color: '#fff',
        backgroundColor: 'transparent',
    },
    remainsExpire: {
        fontSize: 12,
        color: '#fff',
        backgroundColor: 'transparent',
    },
    rowContainer: {
        flexDirection: 'row',
        paddingTop: 13,
        paddingBottom: 13,
        marginLeft: 13,
        marginRight: 13,
        borderBottomWidth: 1,
        borderBottomColor: '#fff',
        justifyContent: 'space-between',
    },
    columnContainer: {
        flexDirection: 'column',
    },
    cellContainer: {
        flexDirection: 'row',
        // width: util.SCREEN_WIDTH - 26,
        marginRight:20,
        marginLeft:20,
        // borderColor:"red",
        // borderWidth:1
    },
    cellButtonGroup: {
        justifyContent: 'space-between',
        width: util.SCREEN_WIDTH - 26,
    },
    cellTitle: {
        fontSize: 12,
        color: '#fff',
        marginRight: 24,
    },
    cellValue: {
        fontSize: 12,
        color: '#fff',
        width: util.SCREEN_WIDTH - 176,
        backgroundColor: 'transparent',
    },
    cellText: {
        flexDirection: 'row',
        backgroundColor: 'transparent',
    },
    cellButtonBar: {
        flexDirection: 'row',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        width: 80,
    },
    cellButton: {
        marginLeft: 10,
    },
    cellButtonText: {
        color: '#052d60',
    },
    taskText: {
        color: 'rgb(64,64,64)',
        fontSize: 12,
        backgroundColor: 'transparent',
        fontFamily:'PingFangSC-Medium',
        fontWeight:'bold'
    },
    taskRow: {
        justifyContent: 'space-between',
        marginTop: 10,
    },
    bottomButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginLeft: 13,
        marginRight: 13,
        marginTop: 18,
        borderRadius: 2,
    },
    bottomButton: {
        backgroundColor: '#052d60',
        borderRadius: 18,
        width: 152,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomButtonText: {
        fontSize: 15,
        color: '#fff',
    },
    orText: {
        fontSize: 15,
        color: '#fff',
    },
    textImportant: {
        color: '#052d60',
    },
    backButtonContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center'
    }
});