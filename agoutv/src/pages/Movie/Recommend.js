
/*为你推荐*/

'use strict';

import React,{ PureComponent } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ImageBackground, Alert } from 'react-native';
import ImageLoad from 'react-native-image-placeholder';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

type Props = {
    reducingState: () => void,
    recommendCallBack: () => void,
    video: any,
};

class Recommend extends PureComponent<Props>{
    constructor(props){
        super(props);
        this.state = {};
    }
    // 单个推荐点击
    _onPress(item){
        const { recommendCallBack, reducingState } = this.props;
        reducingState && reducingState();
        recommendCallBack && recommendCallBack(item.hexId);
    }
    // 渲染
    _renderItem({item,index}){
        let cover = item.cover, title = item.title;

        return (
            <TouchableOpacity activeOpacity={0.75} onPress={this._onPress.bind(this,item)} style={[styles.rows]}>
                <ImageLoad
                    source={{uri:cover}}
                    style={styles.image}
                    customImagePlaceholderDefaultStyle={styles.customImagePlaceholderDefaultStyle}
                    isShowActivity={false}
                    placeholderSource={require('../imgs/default_film_cover.png')}
                    resizeMode={'cover'}
                    borderRadius={2}
                />
                <ImageBackground style={styles.rowsIB} imageStyle={styles.imageStyle} source={require('../imgs/bottom-vignette.png')}>
                    <Text numberOfLines={1} style={styles.rowsTitle}>{ title }</Text>
                </ImageBackground>
            </TouchableOpacity>
        );
    }
    render(){
        let { video } = this.props;
        let similarRecommend = (video && video.similarRecommend) || [];
        let data = ((Object.keys(similarRecommend)).length !== 0 && similarRecommend) || [];

        return (
            <View style={[styles.toBox]}>
                <View style={[styles.titleBox]}>
                    <Text style={[styles.titleBoxText]}>为你推荐</Text>
                </View>
                <FlatList
                    style={styles.flatList}
                    data={data}
                    renderItem={this._renderItem.bind(this)}
                    keyExtractor={(item,index) => index}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.contentContainerStyle}
                />
            </View>
        );
    }
}

export default Recommend;

const styles = StyleSheet.create({
    rowsIB:{
        width: scale(100),
        position:'absolute',
        left:5,
        bottom:0,
        zIndex:10,
        right:5,
        overflow:'hidden',
        height: verticalScale(40),
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
        paddingTop: moderateScale(10),
        paddingHorizontal: moderateScale(4),
        borderRadius:2
    },
    imageStyle:{
        resizeMode: 'stretch'
    },
    rowsTitle:{
        color:'#FFFFFF',
        fontSize: 12,
        maxWidth: 120
    },
    contentContainerStyle:{
        paddingRight:20,
        paddingLeft: 10,
    },
    flatList:{
        paddingHorizontal: 5
    },
    image:{
        flex:1
    },
    customImagePlaceholderDefaultStyle:{
        width: 60,
        height: 60,
        justifyContent: 'center'
    },
    rows:{
        width: scale(110),
        height: verticalScale(140),
        paddingHorizontal: moderateScale(5),
        position:'relative'
    },
    toBox:{
        paddingVertical:20,
        marginHorizontal: 0
    },
    titleBox:{
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        paddingBottom: 15,
        marginHorizontal: 20
    },
    titleBoxText:{
        fontSize:14,
        fontWeight:'bold',
        color:'#404040'
    },
});


































