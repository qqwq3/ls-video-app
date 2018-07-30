
'use strict';

import React,{ Component } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import Toast from 'react-native-root-toast';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import {Styles, ScaledSheet, Fonts, Colors, BackgroundColor, Img} from "../../common/Style";
import {pixel, width, RefreshState, statusBarSet, infoToast} from "../../common/Tool";
import { reloadChapterDirectory, loadChapterDirectory, reloadBookMark, loadBookMark } from '../../actions/CatalogDirectory';
import chapterDirectory from "../../reducers/ChapterDirectory";
import NovelFlatList from '../../components/NovelFlatList';
import Header from '../../components/Header';
import { readerImg } from "../../common/Icons";
import BaseComponent from '../../components/BaseComponent';
import { updateChapter } from '../../actions/LocalAction';

type Props = {};

type State = {};

class ChapterDirectory extends Component<Props, State>{
    static defaultProps = {};
    constructor(props){
        super(props);
        this.state = {
            currentIndex: 0,
        };
        this.errorTime = Date.now();
    }
    componentWillMount() {
        const { navigation } = this.props;
        const type = navigation.getParam('type');

        //type !== 'chapter' && statusBarSet && statusBarSet.barHide();
    }
    componentDidMount() {
        const { navigation } = this.props;
        const type = navigation.getParam('type');

        this.onHeaderRefreshChapter && this.onHeaderRefreshChapter(RefreshState.HeaderRefreshing);

        if(type === 'bookmark'){
           // this.onHeaderRefreshBookmark && this.onHeaderRefreshBookmark(RefreshState.HeaderRefreshing);
        }
    }
    componentWillUnmount() {
        const { navigation } = this.props;
        const type = navigation.getParam('type');

        //type === 'chapter' && statusBarSet && statusBarSet.barShow();
    }
    componentWillReceiveProps(nextProps) {

        // console.log('777777',nextProps);

        // if(nextProps.mark && nextProps.mark.error){
        //     if(nextProps.mark.error.timeUpdated > this.errorTime){
        //         this.errorTime = nextProps.mark.error.timeUpdated;
        //         //infoToast && infoToast(nextProps.mark.error.message, { duration: 2000, position: Toast.positions.CENTER });
        //     }
        // }
    }
    // 从章节去阅读 - function
    chapterReader(item, sourceSiteIndex, vipChapterIndex){
        const { navigation, updateChapter, directory } = this.props;
        const hexId = item.hexId;
        const bookId = item.bookId;
        const bookHexId = directory && directory.book && directory.book.hexId;

        // const value = parseInt(sourceSiteIndex) >= parseInt(vipChapterIndex) ? '1' : '0';

        updateChapter && updateChapter(true);
        navigation && navigation.navigate('Reader',{ hexId, bookId, bookHexId, direct: false});
    }
    // 返回 - function
    _goBack() {
        const { navigation } = this.props;
        navigation && navigation.goBack();
    }
    // 头部 - demo
    renderHeader() {
        const { navigation } = this.props;
        const type = navigation.getParam('type');
        const title = navigation.getParam('title');

        return (
            <Header
                isTitleRight={false}
                title={type === 'chapter' ? title : ''}
                isArrow={true}
                goBack={this._goBack.bind(this)}
            />
        );
    }
    // 章节数据渲染 - demo
    renderItemChapter({item, index}){
        const { directory } = this.props;
        const book = directory ? directory.book : false;
        const vipChapterIndex = book ? book.vipChapterIndex : 0;

        return (
            <TouchableOpacity
                key={index}
                style={[styles.rcBodyRow]}
                activeOpacity={0.75}
                onPress={this.chapterReader.bind(this, item, parseInt(item.sourceSiteIndex), parseInt(vipChapterIndex))}
            >
                <Text
                    numberOfLines={1}
                    style={[Fonts.fontFamily, Fonts.fontSize14, Colors.gray_808080, {maxWidth: width - scale(60)}]}
                >
                    { item.title }
                </Text>
                {
                    (parseInt(item.sourceSiteIndex) >= parseInt(vipChapterIndex) && parseInt(vipChapterIndex) !== 0)
                    ? <Image source={readerImg.rmb} style={[Img.resizeModeContain, styles.rmbImage]}/> : null
                }
            </TouchableOpacity>
        );

    }
    // 头部刷新 - 章节 - function
    onHeaderRefreshChapter(refreshState){
        const { reloadChapterDirectory, navigation } = this.props;
        const hexId =  navigation.getParam('hexId');
        const type = navigation.getParam('type');

        reloadChapterDirectory && reloadChapterDirectory(type, hexId, refreshState, 0);
    }
    // 底部加载 - 章节 - function
    onFooterRefreshChapter(refreshState){
        const { loadChapterDirectory, directory, navigation } = this.props;
        const hexId =  navigation.getParam('hexId');
        const type = navigation.getParam('type');
        const currentOffset = directory ? directory.currentOffset : 0;

        loadChapterDirectory && loadChapterDirectory(type, hexId, refreshState, currentOffset);
    }
    // 头部刷新 - 书签 - function
    onHeaderRefreshBookmark(refreshState){
        const { reloadBookMark, navigation } = this.props;
        const hexId =  navigation.getParam('hexId');
        const type = navigation.getParam('type');

        reloadBookMark && reloadBookMark(type, hexId, refreshState, 0);
    }
    // 底部加载 - 书签 - function
    onFooterRefreshBookmark(refreshState){
        const { loadBookMark , navigation, mark } = this.props;
        const hexId =  navigation.getParam('hexId');
        const type = navigation.getParam('type');
        const currentOffset = mark ? mark.currentOffset : 0;

        loadBookMark && loadBookMark(type, hexId, refreshState, currentOffset);
    }
    // 目录 - demo
    renderCatalog(){
        const { directory } = this.props;
        const currentOffset = directory ? directory.currentOffset : 0;
        const refreshState = directory ? directory.refreshState : 0;
        const totalRecords = directory ? directory.totalRecords : 0;
        const records = directory ? directory.chapters : [];

        return (
            <View style={[styles.rcBody]} tabLabel={'目录'}>
                <NovelFlatList
                    data={records}
                    renderItem={this.renderItemChapter.bind(this)}
                    keyExtractor={(item, index) => index + ''}
                    onHeaderRefresh={this.onHeaderRefreshChapter.bind(this)}
                    onFooterRefresh={this.onFooterRefreshChapter.bind(this)}
                    refreshState={refreshState}
                    numColumns={1}
                    totalRecords={totalRecords}
                    offset={currentOffset}
                    contentContainerStyle={styles.contentContainerStyle}
                />
            </View>
        );
    }
    // 书签 - demo
    renderBookMark(){
        const { mark } = this.props;
        const currentOffset = mark ? mark.currentOffset : 0;
        const refreshState = mark ? mark.refreshState : 0;
        const totalRecords = mark ? mark.totalRecords : 0;
        const records = mark ? mark.records : [];

        return (
            <View style={[styles.rcBody]} tabLabel={'书签'}>
                {
                    !(mark && mark.error) ?
                    <NovelFlatList
                        data={records}
                        renderItem={this.renderItemBookmark.bind(this)}
                        keyExtractor={(item, index) => index + ''}
                        onHeaderRefresh={this.onHeaderRefreshBookmark.bind(this)}
                        onFooterRefresh={this.onFooterRefreshBookmark.bind(this)}
                        refreshState={refreshState}
                        numColumns={1}
                        totalRecords={totalRecords}
                        offset={currentOffset}
                        contentContainerStyle={styles.contentContainerStyle}
                    /> :
                    <View style={[Styles.flexCenter, Styles.flex1]}>
                        <Text style={[Fonts.fontFamily, Fonts.fontSize16, Colors.orange_f3916b]}>
                            登录后查看书签
                        </Text>
                    </View>
                }

            </View>
        );
    }
    // 书签数据渲染 - demo
    renderItemBookmark({item, index}){
        const commonFontStyles = [Fonts.fontFamily, Fonts.fontSize12, Colors.gray_808080];

        return (
            <View style={styles.rcBodyContent}>
                <TouchableOpacity
                    style={[styles.rcBodyRow,{height: verticalScale(60), borderStyle:'solid'}]}
                    onPress={this.continueReader.bind(this, item)}
                    activeOpacity={1}
                >
                    <View style={styles.rcBodyRowLeft}>
                        <View>
                            <Text style={[Fonts.fontFamily, Fonts.fontSize14, Colors.gray_404040]}>{ item.bookTitle }</Text>
                        </View>
                        <View style={{flexDirection:'row'}}>
                            <View style={{marginRight: moderateScale(5)}}>
                                <Text style={commonFontStyles}>已读至</Text>
                            </View>
                            <View style={{maxWidth:160}}>
                                <Text numberOfLines={1} style={commonFontStyles}>{ item.chapterTitle }</Text>
                            </View>
                        </View>
                    </View>
                    <View style={[styles.rcBodyRowBut, Styles.flexCenter]}>
                        <Text style={commonFontStyles}>继续阅读</Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
    // 继续阅读 - function
    continueReader(item){
        const { navigation } = this.props;
        const hexId = item.hexId;
        const bookId = item.bookId;
        const sourceSiteIndex = item.sourceSiteIndex;
        const vipChapterIndex = item.vipChapterIndex;
        const value = parseInt(sourceSiteIndex) >= parseInt(vipChapterIndex) ? '1' : '0';

        navigation && navigation.navigate('Reader',{ hexId, bookId, direct: true, value: value });
    }
    render(){
        const { navigation } = this.props;
        const type = navigation.getParam('type');

        return (
            <View style={[Styles.container]}>
                { this.renderHeader() }
                {
                    type === 'chapter' ? this.renderCatalog() :
                    <ScrollableTabView
                        renderTabBar={() => <ReaderCatalogueMenu/>}
                        tabBarInactiveTextColor={'#4c4c4c'}
                        tabBarActiveTextColor={'#f3916b'}
                        tabBarBackgroundColor={'#ffffff'}
                        locked={false}
                        scrollWithoutAnimation={false}
                        prerenderingSiblingsNumber={2}
                    >
                        { this.renderCatalog() }
                        { this.renderBookMark() }
                    </ScrollableTabView>
                }
            </View>
        );
    }
}

// 自定义 - 切换菜单
class ReaderCatalogueMenu extends Component{
    render(){
        return (
            <View style={styles.rcHeader}>
                {
                    this.props.tabs.map((name, index) => {
                        const color = this.props.activeTab === index ? BackgroundColor.bg_f3916b : BackgroundColor.bg_808080;

                        return (
                            <TouchableOpacity
                                key={index}
                                activeOpacity={0.75}
                                onPress={this.switchMenu.bind(this, index)}
                                style={[Styles.flexCenter, Styles.flex1, styles.rcMenuBox]}
                            >
                                <View style={[styles.rcMenu, Styles.flexCenter, index === 0 && styles.rightBorder]}>
                                    <Text style={[Fonts.fontFamily, Fonts.fontSize15, {color}]}>{ name }</Text>
                                </View>
                            </TouchableOpacity>
                        )
                    })
                }
            </View>
        )
    }
    switchMenu(index){
        this.props.goToPage && this.props.goToPage(index);
    }
}

const styles = ScaledSheet.create({
    rmbImage: {
        position: 'absolute',
        right: 0,
        width: '24@s',
        height: '24@vs',
        top: '8@vs',
        zIndex: 10,
        tintColor: BackgroundColor.bg_f3916b
    },
    rcBodyRowLeft: {

    },
    contentContainerStyle: {

    },
    rcMenuBox: {
        height: '44@vs',
    },
    rightBorder: {
        borderRightWidth: 1 / pixel,
        borderRightColor: '#e5e5e5',
        borderStyle: 'solid',
    },
    rcMenu: {
        height: '24@vs',
        width: '100%',
    },
    rcHeader: {
        height: '44@vs',
        borderBottomColor: '#e5e5e5',
        borderBottomWidth: 1 / pixel,
        borderStyle: 'solid',
        overflow: 'hidden',
        flexDirection: 'row'
    },
    rcBody: {
        overflow: 'hidden',
        flexDirection: 'column',
        flex: 1,
        paddingHorizontal: '15@ms'
    },
    rcBodyHeader: {
        height: '50@vs',
        justifyContent: 'space-between',
        flexDirection: 'row',
        overflow: 'hidden',
        alignItems: 'center',
    },
    rcBodyRowBut: {
        height: '30@vs',
        borderWidth: 1 / pixel,
        borderStyle: 'solid',
        borderColor: '#808080',
        borderRadius: 2,
        overflow: 'hidden',
        paddingHorizontal: '6@ms'
    },
    rcBodyContent: {
        flex: 1,
    },
    rcBodyRow: {
        height: '40@vs',
        borderBottomColor: '#dcdcdc',
        borderBottomWidth: 1 / pixel,
        borderStyle : 'dashed',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
});

const mapStateToProps = (state, ownProps) => {
    const type = ownProps.navigation.getParam('type');
    const hexId = ownProps.navigation.getParam('hexId');
    let data = state.getIn(['chapterDirectory', type, hexId]);

    if(Immutable.Map.isMap(data)){ data = data.toJS() }
    return { ...ownProps, ...data };
};

export default connect(mapStateToProps,{
    reloadChapterDirectory,
    loadChapterDirectory,
    reloadBookMark,
    loadBookMark,
    updateChapter
})(ChapterDirectory);







