
/*小视频公用*/

import React,{ PureComponent } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Image, FlatList, ImageBackground } from 'react-native';
import ImageLoad from 'react-native-image-placeholder';
import PropTypes from 'prop-types';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import * as api from '../../middlewares/api';
import { width, height, pixel } from "../../common/tool";
import { shortVideoNav } from '../../Constants';

const twoColumnCoverWidth = (width - 18) / 2;
const placeholderSource = require('../imgs/default_film_cover.png');

class HostPot extends PureComponent{
    static propTypes = {
        title: PropTypes.string,
        linkIndex: PropTypes.number,
        type: PropTypes.string,
        isTopBorder: PropTypes.bool,
    };
    static defaultProps = {
        title: '',
        linkIndex: 0,
        isTopBorder: false
    };
    constructor(props){
        super(props);
        this.state = {
            data: [], // 数据
        };
    }
    componentDidMount() {
        this._requestData();
        // this.autoUpdateData();
    }
    componentWillUnmount() {
        this.clearAutoUpdate();
        this.setState = (state,callback) => { return };
    }
    // 清除自动更新数据 -方法
    clearAutoUpdate(){
        this.watermelonTimer && clearInterval(this.watermelonTimer);
    }
    // 自动更新数据 - 方法
    autoUpdateData(){
        const { type } = this.props;
        // 间隔时间 - 默认为一分钟 - 自动更新数据（注意：rn里，计时器不超过一分钟，然后会出警告）
        const interValTime = 1 * 60 * 1000;

        // 如果是西瓜视频 - 首页的进入头条
        if(type === 'xigua'){
            this.watermelonTimer = setInterval(() => {
                this._requestWatermelonData();
            },interValTime);
        }

        return null;
    }
    // 单独处理西瓜视频数据 - 今日热点设置
    async _requestWatermelonData(){
        const { type } = this.props;
        if(type === 'xigua'){
            let xiguaResult = await api.hotShortVideoFromXigua();
            if(xiguaResult && xiguaResult.code === 0){
                this.setState({data: xiguaResult.data});
            }
        }
    }
    // 取到视频数据
    async _requestData(){
        const { type, linkIndex } = this.props;

        // 西瓜
        if(type === 'xigua'){
            let xiguaResult = await api.hotShortVideoFromXigua();
            if(xiguaResult && xiguaResult.code === 0){
                this.setState({data: xiguaResult.data});
            }
        }

        // 梨视频
        if(type === 'pear'){
            let pearResult = await api.shortVideoFromPear(shortVideoNav[linkIndex].categoryUrl);
            if(pearResult && pearResult.code === 0){
                this.setState({data: pearResult.data});
            }
        }
    }
    // 点击事件 - 进入详情去播放
    _onPress(item){
        const { navigate } = this.props.navigation;
        const { type } = this.props;
        return  navigate('FoundDetail',{item,type});
    }
    // 渲染
    _renderItem({item, index}){
        const { type } = this.props;
        let title = item.title,
            cover = item.cover;

        return (
            (index < 6) &&
            <TouchableOpacity
                key={index}
                activeOpacity={0.75}
                style={styles.rows}
                onPress={() => this._onPress(item)}
            >
                <ImageLoad
                    source={{uri:cover}}
                    style={styles.coverImgStyle}
                    customImagePlaceholderDefaultStyle={styles.customImagePlaceholderDefaultStyle}
                    isShowActivity={false}
                    placeholderSource={placeholderSource}
                    borderRadius={2}
                />
                <View style={styles.rowsText}>
                    <Text style={[styles.descTextStyle]} numberOfLines={1}>{ title }</Text>
                </View>
                {/*<ImageBackground style={styles.rowsIB} imageStyle={styles.imageStyle} source={require('../imgs/bottom-vignette.png')}>*/}
                    {/*<Text style={styles.videoSourceBoxText}>{ type === 'pear' ? '梨视频' : '西瓜' }</Text>*/}
                {/*</ImageBackground>*/}
            </TouchableOpacity>
        );
    }
    // 更多
    _more(){
        const { navigate } = this.props.navigation;
        const { linkIndex, type } = this.props;
        return navigate('FoundIndex',{navStartValue: linkIndex,type: type});
    }
    // 头部组件
    _listHeaderComponent(){
        const { title, titleIcon, isTopBorder } = this.props;

        return (
            <View style={[styles.rowsHeader,isTopBorder && styles.borderTopBorder]}>
                <View style={styles.headerV}>
                    <Image source={titleIcon} style={[styles.hotIcon]} resizeMode={'contain'}/>
                    <Text style={[styles.hotTextStyle]}>{title}</Text>
                </View>
                <TouchableOpacity activeOpacity={1} onPress={this._more.bind(this)} style={styles.more}>
                    <Text style={styles.moreText}>更多</Text>
                </TouchableOpacity>
            </View>
        );
    }
    render(){
        const { data } = this.state;

        return (
            data ?
            <View style={styles.container}>
                { this._listHeaderComponent() }
                <FlatList
                    style={styles.contents}
                    data={data}
                    renderItem={this._renderItem.bind(this)}
                    showsVerticalScrollIndicator={false}
                    horizontal={false}
                    keyExtractor={(item, index) => index}
                    numColumns={2}
                    columnWrapperStyle={styles.columnWrapperStyle}
                />
            </View> : null
        );
    }
}

