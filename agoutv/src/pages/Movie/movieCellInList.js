
import React from 'react';
import { Text, TouchableOpacity, StyleSheet, Image, View, ImageBackground } from 'react-native'
import PropTypes from 'prop-types';
import ImageLoad from 'react-native-image-placeholder';
import { checkVideoSource } from "../../common/tool";
import { ICON_PREV_URL } from "../../Constants";
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

const util = require('../../common/Util');
const threeColumnCoverWidth = (util.SCREEN_WIDTH - 24) / 3;
const twoColumnCoverWidth = (util.SCREEN_WIDTH - 18) / 2;

export class MovieCellInList extends React.Component {
    static propTypes = {
        item: PropTypes.object.isRequired,
        onPress: PropTypes.func.isRequired,
    };
    constructor(props) {
        super(props);
        this.onPress = this.onPress.bind(this);
    }
    onPress(item) {
        this.props.onPress(item);
    }
    render() {
        const { item, catType } = this.props;
        const iconBottomVignette = require('../imgs/bottom-vignette.png');
        const iconDefaultFilmCover = require('../imgs/default_film_cover.png');
        const uri = item && item.srcTag && ICON_PREV_URL + item.srcTag.tag + '.png';

        return (
            <TouchableOpacity
                activeOpacity={0.90}
                style={[styles.cellTouchableStyle, (parseInt(catType)) === 4 ? {width: twoColumnCoverWidth} : {}]}
                onPress={() => this.onPress(item)}
            >
                <ImageLoad
                    source={{uri: item.cover}}
                    style={[styles.coverImgStyle, (parseInt(catType)) === 4 ? {width: twoColumnCoverWidth, height: verticalScale(100)} : {}]}
                    customImagePlaceholderDefaultStyle={{width: scale(50), height: verticalScale(50), justifyContent: 'center'}}
                    isShowActivity={false}
                    placeholderSource={iconDefaultFilmCover}
                    borderRadius={2}
                />
                <View style={[styles.rowsImg]}>
                    <Text style={[styles.descTextStyle, {fontFamily: 'PingFangSC-Regular'}]} numberOfLines={1}>
                        {item ? item.title : ""}
                    </Text>
                </View>
                <ImageBackground style={styles.rowsIB} imageStyle={styles.imageStyle} source={iconBottomVignette}>
                    {
                        ((parseInt(item.latestEpisode) !== 0) && ((parseInt(catType) || parseInt(item.type)) !== 1)) ?
                        <Text style={[styles.videoSourceBoxText]}>更新至{item ? item.latestEpisode : 0}集</Text> : <Text/>
                    }
                    {
                        parseInt(item.score) !== 0 ?
                        <Text style={[styles.videoSourceBoxText,{fontSize:12,color:'#FD9013'}]}>{item && item.score && item.score.toFixed(1)}</Text> :
                        <Text style={[styles.videoSourceBoxText,{fontSize:12,color:'#FD9013'}]}>7.5</Text>
                    }
                </ImageBackground>
                {
                    parseInt(item.isVip) !== 0 ?
                    <View style={styles.vip}>
                        { item && item.srcTag ? <Image source={{uri:uri}} resizeMode={'contain'} style={styles.vipImages}/> : null  }
                    </View>
                    : null
                }
            </TouchableOpacity>
        );
    }
}

export class MovieCellInSection extends React.Component {
    static propTypes = {
        item: PropTypes.object.isRequired,
        onPress: PropTypes.func.isRequired,
    };
    constructor(props) {
        super(props);
        this.onPress = this.onPress.bind(this);
    }
    onPress(item) {
        this.props.onPress(item);
    }
    render() {
        const {item} = this.props;
        return (
            <TouchableOpacity
                activeOpacity={0.90}
                style={[styles.sectionCellTouchableStyle]}
                onPress={() => this.onPress(item)}
            >
                <Image
                    source={{uri: item.cover}}
                    style={styles.sectionCoverImgStyle}
                />
                <Text
                    style={[styles.sectionDescTextStyle, {fontFamily: 'PingFangSC-Regular'}]}
                    numberOfLines={1}
                >
                    {item.title}
                </Text>
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    vip:{
        position:'absolute',
        right: moderateScale(6),
        top:0,
        zIndex:100,
        overflow:'hidden',
        height: verticalScale(15),
        width: scale(25),
        justifyContent:'center',
        alignItems:'center',
        borderBottomLeftRadius: moderateScale(3),
        borderBottomRightRadius: moderateScale(3)
    },
    vipImages:{
        width: scale(25),
        height: verticalScale(15),
    },
    rowsIB:{
        position:'absolute',
        left:0,
        bottom: 30,
        zIndex:10,
        right:0,
        overflow:'hidden',
        height: verticalScale(40),
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'flex-end',
        paddingHorizontal: 6,
        paddingBottom: 5,
        borderRadius: 2
    },
    imageStyle:{
        resizeMode: 'stretch'
    },
    rowsTitle:{
        color:'#FFFFFF',
        fontSize: 10,
        maxWidth: scale(120)
    },
    videoSourceBox:{
        position:'absolute',
        left:0,
        top:0,
        backgroundColor:'rgba(0,117,248,0.8)',
        zIndex:100,
        overflow:'hidden',
        borderTopRightRadius: moderateScale(20),
        borderBottomRightRadius: moderateScale(20),
        padding: moderateScale(20)
    },
    videoSourceBoxText:{
        fontSize: 10,
        color:'#FFFFFF'
    },
    cellTouchableStyle: {
        width: threeColumnCoverWidth,
        position: 'relative',
        overflow: 'hidden'
    },
    coverImgStyle: {
        width: threeColumnCoverWidth,
        height: verticalScale(150),
        borderRadius: 2
    },
    descTextStyle: {
        fontSize: 12,
        color: '#404040',
        fontWeight:'bold'
    },
    sectionCellTouchableStyle: {
        width: twoColumnCoverWidth,
    },
    sectionCoverImgStyle: {
        width: twoColumnCoverWidth,
        height: verticalScale(100),
    },
    sectionDescTextStyle: {
        fontSize: 12,
        color: '#404040'
    },
    rowsImg:{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 30,
        backgroundColor: '#fff'
    },
});
