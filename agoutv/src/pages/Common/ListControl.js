
'use strict';

import React,{ PureComponent } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ImageBackground } from 'react-native';
import ImageLoad from 'react-native-image-placeholder';
import Swipeout from 'react-native-swipeout';
import { width, pixel, playText, checkVideoSource, toHHMMSS } from "../../common/tool";
import { loadCommon } from '../../common/Storage';
import { ICON_PREV_URL } from "../../Constants";

type Props = {
    rowDelete?: Function,
    play: Function,
    item?: Object,
    collection: boolean,
    history: boolean,
};

type State = {};

// 获取默认图
const placeholderSource = require('../imgs/default_film_cover.png');
// 工具箱
const util = require('../../common/Util');

class ListControl extends PureComponent<Props,State>{
    state: State;
    static defaultValue = {
        item: {},
        collection: false,
        history: false,
    };
    constructor(props) {
        super(props);
        this.currentPlayerRecord = 0;
        this.state = {
            currentPlayerRecord: 0,
        };
    }
    componentWillMount(){
        const { item } = this.props;
        const type = item.type;
        const code = item.hexId;
        const episode = item.src && item.src.episode;

        this._loadPlayerRecordTime(type,code,episode);
    }
    componentWillReceiveProps(nextProps) {
        const { item } = nextProps;
        const type = item.type;
        const code = item.hexId;
        const episode = item.src && item.src.episode;

        if(nextProps && nextProps.timeStatus){
            this._loadPlayerRecordTime(type,code,episode);
        }
    }
    _delete(){
        const { rowDelete } = this.props;
        return rowDelete();
    }
    _play(){
        const { play } = this.props;
        return play();
    }
    // 总集数
    _totalNodes(item){
        let type = item && item.type;
        let episode = item && item.latestSerialsSrc && item.latestSerialsSrc.episode;

        if(type === 2 || type === 4){
            return (
                <Text style={styles.smallText}>更新至{ episode }集</Text>
            );
        }
    }
    // 观看至多少集
    _viewNodes(item){
        let type = item && item.type;
        let src = item && item.src;
        let episode = src.episode;

        if(Number(type) === 2 || Number(type) === 4){
            return (
                <Text style={styles.smallText}>
                    <Text>观看至第{ episode }集</Text>
                    {
                        this.state.currentPlayerRecord !== 0 && <Text><Text>，播放至</Text>
                            <Text style={{color:'rgb(0,117,248)'}}> {toHHMMSS(this.state.currentPlayerRecord)}</Text>
                        </Text>
                    }
                </Text>
            );
        }

        if(Number(type) === 1 && this.state.currentPlayerRecord !== 0){
            return (
                <Text style={styles.smallText}>
                    <Text>播放至</Text>
                    <Text style={{color:'rgb(0,117,248)'}}> {toHHMMSS(this.state.currentPlayerRecord)}</Text>
                </Text>
            );
        }
    }
    // 公共加载本地记录时间方法
    async _loadPlayerRecordTime(type: number | string, code: string , episode?: number | string){
        let T = Number(type);
        let currentPlayerRecord = 0;
        // 电影
        if(T === 1){
            // 播放时就取到当前视频本地记录的时间
            currentPlayerRecord = await loadCommon(code) || 0;
            this.setState({currentPlayerRecord: currentPlayerRecord});
        }
        // 其他（电视剧，综艺，动漫）
        else {
            currentPlayerRecord = await loadCommon(code + episode) || 0;
            this.setState({currentPlayerRecord: currentPlayerRecord});
        }
    }
    render() {
        const { item, collection, history } = this.props;
        const iconBottomVignette = require('../imgs/bottom-vignette.png');
        const uri = item && item.srcTag && ICON_PREV_URL + item.srcTag.tag + '.png';

        return (
            <View style={styles.swipeoutBox}>
                <Swipeout
                    style={styles.swipeout}
                    autoClose={true}
                    right={[{backgroundColor: 'red', component: <DeleteButton/>, onPress: this._delete.bind(this)}]}
                    buttonWidth={90}
                    sensitivity={10}
                >
                    <TouchableOpacity style={styles.swipeoutTouchable} onPress={this._play.bind(this)} activeOpacity={0.75}>
                        <View style={[styles.imageLoadView]}>
                            <ImageLoad
                                source={{uri: item.cover}}
                                style={styles.imageLoad}
                                customImagePlaceholderDefaultStyle={styles.ciphds}
                                isShowActivity={false}
                                placeholderSource={placeholderSource}
                                borderRadius={2}
                            />
                            <ImageBackground style={styles.rowsIB} imageStyle={styles.imageStyle} source={iconBottomVignette}>
                                <Text />
                                {
                                    item && (item.score !== 0) ?
                                    <Text style={[styles.videoSourceBoxText,{fontSize:12,color:'#FD9013'}]}>
                                        { item && item.score && item.score.toFixed(1) }
                                    </Text> :
                                    <Text style={[styles.videoSourceBoxText,{fontSize:12,color:'#FD9013'}]}>
                                        7.0
                                    </Text>
                                }
                            </ImageBackground>
                            {
                                item && (item.isVip !== 0) ?
                                <View style={styles.vip}>
                                    { item && item.srcTag ? <Image source={{uri:uri}} resizeMode={'contain'} style={styles.vipImages}/> : null  }
                                </View>
                                : null
                            }
                        </View>
                        {
                            collection &&
                            <View style={styles.swipeoutContentText}>
                                <Text style={styles.swipeoutTitle}>{item.title}</Text>
                                <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                                    <Text style={styles.smallText}>视频类型：{ playText(Number(item.type)) }</Text>
                                    { this._totalNodes(item) }
                                </View>
                                <Text style={styles.smallText}>收藏时间：{util.tsToDateFormat(item.timeCreated, 'yyyy-MM-dd')}</Text>
                            </View>
                        }
                        {
                            history &&
                            <View style={styles.swipeoutContentText}>
                                <Text style={styles.swipeoutTitle}>{item.title}</Text>
                                { this._viewNodes(item) }
                                <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                                    <Text style={styles.smallText}>{util.tsToDateFormat(item.timeCreated, 'yyyy-MM-dd')}</Text>
                                    <Text style={styles.smallText}>{ playText(Number(item.type)) }</Text>
                                </View>
                            </View>
                        }
                    </TouchableOpacity>
                </Swipeout>
                <View style={styles.line}/>
            </View>
        );
    }
}

