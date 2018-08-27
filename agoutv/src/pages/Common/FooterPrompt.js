
'use strict';

import React,{PureComponent} from 'react';
import { View,Text,StyleSheet,TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import {width,height,pixel} from '../../common/tool';

class FooterPrompt extends PureComponent<{}>{
    static propTypes = {
        backgroundColor: PropTypes.string.isRequired,
        height: PropTypes.number.isRequired,
        fontSize: PropTypes.number.isRequired,
        color: PropTypes.string.isRequired,
        isButton: PropTypes.bool.isRequired,
        butActiveOpacity: PropTypes.number,
        butAllSelectText: PropTypes.string,
        butDeleteText: PropTypes.string,
        butAllSelectFun: PropTypes.func,
        butDeleteFun: PropTypes.func,
        butDeleteTextColor: PropTypes.string,
        butHeight: PropTypes.number
    };
    static defaultProps = {
        backgroundColor: '#FFFFFF',
        height: 44,
        fontSize: 14,
        color: '#CCCCCC',
        text: '没有更多数据了哦',
        isButton: false,
        butActiveOpacity: 0.50,
        butAllSelectText: '全选',
        butDeleteText: '删除',
        butAllSelectFun: () => {},
        butDeleteFun: () => {},
        butDeleteTextColor: 'red',
        butHeight: 50
    };
    render(){
        const {
            backgroundColor, height, fontSize, color, text, isButton,
            butActiveOpacity, butAllSelectText, butDeleteText, butAllSelectFun,
            butDeleteFun, butDeleteTextColor, butHeight
        } = this.props;

        return (
            isButton ?
                <View style={[styles.footerButsContent,{height:butHeight}]}>
                    <TouchableOpacity activeOpacity={butActiveOpacity} onPress={() => butAllSelectFun()} style={styles.footerRows}>
                        <View style={[styles.footerInnerRows,{borderRightWidth:1/pixel}]}>
                            <Text style={[styles.footerInnerRowsText]}>{butAllSelectText}</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={butActiveOpacity} onPress={() => butDeleteFun()} style={styles.footerRows}>
                        <View style={styles.footerInnerRows}>
                            <Text style={[styles.footerInnerRowsText,{color:butDeleteTextColor}]}>{butDeleteText}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                :
                <View style={[styles.footerNoDataContent,{backgroundColor:backgroundColor,height:height}]}>
                    <Text style={{fontSize:fontSize,color:color}}>{text}</Text>
                </View>
        );
    }
}

export default FooterPrompt;

const styles = StyleSheet.create({
    footerInnerRowsText:{
        fontSize:14
    },
    footerRows:{
        flex:1,
        paddingVertical:12,
    },
    footerInnerRows:{
        flex:1,
        justifyContent:'center',
        alignItems:'center',
        borderRightColor:'#dcdcdc',
    },
    footerButsContent:{
        elevation:6,
        position: 'relative',
        left:0,
        bottom:0,
        zIndex:600,
        width:width,
        flexDirection:'row',
        backgroundColor:'#ffffff'
    },
    footerNoDataContent:{
        justifyContent: 'center',
        alignItems: 'center'
    }
});










































