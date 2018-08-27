
/*填写邀请码*/

'use strict';

import React,{ Component } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, ImageBackground, StatusBar, Keyboard } from 'react-native';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import Toast from 'react-native-root-toast';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import HeaderBox from '../../../common/HeaderBox';
import { pixel, statusBarSetPublic, rgbValidation } from "../../../common/tool";
import { inviteCode } from "../../../actions/user";

class BindInviteCode extends Component<{}>{
    constructor(props){
        super(props);
        this.state={
            code: 0,
            currentState: false
        };
        this.params = this.props.navigation.state.params || false;
    }
    componentWillMount() {
        this._statusBarSet();
        // 设备软键盘监听
        this._keyboardHide = Keyboard.addListener('keyboardDidHide',this._keyboardDidHideHandler.bind(this));
    }
    componentWillReceiveProps(nextProp) {
        if(nextProp.userData && nextProp.userData.login && nextProp.userData.invite && this.state.currentState){
            let invite = nextProp.userData.invite;
            let res = invite.res;

            if(invite.prompt && res !== undefined && parseInt(res.code) === 0){
                Toast.show('邀请码填写成功',{
                    duration: 2000,
                    position: -55,
                    onHide:() => {
                        this._goBack();
                    }
                });
            }
            else{
                Toast.show(res.message,{ duration: 2000, position: -55 });
            }
            this.setState({currentState: false});
        }

        if(nextProp.userData && !nextProp.userData.login){
            Toast.show('登录后才能填写邀请码哦',{ duration: 2000, position: -55 });
        }
    }
    componentWillUnmount() {
        this._statusBarReduction();
        // 卸载设备软键盘监听
        this._keyboardHide && this._keyboardHide.remove();
    }
    // 软键盘监听对应的方法
    _keyboardDidHideHandler(){
        this.textInputRef && this.textInputRef.blur();
    }
    // 设置菜单栏
    _statusBarSet(){
        statusBarSetPublic('#5AA6FF','light-content',true);
    }
    // 还原菜单栏
    _statusBarReduction(){
        const params = this.params;

        if(params){
            switch (params.name){
                case 'Task': statusBarSetPublic('#A0B4CA','dark-content',true);
                    break;
                case 'Setting': statusBarSetPublic('#FFFFFF','dark-content',true);
            }
        }
    }
    // 返回
    _goBack(){
        const { navigation } = this.props;
        navigation.goBack();
    }
    // 保存
    _save(){
        const { code } = this.state;
        const { inviteCode, prompt, res } = this.props;

        if(!code && code === 0){
            return Toast.show('邀请码不能为空',{ duration: 2000, position: -55 });
        }
        else if(!/^[0-9a-zA-Z]*$/g.test(code)){
            return Toast.show('邀请码格式错误',{ duration: 2000, position: -55 });
        }

        inviteCode && inviteCode(code);
        this.setState({currentState: true});
    }
    // 头部 - demo
    renderHeader(){
        const inviteCodeMainImg = require('../../imgs/invite_code_main_img.png');

        return (
            <ImageBackground
                imageStyle={styles.imageStyle}
                source={inviteCodeMainImg}
                style={styles.ImageBackground}
            >
                <HeaderBox
                    isText={true}
                    arrowColor={'#FFF'}
                    backgroundColor={'transparent'}
                    text={'邀请码'}
                    titleColor={'#FFF'}
                    borderBottomColor={'transparent'}
                    isArrow={true}
                    goBack={this._goBack.bind(this)}
                />
            </ImageBackground>
        );
    }
    // 身体 - demo
    renderBody(){
        return (
            <View style={[styles.rows]}>
                <View style={styles.bindPhoneBox}>
                    <View style={styles.cellRight}>
                        <Text style={styles.bindPhoneText}>邀请码：</Text>
                        <TextInput
                            style={styles.textInput}
                            onChangeText={(code) => this.setState({code})}
                            underlineColorAndroid={"transparent"}
                            keyboardType={"default"}
                            placeholder={'请输入邀请码'}
                            placeholderTextColor={'#afafc0'}
                            ref={ref => this.textInputRef = ref}
                        />
                    </View>
                    <TouchableOpacity activeOpacity={0.75} style={styles.buts} onPress={this._save.bind(this)}>
                        <View style={styles.codeBtn}>
                            <Text style={[styles.fontFamily,styles.codeBtnText]}>确定</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
    render(){
        return(
            <View style={styles.content}>
                <KeyboardAwareScrollView>
                    { this.renderHeader() }
                    { this.renderBody() }
                </KeyboardAwareScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    cellRight:{
        flex:2.5,
        alignItems:'center',
        flexDirection:'row',
        paddingLeft:5,
    },
    buts:{
        flex:1,
        alignItems:'center',
        flexDirection:'row',
        height:50,
        justifyContent:'flex-end',
        paddingRight:5
    },
    imageStyle:{
        resizeMode:'cover'
    },
    ImageBackground:{
        width:'100%',
        height:310 - StatusBar.currentHeight,
    },
    content:{
        flex:1,
        position:'relative',
        backgroundColor:'#fff'
    },
    rows:{
        marginLeft:10,
        marginRight:10,
        marginTop:10,
        height:50,
    },
    fontFamily: {
        fontFamily: 'PingFangSC-Medium',
    },
    codeBtnText:{
        fontSize:12,
        color:'#fff'
    },
    codeBtn:{
        width:50,
        height:25,
        borderColor:'#0076f8',
        borderWidth:1 / pixel,
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:'#0076f8',
        borderRadius:50,
    },
    bindPhoneBox:{
        borderBottomWidth:1 / pixel,
        borderBottomColor:'#e7e7e7',
        flexDirection:'row',
        justifyContent:'space-around',
        backgroundColor:'#fff',
        alignItems:'center',
        height:60
    },
    bindPhoneText:{
        fontSize:14,
        color:'#404040'
    },
    textInput:{
        padding:0,
        flex:1,
    },
    getCodeBtn:{
        marginLeft:0,
    },
    btn:{
        marginTop:50,
        height:60,
    }
});

const mapStateToProps = (state, ownProps) => {
    let data = state.getIn(['user']);

    if (Immutable.Map.isMap(data)) { data = data.toJS() }
    return {...ownProps, ...data};
};

export default connect(mapStateToProps, { inviteCode })(BindInviteCode);
