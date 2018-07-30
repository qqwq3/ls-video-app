'use strict';

import React, { Component } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, TouchableWithoutFeedback, Animated } from 'react-native';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import LinearGradient from 'react-native-linear-gradient';
import { Styles, ScaledSheet, Fonts, BackgroundColor, Colors, Img } from "../../common/Style";
import Header from '../../components/Header';
import { mix, arrow, my } from "../../common/Icons";
import Books from '../../components/Books';
import CommentRows from '../../components/CommentRows';
import { width, pixel, infoToast, numberConversion, timestampToTime, loadImage } from "../../common/Tool";
import NovelFlatList from '../../components/NovelFlatList';
import BaseComponent from "../../components/BaseComponent";
import { commonShare, shareAddListener, shareRemoveListener } from "../../common/WxShare";
import DrawerJsx from '../../components/DrawerJsx';
import { updateBookshelf } from '../../actions/LocalAction';
import SharePop from '../../components/SharePop';
import {
    addBookshelf, loadDetails,
    loadDetailSimilar, reloadBookComments,
    likeComments, checkIsAddBookshelf,
    cancelAddBookshelf
} from '../../actions/Details';

type Props = {};

class Details extends BaseComponent<Props> {
    constructor(props) {
        super(props);
        this.state = {
            expanded: true,
            animation: new Animated.Value(),
            MinHeight: 58, // 默认值可改动
            MaxHeight: 0,
            isShow: false,
            commentsMap: new Map(),
            addBookshelfStatus: false
        };
        this.icons = {
            'up': arrow.top,
            'down': arrow.bottom
        };
        this.updateTime = Date.now();
        this.existsTiem = Date.now();
        this.cancelAddTime = Date.now();
        this.cancelSuccessAddTime = Date.now();
    }
    componentDidMount() {
        const { navigation } = this.props;
        const bookHexId = navigation.getParam('hexId');
        const bookId = navigation.getParam('bookId');

        this._refreshCurrentData(bookId, bookHexId, false);
    }
    componentWillReceiveProps(nextProps) {
        super.componentWillReceiveProps(nextProps.user);

        // 确定是加入书架
        if(nextProps.exists && parseInt(nextProps.exists.code) === 0 && nextProps.exists.updateTime > this.existsTiem){
            this.existsTiem = nextProps.exists.updateTime;
            this.setState({addBookshelfStatus: true});
        }

        // 点赞和加入
        if(nextProps.user) {
            if(nextProps.user.addBookshelfTimeUpdated && nextProps.user.addBookshelfTimeUpdated > this.updateTime) {
                this.updateTime = Date.now();
                this.setState({addBookshelfStatus: true});
                return infoToast && infoToast('加入成功');
            }
            else if (nextProps.user.likeTimeUpdated && nextProps.user.likeTimeUpdated > this.updateTime) {
                this.updateTime = Date.now();
                return infoToast && infoToast('点赞成功');
            }
        }

        //  取消收藏
        if(nextProps.cancel){
            const code = nextProps.cancel.code;
            const updateTime = nextProps.cancel.updateTime;
            const status = nextProps.cancel.status;

            if(status && parseInt(code) === 0 && updateTime > this.cancelSuccessAddTime){
                this.cancelSuccessAddTime = updateTime;
                this.setState({addBookshelfStatus: false});
                return infoToast && infoToast('已取消');
            }

            if(nextProps.error && nextProps.error.timeUpdated > this.cancelAddTime){
                const message = nextProps.error.message;
                this.cancelAddTime = nextProps.error.timeUpdated;
                return infoToast && infoToast(message);
            }
        }
    }
    // 返回 - function
    _goBack() {
        const { navigation } = this.props;
        navigation && navigation.goBack();
    }
    // 头部 - demo
    renderHeader() {
        return (
            <Header
                isTitleRight={true}
                title={'书籍详情'}
                isArrow={true}
                goBack={this._goBack.bind(this)}
                titleRightChildren={
                    <TouchableOpacity
                        activeOpacity={0.5}
                        style={[styles.titleRightChildren, Styles.paddingRight15]}
                        onPress={this._share.bind(this)}
                    >
                        <Image source={mix.share} style={[Img.resizeModeContain, styles.titleRightChildrenImage]}/>
                    </TouchableOpacity>
                }
            />
        );
    }
    // 书内容 - demo
    renderBooks() {
        const { detail } = this.props;
        const data = detail ? detail.data : false;

        return (
            <View style={[{backgroundColor: BackgroundColor.bg_fff}]}>
                <View style={[styles.BookMarkBox, Styles.paddingVertical15]}>
                    { data ? <Books source={{uri: data.cover}} clickAble={false} size={'large'}/> : <Books clickAble={false} size={'large'}/> }
                    <View style={[styles.BookMarkMassage]}>
                        <Text
                            style={[styles.BookMarkTitle, Fonts.fontFamily, Fonts.fontSize15, Colors.gray_404040]}
                        >
                            { data ? (data.title || '') : '无名' }
                        </Text>
                        <View style={styles.BookMarkNewView}>
                            <Text
                                style={[Fonts.fontFamily, Fonts.fontSize12, Colors.gray_808080, Styles.marginRight15]}
                            >
                                { data ? (data.categoryName || '') : '无名' }
                            </Text>
                            <Text
                                style={[Fonts.fontFamily, Fonts.fontSize12, Colors.gray_808080]}
                            >
                                { data ? (data.status.text || '') : '' }
                            </Text>
                        </View>
                        <View style={styles.BookMarkNewView}>
                            <Text
                                style={[Fonts.fontFamily, Fonts.fontSize12, Colors.gray_808080, Styles.marginRight15]}
                            >
                                { data ? (data.authorName || '') : '无名' }
                            </Text>
                            <Text
                                style={[Fonts.fontFamily, Fonts.fontSize12, Colors.gray_808080]}
                            >
                                { data ? numberConversion(data.totalWords || 0) : 0 }字
                            </Text>
                        </View>
                        <Text
                            style={[styles.BookMarkNew, Fonts.fontFamily, Fonts.fontSize12, Colors.gray_808080]}
                            numBerOfLines={1}
                        >
                            <Text>{ data ? numberConversion(data.totalLikes || 0) : 0 }次阅读</Text>
                        </Text>
                    </View>
                </View>
            </View>
        );
    }
    // 点赞 - function
    _pointPraiseOnPress(commentsId, likeCount) {
        const { commentsMap } = this.state;
        const { likeComments, navigation } = this.props;
        const login = this.isAuthorized();

        if(!login){
            return infoToast && infoToast('请先登录');
        }

        if (commentsMap.has(commentsId)) {
            infoToast && infoToast('亲，您已经点过赞了');
        }
        else {
            const hexId = navigation.getParam('hexId');
            likeComments && likeComments(hexId, commentsId);
            commentsMap.set(commentsId, parseInt(likeCount) + 1);
        }

        this.setState({ commentsMap });
    }
    // 评论数据渲染 - demo
    renderItemComments({item, index, separators}) {
        const { commentsMap } = this.state;
        const likeCount = commentsMap.has(item.id) ? commentsMap.get(item.id) : item.likeCount;

        return (
            index < 6 &&
            <CommentRows
                userName={item.userName}
                contentText={item.content}
                commentTime={timestampToTime(item.timeCreated, true)}
                pointPraise={likeCount}
                //ImageSource={{uri: loadImage(item.userId)}}
                ImageSource={item.avatar === '' ? my.userDefault : {uri: item.avatar}}
                pointPraiseOnPress={this._pointPraiseOnPress.bind(this, item.id, item.likeCount)}
            />
        );
    }
    // 查看更多 - function
    lookMoreComments() {
        const {navigation} = this.props;
        const hexId = navigation.getParam('hexId');
        const bookId = navigation.getParam('bookId');
        navigation && navigation.navigate('MoreComments', {hexId, bookId});
    }
    // 评论 - demo
    renderComments() {
        const { comments } = this.props;
        const records = comments ? (comments.records || []) : [];
        const totalRecords = comments ? comments.totalRecords : 0;

        return (
            records.length !== 0 ?
                <View style={[styles.comRows, {marginTop: moderateScale(10)}]}>
                    <View style={[styles.boxHeader]}>
                        <View style={[styles.boxBoldDot, {backgroundColor: BackgroundColor.bg_f3916b}]}/>
                        <View style={[Styles.row, Styles.flexCenter]}>
                            <View style={[styles.boxHeaderTitleRows]}>
                                <Text
                                    style={[styles.boxHeaderTitle, Fonts.fontFamily, Fonts.fontSize15, Colors.gray_404040]}>
                                    评论<Text style={[Fonts.fontSize12]}>({ totalRecords })</Text>
                                </Text>
                            </View>
                        </View>
                        {/*<TouchableOpacity*/}
                            {/*activeOpacity={0.5}*/}
                            {/*style={[styles.commentsClick, Styles.paddingRight15]}*/}
                        {/*>*/}
                            {/*<Image source={mix.reviewPen} style={[Img.resizeModeContain, styles.reviewPenImage]}/>*/}
                            {/*<Text style={[Fonts.fontFamily, Fonts.fontSize12, Colors.gray_b2b2b2]}>书写评论</Text>*/}
                        {/*</TouchableOpacity>*/}
                    </View>
                    <NovelFlatList
                        data={records}
                        renderItem={this.renderItemComments.bind(this)}
                        keyExtractor={(item, index) => index + ''}
                        numColumns={1}
                    />
                    {
                        records.length > 6 ?
                            <TouchableOpacity
                                activeOpacity={0.75}
                                style={[styles.moreComments, Styles.flexCenter]}
                                onPress={this.lookMoreComments.bind(this)}
                            >
                                <Text style={[Fonts.fontFamily, Fonts.fontSize14, Colors.orange_f3916b]}>点击查看更多评论</Text>
                            </TouchableOpacity> : null
                    }
                </View> : null
        );
    }
    // 看过本书人的还在看 - demo
    renderBookViewLink() {
        return (
            <View style={[styles.comRows, {marginVertical: moderateScale(10)}]}>
                <View style={[styles.boxHeader]}>
                    <View style={[styles.boxBoldDot, {backgroundColor: BackgroundColor.bg_f3916b}]}/>
                    <View style={[Styles.row, Styles.flexCenter]}>
                        <View style={[styles.boxHeaderTitleRows]}>
                            <Text
                                style={[styles.boxHeaderTitle, Fonts.fontFamily, Fonts.fontSize15, Colors.gray_404040]}
                            >
                                看过本书人的还在看
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={[Styles.row, {marginTop: moderateScale(12)}]}>
                    { this._similarItem() }
                </View>
            </View>
        );
    }
    // 公共 - 拿去数据 - function
    _refreshCurrentData(bookId, bookHexId, changeId: boolean = false){
        const { MinHeight, animation } = this.state;
        const { loadDetails, loadDetailSimilar, reloadBookComments, login, checkIsAddBookshelf, navigation } = this.props;

        if(changeId){
            navigation.setParams({hexId: bookHexId, bookId: bookId});
        }

        loadDetails && loadDetails(bookHexId);
        loadDetailSimilar && loadDetailSimilar(bookHexId, bookId);
        reloadBookComments && reloadBookComments(bookHexId, bookId, 0);
        animation.setValue(MinHeight);

        // 检测是否加入书架
        if(login){
            checkIsAddBookshelf && checkIsAddBookshelf(bookHexId);
        }
    }
    // 切换猜你喜欢 - function
    _switchSimilar(bookId, bookHexId){
        this._refreshCurrentData(bookId, bookHexId, true);
        this.setState({expanded: true});
    }
    // 看过本书人的还在看 - 单本书 - demo
    _similarItem() {
        const { similar } = this.props;
        const records = similar ? (similar.records || []) : [];
        let results;

        results = records.map((obj, index) => {
            return (
                <TouchableOpacity
                    key={index}
                    activeOpacity={0.5}
                    style={[styles.boxFooterLump]}
                    onPress={this._switchSimilar.bind(this, obj.id, obj.hexId)}
                >
                    <Books source={{uri: loadImage(obj.id)}} clickAble={false} size={'small'}/>
                    <Text
                        style={[styles.boxFooterText, Fonts.fontFamily, Fonts.fontSize12, Colors.gray_4c4c4c]}
                        numberOfLines={1}
                    >
                        { obj.title }
                    </Text>
                </TouchableOpacity>
            );
        });

        return results;
    }
    // 文字折叠 - demo
    renderTextFold() {
        // 箭头方法默认向下
        let icon = this.icons['down'],
            expended = this.state.expanded,
            isShow = this.state.isShow;
        const colorArr = ['rgba(255,255,255,0.55)', 'rgba(255,255,255,1.0)'];

        if (!expended) {
            icon = this.icons['up'];
        }

        const {detail} = this.props;
        const data = detail ? detail.data : false;
        const description =data ? data.description : false;
        const Description = /<br\s*\/?>/gi.test(description) ? description.replace(/<br\s*\/?>/gi,"\r\n") : description;

        return (
            <TouchableWithoutFeedback onPress={() => isShow ? this._toggle() : null}>
                <View style={[styles.box]}>
                    <Animated.View
                        style={
                            [{ height: isShow ? this.state.animation : this.state.MaxHeight},
                            Styles.paddingHorizontal15
                        ]}
                    >
                        <Text onLayout={this._maxHeight.bind(this)}>
                            <Text style={[styles.description, Fonts.fontSize12, Colors.gray_808080]}>
                                { data ? ('\u3000\u3000' + Description) : '暂无描述' }
                            </Text>
                        </Text>
                    </Animated.View>
                    {
                        isShow ?
                        <LinearGradient
                            colors={colorArr}
                            style={[styles.arrow, Styles.marginHorizontal15]}
                        >
                            <Image source={icon} style={[Img.resizeModeContain, styles.arrowIcon]}/>
                        </LinearGradient> : null
                    }
                </View>
            </TouchableWithoutFeedback>
        );
    }
    // 最大的text动画内容 - function
    _maxHeight(e) {
        let MaxHeight = e.nativeEvent.layout.height;
        const {MinHeight} = this.state;

        this.setState({MaxHeight: MaxHeight});
        Number(MaxHeight) >= MinHeight && this.setState({isShow: true});
    }
    // text动画切换 - function
    _toggle() {
        const {expanded, MaxHeight, MinHeight, animation} = this.state;
        this.setState({expanded: !expanded});
        let changeValue = expanded ? MaxHeight : MinHeight;

        Animated.spring(animation, {
            toValue: changeValue,
            friction: 50, //摩擦力 （越小 振幅越大）
            tension: 0, //拉力
        }).start();
    }
    // 目录 - demo
    renderCatalogues() {
        const {detail} = this.props;
        const data = detail ? detail.data : false;

        return (
            <View style={[styles.cataloguesAndUpdatesRow]}>
                <TouchableOpacity
                    style={[styles.newestMes, Styles.paddingHorizontal15]}
                    activeOpacity={0.75}
                    onPress={this.catalog.bind(this, data)}
                >
                    <View style={[styles.newestMesLeft]}>
                        <Image source={mix.detailMenu} style={[Img.resizeModeContain, styles.detailMenuImage]}/>
                        <Text style={[Fonts.fontFamily, Fonts.fontSize12, Colors.gray_4c4c4c]}>目录</Text>
                    </View>
                    <View style={[styles.newestMesRight]} activeOpacity={0.75}>
                        <View style={{flexDirection: 'row'}}>
                            <View style={[styles.newMesRow]}>
                                <Text
                                    style={[Fonts.fontFamily, Fonts.fontSize12, Colors.gray_4c4c4c]}
                                >
                                    共{ data ? data.latestChapter.sourceSiteIndex : 0 }章
                                </Text>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
    // 进入目录 - function
    catalog(item) {
        const hexId = item.hexId;
        const bookId = item.id;
        const title = item.title;
        const { navigation } = this.props;

        navigation && navigation.navigate('ChapterDirectory',{ hexId, bookId, title, type: 'chapter' });
    }
    // 更新 - function
    updateCatalog(item) {
        const { navigation, hashId } = this.props;
        const hexId = item.latestChapter && item.latestChapter.hexId;
        const bookId = item.id;
        const bookHexId = item.hexId;

        // const sourceSiteIndex = item.latestChapter.sourceSiteIndex;
        // const vipChapterIndex = item.vipChapterIndex;
        // const value = parseInt(sourceSiteIndex) >= parseInt(vipChapterIndex) ? '1' : '0';

        navigation && navigation.navigate('Reader',{ hexId, bookId, bookHexId, direct: false});
    }
    // 加入 or 取消 - 书架 -function
    _AddBookshelf() {
        const { navigation, addBookshelf, updateBookshelf, cancelAddBookshelf } = this.props;
        const bookId = navigation.getParam('bookId');
        const hexId = navigation.getParam('hexId');
        const login = this.isAuthorized();

        if(!login){
            return infoToast && infoToast('请先登录');
        }

        if(!this.state.addBookshelfStatus){
            addBookshelf && addBookshelf(hexId, bookId);
        }
        else{
            cancelAddBookshelf && cancelAddBookshelf(hexId);
        }

        updateBookshelf && updateBookshelf(true);
    }
    // 更新 - demo
    renderUpdate() {
        const {detail} = this.props;
        const data = detail ? detail.data : false;

        return (
            <View style={[styles.cataloguesAndUpdatesRow, {backgroundColor: BackgroundColor.bg_fff}]}>
                <TouchableOpacity
                    activeOpacity={0.75}
                    style={[styles.newestMes, Styles.marginHorizontal15, styles.caBorderBottom]}
                    onPress={this.updateCatalog.bind(this, data)}
                >
                    <View style={[styles.newestMesLeft]}>
                        <Image source={mix.detailUpdate} style={[Img.resizeModeContain, styles.detailMenuImage]}/>
                        <Text style={[Fonts.fontFamily, Fonts.fontSize12, Colors.gray_4c4c4c]}>更新</Text>
                    </View>
                    <View style={[styles.newestMesRight]} activeOpacity={0.75}>
                        <View style={{flexDirection: 'row'}}>
                            <View style={[styles.newMesRow]}>
                                <Text
                                    style={[Fonts.fontFamily, Fonts.fontSize12, Colors.orange_f3916b]}>{data ? data.latestChapter.title : '暂无最新章节'}</Text>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
    // 内容 - demo
    renderContent() {
        return (
            <ScrollView showsVerticalScrollIndicator={false} style={[styles.content]}>
                { this.renderBooks() }
                { this.renderTextFold() }
                { this.renderUpdate() }
                { this.renderCatalogues() }
                { this.renderComments() }
                { this.renderBookViewLink() }
            </ScrollView>
        );
    }
    // 按钮组 - demo
    renderButGroup() {
        return (
            <View style={[Styles.row, styles.butGroup]}>
                {/*<TouchableOpacity*/}
                {/*activeOpacity={0.5}*/}
                {/*style={[styles.butRow, Styles.flexCenter]}*/}
                {/*>*/}
                {/*<Text style={[Fonts.fontFamily, Fonts.fontSize16, Colors.orange_f3916b]}>下载</Text>*/}
                {/*</TouchableOpacity>*/}
                <TouchableOpacity
                    activeOpacity={0.5}
                    style={[styles.butRow, Styles.flexCenter, {backgroundColor: BackgroundColor.bg_f3916b}]}
                    onPress={this.immediatelyReader.bind(this)}
                >
                    <Text style={[Fonts.fontFamily, Fonts.fontSize16, Colors.white_FFF]}>立即阅读</Text>
                    {/*<Text style={[Fonts.fontFamily, Fonts.fontSize12, Colors.white_FFF]}>(10书币/章)</Text>*/}
                </TouchableOpacity>
                <TouchableOpacity
                    activeOpacity={0.5}
                    style={[styles.butRow, Styles.flexCenter]}
                    onPress={this._AddBookshelf.bind(this)}
                >
                    {
                        !this.state.addBookshelfStatus ?
                        <Text style={[Fonts.fontFamily, Fonts.fontSize16, Colors.orange_f3916b]}>加入书架</Text> :
                        <Text style={[Fonts.fontFamily, Fonts.fontSize16, Colors.gray_b2b2b2]}>已加入书架</Text>
                    }
                </TouchableOpacity>
            </View>
        );
    }
    // 立即阅读 - function
    immediatelyReader(){
        const { navigation, detail } = this.props;
        const data = detail ? detail.data : false;
        const hexId = data ? data.hexId : '';
        const bookId = data ? data.id : '';
        const bookHexId = hexId;

        // const sourceSiteIndex = data ? data.latestChapter.sourceSiteIndex : 0;
        // const vipChapterIndex = data ? data.vipChapterIndex : 0;
        // const value = parseInt(sourceSiteIndex) >= parseInt(vipChapterIndex) ? '1' : '0';

        navigation && navigation.navigate('Reader',{ hexId, bookId, bookHexId, direct: true});
    }
    // 关闭分享面板 - function
    _sharePanelCancel(){
        this.refs['drawer'] && this.refs['drawer'].closeControlPanel();
    }
    // 分享 - function
    _share(){
        this.refs['drawer'] && this.refs['drawer'].openControlPanel();
    }
    // 分享朋友 - function
    _shareFriends(){
        const shareUrl = global.launchSettings && global.launchSettings.agentData && global.launchSettings.agentData.data &&
            global.launchSettings.agentData.data.shareUrl || 'http://share.lameixisi.cn/share/index.html';
        const agentTag = (global.launchSettings && global.launchSettings.agentTag) || '10';
        const channelID = global.launchSettings && global.launchSettings.channelID;

        shareRemoveListener && shareRemoveListener();
        commonShare && commonShare('friends', channelID, shareUrl, agentTag);
        shareAddListener && shareAddListener();
    }
    // 分享朋友圈 - function
    _shareFriendsCircle(){
        const shareUrl = global.launchSettings && global.launchSettings.agentData && global.launchSettings.agentData.data &&
            global.launchSettings.agentData.data.shareUrl || 'http://share.lameixisi.cn/share/index.html';
        const agentTag = (global.launchSettings && global.launchSettings.agentTag) || '10';
        const channelID = global.launchSettings && global.launchSettings.channelID;

        shareRemoveListener && shareRemoveListener();
        commonShare && commonShare('friendsCircle', channelID, shareUrl, agentTag);
        shareAddListener && shareAddListener();
    }
    render() {
        return (
            <DrawerJsx
                side={'bottom'}
                ref={'drawer'}
                openDrawerOffset={0.8}
                content={
                    <SharePop
                        shareFriends={_ => this._shareFriends()}
                        shareFriendsCircle={_ => this._shareFriendsCircle()}
                        sharePanelCancel={_ => this._sharePanelCancel()}
                    />
                }
            >
                <View style={[Styles.container, {backgroundColor: BackgroundColor.bg_f1f1f1}]}>
                    { this.renderHeader() }
                    { this.renderContent() }
                    { this.renderButGroup() }
                </View>
            </DrawerJsx>
        );
    }
}

const styles = ScaledSheet.create({
    cataloguesAndUpdatesRow: {},
    caBorderBottom: {
        borderBottomWidth: 1 / pixel,
        borderBottomColor: BackgroundColor.bg_e5e5e5,
    },
    newMesRow: {
        flexDirection: 'row',
        marginRight: '5@ms'
    },
    newestMesRight: {
        flex: 1,
        overflow: 'hidden',
        paddingLeft: '10@ms',
        paddingRight: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    newestMes: {
        height: '40@vs',
        backgroundColor: '#ffffff',
        flexDirection: 'row'
    },
    newestMesLeft: {
        marginTop: '10@ms',
        height: '20@vs',
        width: '60@s',
        borderRightWidth: 1 / pixel,
        borderRightColor: BackgroundColor.bg_e5e5e5,
        borderStyle: 'solid',
        paddingLeft: '5@ms',
        paddingRight: '10@ms',
        overflow: 'hidden',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
    },
    detailMenuImage: {
        width: '15@s',
        height: '12@vs',
    },
    description: {
        lineHeight: '18@vs',
    },
    box: {
        backgroundColor: '#ffffff',
        flexDirection: 'column'
    },
    arrowIcon: {
        width: '12@s',
        height: '8@vs'
    },
    arrow: {
        flexDirection: 'row',
        height: '30@vs',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomColor: BackgroundColor.bg_e5e5e5,
        borderStyle: 'solid'
    },
    butGroup: {
        height: '50@vs',
        width: '100%',
        borderTopWidth: 1 / pixel,
        borderTopColor: BackgroundColor.bg_e5e5e5,
        backgroundColor: BackgroundColor.bg_fff,
    },
    butRow: {
        flex: 1,
    },
    boxFooterLump: {
        width: width / 4,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: '10@ms',
    },
    content: {
        position: 'relative'
    },
    boxFooterText: {
        fontWeight: '100',
        marginTop: 10,
        alignSelf: 'center',
        maxWidth: 60
    },
    moreComments: {
        height: '44@vs',
        overflow: 'hidden',
    },
    reviewPenImage: {
        width: '16@s',
        height: '16@vs',
        marginRight: '5@ms'
    },
    commentsClick: {
        height: '35@vs',
        width: '100@s',
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
        alignItems: 'center',
        justifyContent: 'flex-end',
        flexDirection: 'row'
    },
    boxBoldDot: {
        height: '15@vs',
        width: '2@s',
        alignSelf: 'center',
    },
    boxHeaderTitleRows: {
        flexDirection: 'column',
    },
    boxHeaderTitle: {
        alignSelf: 'center',
        marginLeft: '10@ms'
    },
    boxHeader: {
        height: '35@vs',
        overflow: 'hidden',
        flexDirection: 'row',
        position: 'relative',
        width: '100%',
    },
    comRows: {
        backgroundColor: BackgroundColor.bg_fff,
        flexDirection: 'column',
        position: 'relative'
    },
    titleRightChildren: {
        height: '100%',
        width: '100@s',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end'
    },
    titleRightChildrenImage: {
        width: "15@s",
        height: "15@vs",
    },
    BookMarkBox: {
        marginLeft: '15@ms',
        flexDirection: 'row',
    },
    BookMarkMassage: {
        flex: 1,
        marginLeft: '15@ms',
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    BookMarkTitle: {
        flex: 2
    },
    BookMarkNewView: {
        paddingTop: '5@ms',
        flexDirection: 'row'
    },
    BookMarkNew: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'nowrap',
        paddingTop: '5@ms'
    },
});

const mapStateToProps = (state, ownProps) => {
    const bookHex = ownProps.navigation.state.params.hexId;
    let data = state.getIn(['details', bookHex]);
    let userData = state.getIn(['user','userData','baseInfo']);

    if (Immutable.Map.isMap(data)) { data = data.toJS() }
    if (Immutable.Map.isMap(userData)) { userData = userData.toJS() }
    return { ...ownProps, ...data, ...userData }
};

export default connect(mapStateToProps, {
    addBookshelf,
    loadDetails,
    loadDetailSimilar,
    reloadBookComments,
    likeComments,
    checkIsAddBookshelf,
    updateBookshelf,
    cancelAddBookshelf
})(Details);



