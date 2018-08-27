
'use strict';

import React,{ Component } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    TextInput,
    Keyboard,
    ScrollView,
    Alert,
    BackHandler,
    StatusBar
} from 'react-native';
import Immutable from 'immutable';
import _ from 'loadsh';
import { connect } from 'react-redux';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import Highlighter from 'react-native-highlight-words';
import { Styles, ScaledSheet, Img, Fonts, Colors, BackgroundColor } from "../../common/Style";
import { mix, def } from "../../common/Icons";
import Header from '../../components/Header';
import { height, infoToast, closeInfoToast, loadImage, numberConversion, pixel, width } from "../../common/Tool";
import Books from '../../components/Books';
import { reloadSearch, loadSearch, cleanSearch } from "../../actions/Classification";
import NovelFlatList from '../../components/NovelFlatList';
import { RefreshState } from "../../common/Tool";
import DefaultDisplay from "../../components/DefaultDisplay";
import { commonSave, commonLoad, commonRemove } from "../../common/Storage";
import Dialog from '../../components/Dialog';

type Props = {
    records: ?Array<any>,
    cleanSearch: () => void,
    loadSearch: () => void,
    reloadSearch: () => void,
    currentOffset: ?number,
    refreshState: ?number,
    totalRecords?: number | string,
};

type State = {};

const ITEM_HEIGHT = verticalScale(125);