class DeleteButton extends React.PureComponent<{}>{
    render(){
        return (
            <View style={styles.deleteButton}>
                <Text style={styles.deleteButtonText}>删除</Text>
            </View>
        )
    }
}

export default ListControl;

const styles = StyleSheet.create({
    vip:{
        position:'absolute',
        right:4,
        top:10,
        zIndex:100,
        overflow:'hidden',
        height:12,
        width: 22,
        justifyContent:'center',
        alignItems:'center',
        borderBottomLeftRadius:3,
        borderBottomRightRadius:3
    },
    vipImages:{
        width:22,
        height:12,
    },
    imageLoadView:{
        width:80,
        height:'100%',
        position:'relative',
        overflow:'hidden',
        borderRadius:2
    },
    videoSourceBoxText:{
        fontSize: 10,
        color:'#FFFFFF'
    },
    rowsIB:{
        position:'absolute',
        left:0,
        bottom:0,
        zIndex:10,
        right:0,
        overflow:'hidden',
        height: 30,
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'flex-end',
        paddingHorizontal:4,
        paddingBottom: 2
    },
    imageStyle:{
        resizeMode: 'stretch'
    },
    ciphds:{
        height: 60,
        width: 60,
        justifyContent: 'center'
    },
    smallText:{
        fontSize:13,
        color:'rgb(175,175,192)'
    },
    swipeoutTitle:{
        fontSize: 14,
        fontWeight:'bold',
        fontFamily: 'PingFangSC-Semibold',
        color: 'rgb(64,64,64)'
    },
    deleteButton:{
        backgroundColor:'red',
        justifyContent:'center',
        alignItems:'center',
        flex:1
    },
    deleteButtonText:{
        fontSize:16,
        color:'#ffffff'
    },
    swipeoutContentText:{
        flex: 1,
        paddingLeft:10,
        justifyContent:'space-between',
        paddingTop:10
    },
    line:{
        position:'absolute',
        width:width-10,
        left:10,
        bottom:0,
        height:1,
        borderBottomColor: '#dcdcdc',
        borderBottomWidth: 1/pixel
    },
    swipeoutBox:{
        position:'relative',
        flexDirection:'column'
    },
    swipeout:{
        backgroundColor:'#ffffff',
        paddingHorizontal: 10,
    },
    imageLoad:{
        height: 100,
        width: 80,
        marginTop: 10
    },
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    swipeoutTouchable:{
        flexDirection: 'row',
        paddingBottom: 10
    },
});











