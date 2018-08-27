
// 搜索后页面

'use strict';

import React,{ Component } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, ImageBackground } from 'react-native';
import ImageLoad from 'react-native-image-placeholder';
import Highlighter from 'react-native-highlight-words';
import PropTypes from 'prop-types';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import _ from 'lodash';

import { searchVideos, reloadSearchVideos } from '../../actions/explore';
import { pixel, playText, checkVideoSource } from "../../common/tool";
import XingrenFlatList from '../../components/XingrenFlatList';
import NoData from './NoData';
import { ICON_PREV_URL } from "../../Constants";

class SearchAfterPage extends Component<{}>{
    static propTypes = {
        searchRes: PropTypes.object.isRequired,
        currentSearchValue: PropTypes.string
    };
    static defaultValue = {
        searchRes: {},
        currentSearchValue:''
    };
    constructor(props){
        super(props);
        this.character = [];
    }
    render(){
        const { searchRes } = this.props;
        const iconNoWifi = require('../imgs/nowifi.png');

        return (
            (searchRes && searchRes !== undefined) ?
            <View style={styles.content}>
                <XingrenFlatList
                    data={this.props.searchRes && this.props.searchRes.records}
                    renderItem={this._renderItem.bind(this)}
                    keyExtractor={item => item.id}
                    onHeaderRefresh={this._onHeaderRefresh.bind(this)}
                    onFooterRefresh={this._onFooterRefresh.bind(this)}
                    refreshState={this.props.searchRes.refreshState}
                    numColumns={1}
                    totalRecords={this.props.searchRes.totalRecords}
                    offset={this.props.searchRes.offset}
                />
            </View> :
            <NoData source={iconNoWifi} isText={true} text={'暂无相关内容'}/>
        )
    }
    _onFooterRefresh = (refreshState) => {
        const { searchVideos,searchRes } = this.props;
        searchVideos(refreshState, searchRes.word, searchRes.offset, false);
    };
    _onHeaderRefresh(refreshState){
        const { reloadSearchVideos,searchRes } = this.props;
        reloadSearchVideos(refreshState, searchRes.word, 0);
    }
    _renderItem({item,index}){
        const { currentSearchValue } = this.props || "";
        const _k = _.compact((item.title).split(''));
        const _v = _.compact(currentSearchValue && currentSearchValue.split(''));
        const _words = _.intersection(_k,_v) || [];
        let _characterArr = [];
        const _character = item.character || [];
        _character.map((o,j) => _characterArr.push(o.name));
        const _characterStr = _characterArr.join('');
        const _characterSplit = _characterStr.split('');
        const _c_words = _.intersection(_v,_characterSplit) || [];
        const iconBottomVignette = require('../imgs/bottom-vignette.png');
        const iconDefaultFilmCover = require('../imgs/default_film_cover.png');
        const uri = item && item.srcTag && ICON_PREV_URL + item.srcTag.tag + '.png';
        
        return (
            <TouchableOpacity
                key={index}
                activeOpacity={0.75}
                style={{backgroundColor: '#FFF'}}
                onPress={this._goVideo.bind(this,item.hexId)}
            >
                <View style={styles.BookMarkBox}>
                    <View style={styles.imageLoadBox}>
                        <ImageLoad
                            source={{uri: item.cover}}
                            style={styles.BookMarkImage}
                            customImagePlaceholderDefaultStyle={styles.BookMarkImage}
                            isShowActivity={false}
                            placeholderSource={iconDefaultFilmCover}
                            borderRadius={2}
                        />
                        <ImageBackground style={styles.rowsIB} imageStyle={styles.imageStyle} source={iconBottomVignette}>
                            <Text/>
                            {
                                (item && parseInt(item.score) !== 0) ?
                                <Text style={[styles.videoSourceBoxText,{fontSize:12,color:'#FD9013'}]}>{ item && item.score && item.score.toFixed(1) }</Text> :
                                <Text style={[styles.videoSourceBoxText,{fontSize:12,color:'#FD9013'}]}>7.2</Text>
                            }
                        </ImageBackground>
                        {
                            item && item.isVip !== 0 ?
                            <View style={styles.vip}>
                                { item && item.srcTag ? <Image source={{uri:uri}} resizeMode={'contain'} style={styles.vipImages}/> : null  }
                            </View>
                            : null
                        }
                    </View>
                    <View style={styles.BookMarkMassage}>
                        <Highlighter
                            style={styles.BookMarkTitle}
                            numberOfLines={1}
                            highlightStyle={{color:'rgb(0,117,248)'}}
                            searchWords={_words}
                            textToHighlight={item.title}
                        />
                        <View style={[styles.BookMarkNew]}>
                            {
                                (item.zone || []).map((n,m) => {
                                    return (
                                        <View key={m} style={{marginRight:5}}>
                                            <Text style={[styles.BookFont,{color:'rgb(175,175,192)'}]}>{n.name}</Text>
                                        </View>
                                    )
                                })
                            }
                            {
                                (item.genre || []).map((obj,i) => {
                                    return (
                                        <View key={i} style={{marginRight:5}}>
                                            <Text style={[styles.BookFont,{color:'rgb(175,175,192)'}]}>{obj.name}</Text>
                                        </View>
                                    )
                                })
                            }
                        </View>
                        <View style={[styles.BookMarkNew]}>
                            <View style={{marginRight:5}}>
                                <Highlighter
                                    style={[styles.BookFont]}
                                    numberOfLines={1}
                                    highlightStyle={{color:'rgb(0,117,248)'}}
                                    searchWords={_c_words}
                                    textToHighlight={'演员：'+ (_characterArr.join(' ') || '暂未公布')}
                                />
                            </View>
                        </View>
                        <View style={[styles.BookMarkNew,{justifyContent:'space-between'}]}>
                            <View><Text style={[styles.BookFont,{color:'rgb(175,175,192)'}]}>年代：{this._time(item.year) || '暂未公布'}</Text></View>
                            <View><Text style={[styles.BookFont,{color:'rgb(175,175,192)'}]}>{playText(item.type)}</Text></View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
    _time(date:any){
        let text = '';
        if(date === 0 || date === '0'){
            return text = '暂无';
        }
        return text = date+'年';
    }
    _goVideo(hexId){
        const { navigate } = this.props.navigation;
        navigate('MoviePlayScreen', {code: hexId});
    }
}

const mapStateToProps = (state, ownProps) => {
    let data = state.getIn(['explore', 'root']);
    if (Immutable.Map.isMap(data)) {
        data = data.toJS();
    }
    return {
        ...ownProps,
        ...data,
    };
};

export default connect(mapStateToProps, {
    reloadSearchVideos,
    searchVideos
})(SearchAfterPage);

const styles = StyleSheet.create({
    vipImages:{
        width:22,
        height:12,
    },
    vip:{
        position:'absolute',
        right:4,
        top:0,
        zIndex:100,
        overflow:'hidden',
        height:12,
        width: 22,
        justifyContent:'center',
        alignItems:'center',
        borderBottomLeftRadius:3,
        borderBottomRightRadius:3
    },
    imageLoadBox:{
        position:'relative',
        overflow:'hidden',
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
        height:25,
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'flex-end',
        paddingHorizontal: 4,
        paddingBottom:3,
        borderRadius:2
    },
    imageStyle:{
        resizeMode: 'stretch'
    },
    content:{
        flex:1,
        backgroundColor:'#ffffff',
        flexDirection: 'column'
    },
    backTextWhite: {
        color: '#FFF'
    },
    standaloneRowFront: {
        alignItems: 'center',
        backgroundColor: '#CCC',
        justifyContent: 'center',
        height: 50,
    },
    standaloneRowBack: {
        alignItems: 'center',
        backgroundColor: '#8BC645',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15
    },
    BookMarkProgress: {
        flex: 1,
        fontSize: 12,
        color: '#f3916b',
        flexDirection: 'row',
        flexWrap: 'nowrap'
    },
    BookFont: {
        fontSize: 12
    },
    BookMarkNew: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'nowrap',
        marginRight: 15,
        height: 25,
        alignItems: 'center',
        overflow: 'hidden',
    },
    BookMarkMassage: {
        flex: 1,
        marginLeft: 15,
        flexDirection: 'column'
    },
    BookMarkContent: {
        flex: 1,
        backgroundColor: '#FFFFFF'
    },
    BookMarkTitle: {
        fontSize: 15,
        color: '#4C4C4C',
        flex: 2
    },
    BookMarkImage: {
        width: 75,
        height: 95,
        borderRadius: 2,
        borderWidth: 0.25,
        borderColor: '#ccc'
    },
    BookMarkBox: {
        marginLeft: 15,
        paddingTop: 15,
        paddingBottom: 15,
        borderBottomWidth: 1 / pixel,
        borderBottomColor: '#E5E5E5',
        borderStyle: 'solid',
        flexDirection: 'row',
        position:'relative'
    },
    BookMarkBoxDel: {
        width: 90,
        flexDirection: 'row',
        justifyContent: 'center',
        flex: 1,
        alignItems: 'center'
    },
    BookMarkBoxDelText: {
        color: '#FFFFFF',
        fontSize: 17,

    },
    BookMarkBoxDeRowBack: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        backgroundColor: '#f8525a'
    }
});




