class SearchEngines extends Component<Props, State, *>{
    static defaultProps = {
        records: [],
        currentOffset: 12,
        refreshState: 0,
        totalRecords: 0
    };
    constructor(props){
        super(props);
        this.state = {
            searchValue: '',
            searchStatus: false,
            searchRecords: [],
            searchKeywordStatus: true,
            searchDefaultValue: '',
        };
        this.errorTiem = Date.now();
        this.toast = null;
    }
    async componentWillMount(){
        this._keyboardHide = Keyboard.addListener('keyboardDidHide',this._keyboardDidHideHandler.bind(this));

        let _arr = await commonLoad('searchKeywords');
        if(_arr) { this.setState({searchRecords: _arr.searchRecords}) }
    }
    componentDidMount() {
        // this.onHeaderRefresh && this.onHeaderRefresh(RefreshState.HeaderRefreshing);
    }
    componentWillReceiveProps(nextProps) {
        if(nextProps.error && nextProps.error.timeUpdated > this.errorTiem && this.state.searchStatus){
            this.errorTiem = nextProps.error.timeUpdated;

            if(parseInt(nextProps.error.code) === 500){
                this.toast = infoToast('服务器出错啦，请稍后再试');
            }

            this.setState({searchStatus: false});
        }
    }
    componentWillUnmount(){
        this._keyboardHide && this._keyboardHide.remove();

        if(this.props.records && (this.props.records).length !== 0){
            this.props.cleanSearch && this.props.cleanSearch();
        }

        this.toast && closeInfoToast(this.toast);
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
        this.setState({searchStatus: true, searchKeywordStatus: false});

        let searchRecords = this.state.searchRecords;

        searchRecords.push(word);
        searchRecords = _.uniq(searchRecords);
        commonSave && commonSave('searchKeywords',{ searchRecords });
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
                                defaultValue={this.state.searchDefaultValue}
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
                            <View style={{marginRight: moderateScale(5)}}>
                                <Text style={textStyles} numberOfLines={1}>最新章节</Text>
                            </View>
                            <View style={{maxWidth: scale(193)}}>
                                <Text style={textStyles} numberOfLines={1}>{ item.latestChapter.title }</Text>
                            </View>
                        </View>
                        <View style={[styles.BookMarkNew, {alignItems:'flex-end', justifyContent: 'space-between'}]}>
                            <View style={[{marginRight: moderateScale(5), flexDirection: 'row'}]}>
                                <Text style={textStyles} numberOfLines={1}>作者：</Text>
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
    // 记忆搜索 - function
    _keywordSearch(word){
        this.props.reloadSearch && this.props.reloadSearch(word, RefreshState.HeaderRefreshing, 0);
        this.setState({
            searchStatus: true,
            searchKeywordStatus: false,
            searchDefaultValue: word,
            searchValue: word,
        });
    }
    // 内容 - demo
    renderContent(){
        const { currentOffset, refreshState, totalRecords, records } = this.props;
        const { searchRecords, searchKeywordStatus } = this.state;
        const _height =  height - (StatusBar.currentHeight + verticalScale(44));

        if(searchRecords.length !== 0 && searchKeywordStatus){
            return (
                <ScrollView showsVerticalScrollIndicator={false} style={styles.keywordsContent}>
                    <View style={[styles.memoryBox]}>
                        <View style={[styles.memoryHeader, Styles.paddingHorizontal15]}>
                            <Text style={[Fonts.fontFamily, Fonts.fontSize15, Colors.gray_404040]}>上次搜索过</Text>
                        </View>
                        <View style={[styles.memoryBody, Styles.paddingHorizontal15, Styles.paddingBottom15]}>
                            {
                                searchRecords.map((word, index) => {
                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            activeOpacity={0.50}
                                            onPress={this._keywordSearch.bind(this, word)}
                                            style={[styles.memorySingleBox,  Styles.marginRight15, Styles.marginBottom15,]}
                                        >
                                            <Text style={[Fonts.fontFamily, Fonts.fontSize12, Colors.orange_f3916b]}>{ word }</Text>
                                        </TouchableOpacity>
                                    )
                                })
                            }
                        </View>
                        <TouchableOpacity
                            activeOpacity={0.50}
                            style={[styles.memoryAllClean, Styles.flexCenter]}
                            onPress={this._memoryKeywordsClean.bind(this)}
                        >
                            <Text style={[Fonts.fontFamily, Fonts.fontSize12, Colors.gray_808080]}>全部清空</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            );
        }

        return (
            <NovelFlatList
                // getItemLayout={(data, index) => ({length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index})}
                data={records}
                // ListEmptyComponent={this._listEmptyComponent.bind(this)}
                ListEmptyComponent={
                    <View style={[{height: _height, width: width}]}>
                        <DefaultDisplay />
                    </View>
                }
                renderItem={this.renderItemBooks.bind(this)}
                keyExtractor={(item, index) => index + ''}
                onHeaderRefresh={this.onHeaderRefresh.bind(this)}
                onFooterRefresh={this.onFooterRefresh.bind(this)}
                refreshState={refreshState}
                numColumns={1}
                totalRecords={totalRecords}
                offset={currentOffset}
                showArrow={true}
                contentContainerStyle={styles.contentContainerStyle}
            />
        );
    }
    // 为空的时候显示 - demo
    _listEmptyComponent(){
        return (
            <View style={[Styles.flexCenter, Styles.marginTop15]}>
                <DefaultDisplay
                    showText={true}
                    text={'暂无搜索记录'}
                />
            </View>
        );
    }
    // 全部清空上次搜索记录 - function
    _memoryKeywordsClean(){
        // Alert.alert('提示','确定要清空上次搜索记录吗？',[
        //     { text: '取消', onPress: () => {} },
        //     { text: '确定', onPress: () => {
        //             commonRemove && commonRemove('searchKeywords');
        //             this.setState({searchKeywordStatus: false});
        //         }
        //     }
        // ]);

        this.popExitRef && this.popExitRef.modeShow();
    }
    // 立即清空 - function
    onDismissExit(){
        commonRemove && commonRemove('searchKeywords');
        this.setState({searchKeywordStatus: false});
        this.popExitRef && this.popExitRef.modeHide();
    }
    // 暂不清空 - function
    onConfirmExit(){
        this.popExitRef && this.popExitRef.modeHide();
    }
    // 选择操作 - demo
    renderSelect(){
        return (
            <Dialog
                popHeight={verticalScale(180)}
                ref={ref => this.popExitRef = ref}
                animationType={'slide'}
                title={'温馨提示'}
                buttonLeftText={'立即清空'}
                buttonRightText={'暂不清空'}
                mandatory={true}
                onDismiss={this.onDismissExit.bind(this)}
                onConfirm={this.onConfirmExit.bind(this)}
            >
                <View style={[Styles.flexCenter, Styles.flex1]}>
                    <Text style={[Fonts.fontSize15, Fonts.fontFamily, Colors.gray_404040]}>确定要清空上次搜索记录吗？</Text>
                </View>
            </Dialog>
        );
    }
    // 头部刷新 - function
    onHeaderRefresh(refreshState){
        const { searchValue } = this.state;
        const { records } = this.props;

        if(records.length === 0){
            this.toast = infoToast('请输入关键字词');
            return;
        }

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
                { this.renderSelect() }
            </View>
        );
    }
}

const styles = ScaledSheet.create({
    memoryAllClean: {
        height: '44@vs'
    },
    memorySingleBox: {
        backgroundColor: BackgroundColor.bg_f1f1f1,
        paddingHorizontal: '20@ms',
        paddingVertical: '10@ms',
        borderRadius: '2.5@ms',
    },
    memoryBox: {
        overflow: 'hidden',
        position: 'relative',
    },
    memoryHeader: {
        height: '44@vs',
        alignItems:'center',
        justifyContent: 'flex-start',
        flexDirection:'row',
    },
    memoryBody: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        flexWrap: 'wrap',
    },
    keywordsRows:{
        height: '45@vs',
        borderBottomColor:'#dcdcdc',
        borderBottomWidth: moderateScale(1 / pixel),
        alignItems:'center',
        flexDirection:'row'
    },
    rowsClickText:{
        flex: 1,
        height: '45@vs',
        justifyContent: 'center'
    },
    keywordsRowsView:{
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row'
    },
    keywordsContent: {
        width: '100%',
    },
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

export default connect(mapStateToProps,{reloadSearch, loadSearch, cleanSearch})(SearchEngines);





































