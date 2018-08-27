
/*简介*/

'use strict';

import React,{ PureComponent } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { width, height, pixel } from "../../common/tool";

const arrowRight = require('../imgs/arrow_right.png');

type Props = {
    screenProps: Object<any>,
    toggleText: () => void,
    statistical: string
};

class SummaryTab extends PureComponent<Props>{
    static defaultProps = {
        statistical:''
    };
    render() {
        const {statistical,screenProps} = this.props;
        let video = screenProps && screenProps.video;
        let summary = String(video.summary ? video.summary.trim() : '暂无相关简介');

        return (
            <TouchableOpacity style={styles.toBox} activeOpacity={0.50} onPress={() => this.props.toggleText()}>
                <View style={styles.rows}>
                    <Text style={styles.rowsTitle}>简介</Text>
                    <View style={styles.rowsContent}>
                        <Text style={styles.comText}>{statistical}</Text>
                        <Image source={arrowRight} resizeMode={'contain'} />
                    </View>
                </View>
                <View>
                    <Text includeFontPadding={false} numberOfLines={1} style={styles.fieldLabel}>{summary}</Text>
                </View>
            </TouchableOpacity>
        )
    };
}

export default SummaryTab;

const styles = StyleSheet.create({
    rows:{
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        paddingBottom:10
    },
    rowsTitle:{
        fontSize:14,
        fontWeight:'bold',
        color:'#404040'
    },
    rowsContent:{
        flexDirection:'row',
        alignItems:'center'
    },
    toBox:{
        borderBottomWidth:1/pixel,
        borderBottomColor:'#dcdcdc',
        marginHorizontal:10,
        paddingVertical:20,
        paddingHorizontal:10
    },
    comText:{
        fontSize:12,
        color:'#cccccc',
        marginRight:10
    },
    fieldLabel: {
        color: '#606060',
        fontSize: 14,
        lineHeight: 22
    },
});








































