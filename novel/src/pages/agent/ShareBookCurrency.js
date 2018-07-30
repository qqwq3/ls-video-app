'use strict';

import React,{ Component } from 'react';
import {View, Dimensions,Image,StyleSheet,TouchableOpacity} from 'react-native';
import BaseComponent from "../../components/BaseComponent";
import {agent} from "../../common/Icons";
import Header from '../../components/Header';
import { moderateScale,scale,verticalScale } from 'react-native-size-matters';
import {commonShare, shareAddListener, shareRemoveListener} from "../../common/WxShare";
export default class ShareBookCurrency extends BaseComponent<Props>{
    constructor(props){
        super(props);
    }
    _goBack(){
        const { navigation } = this.props;
        navigation.goBack();
    }
    //分享到微信群
    shareVxFlock(){
        const shareUrl = global.launchSettings && global.launchSettings.agentData && global.launchSettings.agentData.data &&
            global.launchSettings.agentData.data.shareUrl || 'http://share.lameixisi.cn/share/index.html';
        const agentTag = (global.launchSettings && global.launchSettings.agentTag) || '10';
        const channelID = global.launchSettings && global.launchSettings.channelID;

        shareRemoveListener && shareRemoveListener();
        commonShare && commonShare('friends', channelID, shareUrl, agentTag);
        shareAddListener && shareAddListener();
    }
    //分享到朋友圈
    shareVxCircle(){
        const shareUrl = global.launchSettings && global.launchSettings.agentData && global.launchSettings.agentData.data &&
            global.launchSettings.agentData.data.shareUrl || 'http://share.lameixisi.cn/share/index.html';
        const agentTag = (global.launchSettings && global.launchSettings.agentTag) || '10';
        const channelID = global.launchSettings && global.launchSettings.channelID;

        shareRemoveListener && shareRemoveListener();
        commonShare && commonShare('friendsCircle', channelID, shareUrl, agentTag);
        shareAddListener && shareAddListener();
    }
    renderHeader(){
        return(
            <Header
                title={'分享赚书币'}
                isArrow={true}
                goBack={this._goBack.bind(this)}
            />
        )
    }
    render(){
        let ScreenWidth = Dimensions.get('window').width;
        return(
        <View>
            {this.renderHeader()}
            <View style={{position:'relative',width:ScreenWidth,height:'95%'}}>
                <Image source={agent.shareBg} resizeMode={'stretch'} style={{width:ScreenWidth,height:'100%'}}/>
                <View style={{alignItems:'center'}}>
                    <View style={{position:'absolute',bottom:moderateScale(150),width:scale(230),height:verticalScale(60)}}>
                        <TouchableOpacity
                            activeOpacity={0.75}
                            onPress={this.shareVxFlock.bind(this)}
                        >
                            <Image
                                source={agent.shareVx}
                                resizeMode={'contain'}
                                style={{width:scale(230),height:verticalScale(60)}}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={0.75}
                            onPress={this.shareVxCircle.bind(this)}
                        >
                            <Image
                                source={agent.shareFriends}
                                resizeMode={'contain'}
                                style={{width:scale(230),height:verticalScale(60)}}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
        )
    }
}