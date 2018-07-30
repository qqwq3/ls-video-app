
'use strict';

import React,{ Component } from 'react';
import { View, Text, TouchableOpacity, Image, TouchableWithoutFeedback } from 'react-native';
import Immutable from 'immutable';
// import ImageLoad from 'react-native-image-placeholder';
import Carousel from 'react-native-banner-carousel';
// import AppMetadata from 'react-native-app-metadata';
import { withNavigationFocus } from 'react-navigation';
import { connect } from 'react-redux';
import { moderateScale } from 'react-native-size-matters';
import { Styles, ScaledSheet, Img, Fonts, Colors, BackgroundColor } from "../../common/Style";
import TabBarIcon from '../../components/TabBarIcon';
import { reloadBookshelf, loadBookshelf, singleBookDel, batchBookDel } from "../../actions/Bookshelf";
import Header from '../../components/Header';
import { fontImage, def, bookshelf, tab, agent, mix } from "../../common/Icons";
import Chrysanthemum from '../../components/Chrysanthemum';
import ImageAndFonts from '../../components/ImageAndFonts';
import Books from '../../components/Books';
// import { CHANNEL_KEY } from "../../common/Keys";
// import * as api from '../../common/Api';
import NovelFlatList from '../../components/NovelFlatList';
import { width, loadImage, RefreshState, infoToast } from "../../common/Tool";
import { updateBookshelf } from '../../actions/LocalAction';
import { SubmitApply } from "../../actions/User";

type Props = {
    records: ?Array<any>,
    refreshState: number,
    currentOffset: number,
};

