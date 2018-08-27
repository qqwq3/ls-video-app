
'use strict';

import React,{ PureComponent } from 'react';
import {StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import PropTypes from 'prop-types';
import { width,pixel } from './tool';

class HeaderBox extends PureComponent<{}>{
    static propTypes = {
        children: PropTypes.any.isRequired,
        isText: PropTypes.bool.isRequired,
        text: PropTypes.string.isRequired,
        paddingHorizontal: PropTypes.number.isRequired,
        isArrow: PropTypes.bool.isRequired,
        goBack: PropTypes.func.isRequired,
        arrowSize: PropTypes.number,
        arrowColor: PropTypes.string,
        isEdit: PropTypes.bool.isRequired,
        rightElement: PropTypes.any,
        backgroundColor: PropTypes.string,
        borderBottomColor: PropTypes.string,
        titleColor: PropTypes.string,
    };
    static defaultProps = {
        isText: false,
        text: '',
        children:<Text/>,
        paddingHorizontal:0,
        isArrow: false,
        goBack: () => {},
        arrowSize: 14,
        arrowColor: 'rgb(0,118,248)',
        isEdit: false,
        rightElement: {},
        backgroundColor: '#FFFFFF',
        borderBottomColor: '#dcdcdc',
        titleColor: 'rgb(64,64,64)',
    };
    render(){
        const {
            children,
            isText,
            text,
            paddingHorizontal,
            isArrow,
            goBack,
            arrowSize,
            arrowColor,
            isEdit,
            rightElement,
            backgroundColor,
            borderBottomColor,
            titleColor
        } = this.props;
        const source = require('../pages/imgs/icon_back_arrow_blue.png');

        return (
            <View style={[styles.headerContent,{backgroundColor: backgroundColor,borderBottomColor:borderBottomColor},isText ? styles.textCenter : {paddingHorizontal:paddingHorizontal}]}>
                {isText ? <Text numberOfLines={1} style={[styles.text,{color:titleColor}]}>{text}</Text> : children}
                {
                    isArrow &&
                    <TouchableOpacity style={styles.returnView} activeOpacity={1} onPress={() => goBack()}>
                        <Image source={source} style={{height: arrowSize}} resizeMode={'contain'} tintColor={arrowColor}/>
                    </TouchableOpacity>
                }
                {isEdit && <View style={styles.isEdit}>{ rightElement }</View>}
            </View>
        );
    }
}

export default HeaderBox;

const styles = StyleSheet.create({
    isEdit:{
        top:0,
        right:0,
        bottom:0,
        zIndex:200,
        height:44,
        width:'50%',
        position:'absolute'
    },
    returnImage:{},
    returnView:{
        height:44,
        position:'absolute',
        left:0,
        top:0,
        zIndex:200,
        width:'50%',
        paddingLeft:15,
        flexDirection:'row',
        alignItems:'center',
    },
    headerContent:{
        height:44,
        width:'100%',
        flexDirection:'row',
        borderBottomWidth:1/pixel,
        position:'relative',
        zIndex:999
    },
    textCenter:{
        justifyContent:'center',
        alignItems:'center'
    },
    text:{
        fontSize: 16,
        fontWeight:'bold',
        maxWidth: '88%'
    }
});





