export default HostPot;

const styles = StyleSheet.create({
    rowsIB:{
        position:'absolute',
        left:0,
        bottom: moderateScale(30),
        zIndex:10,
        right:0,
        overflow:'hidden',
        height: verticalScale(40),
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'flex-end',
        paddingHorizontal: moderateScale(6),
        paddingBottom: moderateScale(4),
        borderRadius: 2,
    },
    imageStyle:{
        resizeMode: 'stretch'
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
        padding: moderateScale(6)
    },
    videoSourceBoxText:{
        fontSize: 10,
        color:'#FFFFFF'
    },
    borderTopBorder:{
        borderTopColor: "#dcdcdc",
        borderTopWidth: 1 / pixel,
    },
    headerV:{
        flexDirection: 'row',
        flex: 1,
        paddingLeft: moderateScale(6)
    },
    more: {
        height: verticalScale(44),
        width: scale(150),
        justifyContent: 'flex-end',
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: moderateScale(6)
    },
    moreText: {
        fontSize: 12,
        color: 'rgb(175,175,192)'
    },
    columnWrapperStyle:{
        justifyContent:'space-between',
        paddingHorizontal: moderateScale(6)
    },
    customImagePlaceholderDefaultStyle:{
        width: scale(50),
        height: verticalScale(50),
        justifyContent: 'center'
    },
    contents:{
        flexDirection:'column',
        backgroundColor:'#ffffff',
        paddingBottom: moderateScale(8),
    },
    container:{
        flexDirection:'column',
        backgroundColor:'#ffffff',
    },
    rowsText:{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: verticalScale(30),
        backgroundColor: '#fff',
    },
    rowsHeader:{
        flexDirection: 'row',
        marginHorizontal: moderateScale(6),
        height: verticalScale(44),
        alignItems: 'center'
    },
    rows:{
        width: twoColumnCoverWidth,
        height: verticalScale(130),
        flexDirection:'column',
        alignItems:'center',
        justifyContent:'center',
        position:'relative'
    },
    hotIcon: {
        marginRight: moderateScale(5),
        width: scale(15),
        height: verticalScale(15),
        marginTop: moderateScale(2)
    },
    hotTextStyle: {
        fontSize: 14,
        color: '#404040',
        fontWeight: 'bold',
        fontFamily: 'PingFangSC-Medium'
    },
    descTextStyle: {
        fontSize: 12,
        color: '#404040',
        fontWeight:'bold',
        fontFamily: 'PingFangSC-Regular'
    },
    coverImgStyle: {
        width: twoColumnCoverWidth,
        height: verticalScale(100),
        borderRadius: moderateScale(2)
    },
});


