class Bookshelf extends Component<Props>{
    static defaultProps = {
        records: [],
        refreshState: 0,
        currentOffset: 0
    };
    static navigationOptions = {
        tabBarIcon: ({focused}) => (
            <TabBarIcon
                focused={focused}
                defaultIcon={tab.bookshelf.defaultIcon}
                activeIcon={tab.bookshelf.activeIcon}
            />
        ),
        tabBarLabel: '书架',
        header: null
    };
    constructor(props){
        super(props);
        this.state = {
            delMap: new Map(),
            records: [],
        };
        this.deleteTiem = Date.now();
        this.updateTime = Date.now();
        this.bannerArr = [
            {
                cover: require('../../images/banner/banner1.png'),
                title: 'banner1'
            },
            {
                cover: require('../../images/banner/banner2.png'),
                title: 'banner2'
            }
        ];
    }
    componentDidMount() {
        this.onHeaderRefresh && this.onHeaderRefresh(RefreshState.HeaderRefreshing);
    }
    componentWillReceiveProps(nextProps) {
        // 书架删除
        if(nextProps.delete){
            const code = nextProps.delete.code;

            if(parseInt(code) === 0 && nextProps.delete.updateTime > this.deleteTiem){
                this.deleteTiem = nextProps.delete.updateTime;
                infoToast('删除成功');
                this.onHeaderRefresh && this.onHeaderRefresh(RefreshState.HeaderRefreshing);
            }
        }

        // 进入本组件
        if(!this.props.isFocused && nextProps.isFocused){
            // 添加书架成功后返回本节目执行刷新操作
            if(nextProps.addBookshelfStatus && nextProps.addBookshelfStatus.status){
                const { updateBookshelf } = nextProps;

                this.onHeaderRefresh && this.onHeaderRefresh(RefreshState.HeaderRefreshing);
                updateBookshelf && updateBookshelf(false);
            }
        }

        // 离开本组件
        if(this.props.isFocused && !nextProps.isFocused){

        }

        // 代理
        if(nextProps && nextProps.applyAgentTimeUpdated > this.updateTime && nextProps.messageKeys && nextProps.messageKeys === 'bookshelf'){
            this.updateTime = Date.now();
            let applyState = parseInt(nextProps.state);

            if (applyState === 1) {
                const { navigation } = nextProps;
                return navigation && navigation.navigate('AgentHtml',
                    {agent: {loginStatus : nextProps.loginStatus, agentAdminUrl : nextProps.agentAdminUrl}});
            }
            else if (applyState === 2) {
                return infoToast("您的账号出了点问题，请联系客服");
            }
            else if (applyState === 3) {
                return infoToast("申请中，请耐心等待");
            }
            else {
                return infoToast("您还不是代理");
            }
        }
    }
    // 搜索
    _search(){
        const { navigation } = this.props;
        navigation.navigate('SearchEngines');
    }
    // 签到
    _signIn(){
        const { navigation } = this.props;
        navigation.navigate('SignIn');
    }
    // 头部 - demo
    renderHeader(){
        return (
            <Header
                fontImage={fontImage.bookshelf}
                fontImageStyles={styles.fontImageStyles}
                isConfigRightChildren={true}
                demoRightStyles={styles.demoRightStyles}
                childrenRight={
                    <ImageAndFonts
                        secondTextShow={false}
                        number={2}
                        eventOne={this._search.bind(this)}
                        eventTwo={this._signIn.bind(this)}
                    />
                }
            />
        );
    }
    // 申请代理 - router
    _ApplyAgent(index){
        if(index === 0){
            const { navigation } = this.props;
            navigation && navigation.navigate('ApplyAgent');
        }
        if(index===1){
            const { navigation } = this.props;
            navigation && navigation.navigate('ShareBookCurrency');
        }
    }
    renderImageRow(item, index){
        return (
            <TouchableOpacity
                activeOpacity={1}
                key={index}
                style={[styles.bannerBox]}
                onPress={this._ApplyAgent.bind(this,index)}
            >
                {/*<ImageLoad*/}
                    {/*source={item.cover}*/}
                    {/*style={[styles.bannerImage]}*/}
                    {/*customImagePlaceholderDefaultStyle={styles.customImagePlaceholderDefaultStyle}*/}
                    {/*isShowActivity={false}*/}
                    {/*placeholderSource={def.book}*/}
                    {/*backgroundColor={'#FFFFFF'}*/}
                {/*/>*/}
                <Image source={item.cover} style={[styles.bannerImage]}/>
            </TouchableOpacity>
        )
    }
    // banner - demo
    renderBanner(){
        return (
            <View style={[styles.bannerBox]}>
                {
                    (this.bannerArr).length !== 0 ?
                    <Carousel
                        autoplay={true}
                        autoplayTimeout={3000}
                        loop={true}
                        index={0}
                        pageSize={width}
                        pageIndicatorOffset={moderateScale(16)}
                        pageIndicatorStyle={styles.pageIndicatorStyle}
                        activePageIndicatorStyle={styles.activePageIndicatorStyle}
                        pageIndicatorContainerStyle={styles.pageIndicatorContainerStyle}
                    >
                        { this.bannerArr.map((item, index) => this.renderImageRow(item, index)) }
                    </Carousel> :
                    <View style={[styles.bannerBox, Styles.flexCenter]}>
                        <Chrysanthemum/>
                    </View>
                }
            </View>
        );
    }
    // 数据渲染头部 - header - demo
    listHeaderComponent(){
        return this.renderBanner();
    }
    // NovelFlatList 渲染
    renderItemBooks({item, index}){
        const { delMap } = this.state;
        const currentStatus = delMap.get(item.bookIdHex);

        return (
            item.type !== 'custom' ?
            <TouchableWithoutFeedback
                onPress={this._reader.bind(this, item.bookIdHex, item.bookId)}
                onLongPress={this._onLongPress.bind(this, item, index)}
            >
                <View style={styles.CollectBox}>
                    <View style={[styles.CollectSubBox, Styles.paddingHorizontal15, Styles.paddingTop15]}>
                        {
                            (delMap.size !== 0) ?
                            <TouchableOpacity
                                activeOpacity={1}
                                style={[styles.CollectBookSelect, Styles.flexCenter]}
                                onPress={this._cancelDel.bind(this, item, index)}
                            >
                                { currentStatus ? <Image source={bookshelf.select} style={[styles.CollectBookSelectIcon, Img.resizeModeContain]}/> : null }
                            </TouchableOpacity> : null

                        }
                        <View style={[styles.imageBox]}>
                            <Books source={{uri: loadImage(item.bookId)}} clickAble={false}/>
                            <Text
                                style={[
                                    styles.CollectBookTitle,
                                    Fonts.fontFamily,
                                    Fonts.fontSize12,
                                    Colors.gray_4c4c4c,
                                ]}
                                numberOfLines={1}
                            >
                                { item.bookTitle }
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback> :
            <View style={[styles.CollectBox]}>
                <View style={[styles.CollectSubBox, Styles.paddingHorizontal15, {paddingTop: moderateScale(5)}]}>
                    <TouchableOpacity
                        activeOpacity={0.5}
                        style={[styles.addView, Styles.flexCenter]}
                        onPress={this._addBooks.bind(this)}
                    >
                        <Image source={mix.addBook} style={[Img.resizeModeContain, styles.addImage]}/>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
    // 添加书 - function
    _addBooks(){
        const { navigation } = this.props;
        navigation && navigation.navigate('BookCity');
    }
    // 长按删除 - function
    _onLongPress(item, index){
        const bookIdHex = item.bookIdHex;
        const bookType = item.bookType;
        const { delMap } = this.state;

        delMap.set(bookIdHex, bookIdHex + ',' + bookType);
        this.setState({delMap: delMap});
    }
    // 取消删除 - function
    _cancelDel(item, index){
        const bookIdHex = item.bookIdHex;
        const bookType = item.bookType;
        const { delMap } = this.state;

        if(delMap.has(bookIdHex)){
            delMap.delete(bookIdHex);
        }
        else{
            delMap.set(bookIdHex, bookIdHex + ',' + bookType);
        }

        this.setState({delMap: delMap});
    }
    // 头部刷新 - function
    onHeaderRefresh(refreshState){
        const { reloadBookshelf } = this.props;
        reloadBookshelf && reloadBookshelf(0);
    }
    // 底部加载 - function
    onFooterRefresh(refreshState){
        const { currentOffset, loadBookshelf } = this.props;
        loadBookshelf && loadBookshelf(currentOffset);
    }
    // 内容 - demo
    renderContent(){
        const { currentOffset, totalRecords, refreshState, records } = this.props;
        
        if(records && records.length === 0){
            return (
                <View style={[styles.noDataContent]}>
                    { this.renderBanner() }
                    <View style={[{flex: 1}, Styles.flexCenter]}>
                        <Image source={def.noData} style={[Img.resizeModeContain,{marginBottom: moderateScale(20)}]}/>
                        <Text style={[Fonts.fontFamily, Fonts.fontSize16, Colors.gray_b2b2b2]}>
                            快去添加喜欢的书吧！
                        </Text>
                    </View>
                </View>
            );
        }

        return (
            <NovelFlatList
                data={records.concat([{type: 'custom'}])}
                horizontal={false}
                ListHeaderComponent={this.listHeaderComponent.bind(this)}
                renderItem={this.renderItemBooks.bind(this)}
                keyExtractor={(item, index) => index + ''}
                onHeaderRefresh={this.onHeaderRefresh.bind(this)}
                onFooterRefresh={this.onFooterRefresh.bind(this)}
                refreshState={refreshState}
                numColumns={3}
                totalRecords={totalRecords || records.length}
                offset={currentOffset}
                contentContainerStyle={{paddingBottom: moderateScale(15)}}
            />
        );

        return null;
    }
    // 去阅读 - function
    _reader(hexId, bookId){
        const { navigation } = this.props;
        const bookHexId = hexId;

        navigation && navigation.navigate('Reader',{ hexId, bookId, bookHexId, direct: true});
    }
    // 删除操作栏 - demo
    renderDelete(){
        const { delMap } = this.state;

        if(delMap.size === 0){
            return null;
        }

        return (
            <TouchableOpacity
                activeOpacity={0.5}
                style={[styles.delButs]}
                onPress={() => this._deleteBooks(delMap)}
            >
                <Text style={[Fonts.fontFamily, Fonts.fontSize15, styles.delText]}>删除({ delMap.size })</Text>
            </TouchableOpacity>
        );
    }
    // 删除 - 收藏 - function
    _deleteBooks(delMap){
        let bookIds = [], bookTypes = [];
        let bookIdStr = '', bookTypeStr = '';

        for (let value of delMap.values()) {
            bookIds.push(value.split(',')[0]);
            bookTypes.push(value.split(',')[1]);
        }

        if(bookIds.length === 1 && bookTypes.length === 1){
            bookIdStr = bookIds.join('');
            bookTypeStr = bookTypes.join('');
        }
        else{
            bookIdStr = bookIds.join(',');
            bookTypeStr = bookTypes.join(',')
        }
        
        this.setState({delMap: new Map()});
        this.props.batchBookDel && this.props.batchBookDel(bookIdStr, bookTypeStr);
    }
    // 代理入口 - demo
    renderAgent(){
        if(parseInt(this.props.state) === 1){
            return (
                <TouchableOpacity
                    activeOpacity={0.75}
                    style={[styles.agentBox]}
                    onPress={this._agentOnPress.bind(this)}
                >
                    <Image source={agent.floatEntrance} style={[Img.resizeModeContain]}/>
                </TouchableOpacity>
            );
        }

        return null;
    }
    // 去代理界面 - function
    _agentOnPress(){
        this.props.SubmitApply && this.props.SubmitApply('bookshelf');
    }
    render(){
        return (
            <View style={[Styles.container]}>
                { this.renderHeader() }
                { this.renderContent() }
                { this.renderDelete() }
                { this.renderAgent() }
            </View>
        );
    }
}

const styles = ScaledSheet.create({
    agentBox: {
        position: 'absolute',
        zIndex: 100,
        right: 0,
        bottom: '50@vs',
        overflow: 'hidden'
    },
    delView: {
        backgroundColor:'rgba(0,0,0,0.6)',
        width: '75@s',
        height: '95@vs'
    },
    delButs: {
        height: '50@vs',
        left: 0,
        bottom: 0,
        zIndex: 100,
        width: '100%',
        flexDirection: 'row',
        alignItems:'center',
        justifyContent: 'center',
        backgroundColor: BackgroundColor.bg_f3916b,
    },
    delText: {
        color: '#FFF'
    },
    noDataContent:{
        flex: 1,
        position: 'relative',
    },
    contentContainerStyle: {
        paddingBottom: '15@ms',
    },
    addView: {
        width: '75@s',
        height: '95@vs',
        alignSelf: 'center',
        marginTop: "10@ms",
        borderWidth: '0.8@ms',
        borderColor: BackgroundColor.bg_e5e5e5,
        borderRadius: '2@ms'
    },
    addImage: {
        width: '60@s',
    },
    CollectBox: {
        flexDirection: 'column',
        width: width / 3,
    },
    CollectBookSelectIcon: {
        width: '18@s',
        height: '18@vs',
        position: 'absolute',
        right: "3@ms",
        top: "3@ms"
    },
    CollectBookSelect: {
        position: 'absolute',
        right: '6@ms',
        top: '6@ms',
        zIndex: 2000,
        justifyContent: 'center',
        flexDirection: 'row',
        width: '94@s',
        height: '104@vs'
    },
    CollectSubBox: {
        alignSelf: 'center'
    },
    imageBox: {
        maxWidth: '75@ms',
        overflow: 'hidden'
    },
    CollectBookTitle: {
        fontWeight: '100',
        textAlign: 'center',
        marginTop: '10@ms',
    },
    content: {
        paddingTop: '5@ms',
        flex: 1,
        position: 'relative',
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    customImagePlaceholderDefaultStyle: {
        width: '80@s'
    },
    pageIndicatorStyle: {
        width: '8@s',
        height: '8@vs',
        borderRadius: '8@ms',
        marginHorizontal: '4@ms',
        backgroundColor: 'rgba(255,255,255,0.4)'
    },
    bannerImage: {
        width: '100%',
        height: '140@vs',
    },
    activePageIndicatorStyle: {
        position: 'absolute',
        backgroundColor: '#f3916b',
    },
    pageIndicatorContainerStyle: {
        position: 'absolute',
        alignSelf: 'center',
        flexDirection: 'row',
        bottom: '10@ms'
    },
    bannerBox: {
        height: '140@vs',
        width: '100%',
    },
    fontImageStyles: {
        width: '40@s',
        height: '24@vs'
    },
    demoRightStyles: {
        flex: 1,
        justifyContent: 'flex-end',
    }
});

const mapStateToProps = (state, ownProps) => {
    let data = state.getIn(['bookshelf','main']);
    let addBookshelfStatus = state.getIn(['local','bookshelf']);
    let agentInfo = state.getIn(['user','userData','applyAgent']);

    if(Immutable.Map.isMap(agentInfo)){ agentInfo = agentInfo.toJS() }
    if(Immutable.Map.isMap(data)){ data = data.toJS() }
    if(Immutable.Map.isMap(addBookshelfStatus)){ addBookshelfStatus = addBookshelfStatus.toJS() }

    return { ...ownProps, ...data, addBookshelfStatus, ...agentInfo };
};

export default withNavigationFocus(connect(mapStateToProps,{
    reloadBookshelf,
    loadBookshelf,
    singleBookDel,
    batchBookDel,
    updateBookshelf,
    SubmitApply
})(Bookshelf));





