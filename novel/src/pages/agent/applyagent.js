'use strict';

import React,{ Component } from 'react';
import { View, Image, TouchableOpacity,  Dimensions, StatusBar } from 'react-native';
import { connect } from 'react-redux';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import Immutable from 'immutable';
import {agent} from "../../common/Icons";
import Header from '../../components/Header';
import { infoToast } from "../../common/Tool";
import { SubmitApply } from "../../actions/User";
import BaseComponent from "../../components/BaseComponent";

type Props = {};

class Applyagent extends BaseComponent<Props>{
    constructor(props) {
        super(props);
        this.state = {
            status: false
        };
        this.updateTime = Date.now();
        this.errorTime = Date.now();
    }
    componentWillReceiveProps(nextProps){
        super.componentWillReceiveProps(nextProps);
        const { navigation } = nextProps;

        if(nextProps && nextProps.applyAgentTimeUpdated > this.updateTime && nextProps.messageKeys && nextProps.messageKeys === 'apply'){
            this.updateTime = Date.now();
            let applyState = parseInt(nextProps.state);
            if (applyState === 1) {
                return infoToast("申请成功，请到‘我的’查看");
            }else if (applyState === 2) {
                return infoToast("您的账号出了点问题，请联系客服");
            }else if (applyState === 3) {
                return infoToast("申请中，请耐心等待");
            }else if(applyState === -1 || applyState === 4 ) {
                navigation && navigation.navigate('Binding');
            }
        }
    }
    _goBack(){
        const { navigation } = this.props;
        navigation.goBack();
    }
    _Binding(){
        this.props.SubmitApply && this.props.SubmitApply('apply');
        this.setState({status: true});
    }
    renderHeader(){
        return (
            <Header
                title={'申请代理'}
                isArrow={true}
                goBack={this._goBack.bind(this)}
            />
        );
    }

    render(){
        const ScreenWidth = Dimensions.get('window').width;
        return (
            <View>
                {this.renderHeader()}
                <View style={{position:'relative',width:ScreenWidth,height:'96%'}}>

                        <Image source={agent.applybg} resizeMode={'stretch'} style={{width:ScreenWidth,height:'93%'}}/>

                    <View style={{alignItems:'center'}}>
                            <View style={{position:'absolute',bottom:moderateScale(20),width:scale(300),height:verticalScale(60)}}>
                                <TouchableOpacity
                                    activeOpacity={0.75}
                                    onPress={this._Binding.bind(this)}
                                >
                                    <Image
                                        source={agent.applybtn}
                                        resizeMode={'contain'}
                                        style={{width:scale(300),height:verticalScale(40)}}
                                    />
                                </TouchableOpacity>

                            </View>

                    </View>
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    let userData = state.getIn(['user','userData','applyAgent']);
    if(Immutable.Map.isMap(userData)){ userData = userData.toJS() }
    return { ...ownProps, ...userData};
};

export default connect(mapStateToProps,{ SubmitApply })(Applyagent)



