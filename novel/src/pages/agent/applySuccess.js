'use strict';

import React,{ Component } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, TouchableHighlight, TextInput, Dimensions, StatusBar } from 'react-native';
import { connect } from 'react-redux';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import Immutable from 'immutable';
import { pixel } from "../../common/Tool";
import { Styles, ScaledSheet,Img, Fonts, Colors, BackgroundColor } from "../../common/Style";
import Header from '../../components/Header';
import {agent} from "../../common/Icons";

type Props = {};

class ApplySuccess extends Component<Props>{
    constructor(props) {
        super(props);
    }
    _bookshelf(){
        const { navigation } = this.props;
        navigation && navigation.navigate('Bookshelf');
    }
    _goBack(){
        const { navigation } = this.props;
        navigation.goBack();
    }
    // 头部 - demo
    renderHeader(){
        return (
            <Header
                title={'申请成功'}
                isArrow={true}
                goBack={this._goBack.bind(this)}
            />
        );
    }
    //内容
    renderContent(){
        return(
                <View style={{flex:1,justifyContent:'space-around',alignItems:'center'}}>
                    <View>
                        <Image source={agent.tick} resizeMode={'contain'}/>
                    </View>
                    <View style={{justifyContent:'space-around',alignItems:'center'}}>
                        <Text style={[Fonts.fontFamily,Fonts.fontSize18]}>申请成功，等待验证（需1个工作日）</Text>
                        <Text style={[Fonts.fontFamily,Fonts.fontSize18]}>审核成功后，重新启动app会出现后台入口</Text>
                    </View>

                    <TouchableOpacity
                        onPress={this._bookshelf.bind(this)}
                        style={{width:scale(300),height:verticalScale(44),borderRadius:moderateScale(22),backgroundColor:'#f3916b',paddingTop:moderateScale(10)}}
                    >
                        <Text style={[Fonts.fontFamily,Fonts.fontSize18,{color:'#ffffff',textAlign:'center'}]}>确定</Text>
                    </TouchableOpacity>
                </View>
        )
    }

    render(){
        return (
            <View style={[Styles.container]}>
                {this.renderHeader()}
                {this.renderContent()}
            </View>
        );
    }
}

export default connect()(ApplySuccess)