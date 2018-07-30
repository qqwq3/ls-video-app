
'use strict';

import React,{ Component } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, Keyboard } from 'react-native';
import Immutable from 'immutable';
import _ from 'loadsh';
import { connect } from 'react-redux';
import Highlighter from 'react-native-highlight-words';
import { Styles, ScaledSheet, Img, Fonts, Colors, BackgroundColor } from "../../common/Style";
import { mix } from "../../common/Icons";
import Header from '../../components/Header';
import {infoToast, loadImage, numberConversion, pixel} from "../../common/Tool";
import Books from '../../components/Books';
import { reloadSearch, loadSearch } from "../../actions/Classification";
import NovelFlatList from '../../components/NovelFlatList';
import { RefreshState } from "../../common/Tool";
import DefaultDisplay from "../../components/DefaultDisplay";

type Props = {};

const ITEM_HEIGHT = 125;

class SearchEngines extends Component<Props>{
    constructor(props){
        super(props);
        this.state = {
            searchValue: '',
            searchStatus: false
        };
        this.errorTiem = Date.now();
    }
    componentWillMount(){
        this._keyboardHide = Keyboard.addListener('keyboardDidHide',this._keyboardDidHideHandler.bind(this));
    }
    componentDidMount() {
        // this.onHeaderRefresh && this.onHeaderRefresh(RefreshState.HeaderRefreshing);
    }
    componentWillReceiveProps(nextProps) {
        if(nextProps.error && nextProps.error.timeUpdated > this.errorTiem && this.state.searchStatus){
            this.errorTiem = nextProps.error.timeUpdated;

            if(parseInt(nextProps.error.code) === 500){
                infoToast('服务器出错啦，请稍后再试');
            }

            this.setState({searchStatus: false});
        }
    }
    componentWillUnmount(){
        this._keyboardHide && this._keyboardHide.remove();
    }
    _keyboardDidHideHandler(){
        this.textInputRef && this.textInputRef.blur();
    }
    // 搜索框文字变化
    _onChangeText(text){
        this.setState({searchValue: text});
    }
    // 搜索提交
    _onSubmitEditing(events){
        const word = events.nativeEvent.text || this.state.searchValue;
        this.props.reloadSearch && this.props.reloadSearch(word, RefreshState.HeaderRefreshing, 0);
        this.setState({searchStatus: true});
    }
    // 头部 - demo
    renderHeader(){
        return (
            <Header
                isConfigLeftChildren={true}
                isConfigRightChildren={true}
                demoLeftStyles={[styles.demoLeftStyles, Styles.paddingLeft15]}
                demoRightStyles={[styles.demoRightStyles, Styles.paddingRight15]}
                childrenLeft={
                    <View style={[styles.childrenLeftContent]}>
                        <View style={[styles.searchView]}>
                            <Image source={mix.search} style={[Img.resizeModeContain, styles.searchImage]}/>
                        </View>
                        <View style={[styles.searchBox]}>
                            <TextInput
                                ref={ref => this.textInputRef = ref}
                                returnKeyType={"search"}
                                placeholder={'请输入作者、书名、关键字词...'}
                                placeholderTextColor={'#808080'}
                                style={[styles.textInput, styles.searchBox]}
                                underlineColorAndroid={'transparent'}
                                onChangeText={this._onChangeText.bind(this)}
                                onSubmitEditing={this._onSubmitEditing.bind(this)}
                            />
                        </View>
                    </View>
                }
                childrenRight={
                    <TouchableOpacity
                        activeOpacity={0.5}
                        style={[styles.childrenRightContent]}
                        onPress={this._cancelSearch.bind(this)}
                    >
                        <Text style={[Fonts.fontFamily, Fonts.fontSize12, Colors.gray_404040]}>取消</Text>
                    </TouchableOpacity>
                }
            />
        );
    }
    // 取消 - function
    _cancelSearch(){
        const { navigation } = this.props;

        navigation && navigation.goBack();
    }
    // 数据渲染 - demo
    renderItemBooks({item, index}){
        const textStyles = [ Fonts.fontFamily, Fonts.fontSize12, Colors.gray_808080 ];
        const uri = loadImage(item.id);
        const _k = _.compact((item.title).split(''));
        const _v = _.compact((this.state.searchValue).split(''));
        const _words = _.intersection(_k,_v) || [];
        const _n = _.compact((item.author.name).split(''));
        const _words_name = _.intersection(_n, _v);

        return (
            <TouchableOpacity
                activeOpacity={0.75}
                style={[{backgroundColor: BackgroundColor.bg_fff}]}
                onPress={this._openDetail.bind(this, item)}
            >
                <View style={[styles.BookMarkBox, styles.menuInnerBottomBorder]}>
                    <Books source={{uri: uri}} clickAble={false} size={'large'}/>
                    <View style={styles.BookMarkMassage}>
                        {/*<Text style={[styles.BookMarkTitle, Fonts.fontFamily, Fonts.fontSize15]} numberOfLines={1}>{ item.title }</Text>*/}
                        <Highlighter
                            style={[styles.BookMarkTitle, Fonts.fontFamily, Fonts.fontSize15]}
                            numberOfLines={1}
                            highlightStyle={{color: BackgroundColor.bg_f3916b}}
                            searchWords={_words}
                            textToHighlight={item.title}
                        />
                        <View style={[styles.BookMarkNew]}>
                            <View style={{marginRight: 5}}>
                                <Text style={textStyles} numberOfLines={1}>最新章节</Text>
                            </View>
                            <View style={{maxWidth:193}}>
                                <Text style={textStyles} numberOfLines={1}>{ item.latestChapter.title }</Text>
                            </View>
                        </View>
                        <View style={[styles.BookMarkNew, {alignItems:'flex-end'}]}>
                            <View style={{marginRight: 5}}>
                                {/*<Text style={textStyles} numberOfLines={1}>{ item.author.name }</Text>*/}
                                <Highlighter
                                    style={textStyles}
                                    numberOfLines={1}
                                    highlightStyle={{color: BackgroundColor.bg_f3916b}}
                                    searchWords={_words_name}
                                    textToHighlight={item.author.name}
                                />
                            </View>
                            <View>
                                <Text style={textStyles} numberOfLines={1}>{ numberConversion(item.totalLikes) }人在阅读</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
    // 打开详情 - function
    _openDetail(item){
        const { navigation } = this.props;
        const hexId = item.hexId;
        const bookId = item.id;

        navigation && navigation.navigate('Details',{ hexId, bookId });
    }
    // 内容 - demo
    renderContent(){
        const { currentOffset, refreshState, totalRecords } = this.props;
        const records = this.props.records ? (this.props.records || []) : [];

        if(records.length === 0){
            return <DefaultDisplay/>;
        }

        return (
            <NovelFlatList
                //getItemLayout={(data, index) => ({length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index})}
                data={records}
                renderItem={this.renderItemBooks.bind(this)}
                keyExtractor={(item, index) => index + ''}
                onHeaderRefresh={this.onHeaderRefresh.bind(this)}
                onFooterRefresh={this.onFooterRefresh.bind(this)}
                refreshState={refreshState}
                numColumns={1}
                totalRecords={totalRecords}
                offset={currentOffset}
                contentContainerStyle={styles.contentContainerStyle}
            />
        );
    }
    // 头部刷新 - function
    onHeaderRefresh(refreshState){
        const { searchValue } = this.state;

        this.props.reloadSearch && this.props.reloadSearch(searchValue, refreshState, 0);
    }
    // 底部加载 - function
    onFooterRefresh(refreshState){
        const { searchValue } = this.state;
        const { currentOffset } = this.props;

        this.props.loadSearch && this.props.loadSearch(searchValue, refreshState, currentOffset);
    }
    render(){
        return (
            <View style={[Styles.container]}>
                { this.renderHeader() }
                { this.renderContent() }
            </View>
        );
    }
}

const styles = ScaledSheet.create({
    contentContainerStyle: {
        paddingBottom: 0,
    },
    textInput: {

    },
    BookMarkNew: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'nowrap',
        marginRight: '15@ms',
        height: '25@vs',
        alignItems: 'center',
        overflow: 'hidden',
    },
    BookMarkTitle: {
        color: '#4C4C4C',
        flex: 2
    },
    BookMarkMassage: {
        flex: 1,
        marginLeft: '15@ms',
        flexDirection: 'column'
    },
    BookMarkBox: {
        marginLeft: '15@ms',
        paddingTop: '15@ms',
        paddingBottom: '15@ms',
        flexDirection: 'row'
    },
    menuInnerBottomBorder: {
        borderBottomColor: '#E5E5E5',
        borderStyle: 'solid',
        borderBottomWidth: 1 / pixel
    },
    searchView: {
        flexDirection: 'row',
        alignItems:'center',
        justifyContent:'flex-start',
        height: '100%',
        width: '25@s'
    },
    searchBox: {
        position: 'relative',
        flex: 1,
    },
    searchImage: {
        width: '18@s',
        height: '18@vs',
    },
    demoLeftStyles: {
        flex: 1,
        position: 'relative'
    },
    demoRightStyles: {
        height: '100%',
        width: '60@s',
    },
    childrenRightContent: {
        flex:1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end'
    },
    childrenLeftContent: {
        flexDirection: 'row',
        width: '100%',
        height: '100%',
    },
});

const mapStateToProps = (state, ownProps) => {
    let data = state.getIn(['classification','search']);

    if(Immutable.Map.isMap(data)){ data = data.toJS() }
    return { ...ownProps, ...data };
};

export default connect(mapStateToProps,{reloadSearch,loadSearch})(SearchEngines);





































