
'use strict';

import React, { Component } from 'react';
import {
    View, Text, TouchableOpacity,
    Image, Animated, Modal,
    TextInput, Keyboard, ScrollView,
    Alert, ActivityIndicator,
    Platform, StatusBar, InteractionManager,
    FlatList, PanResponder
} from 'react-native';
import { connect } from 'react-redux';
import Immutable from 'immutable';
import _ from 'loadsh';
import moment from 'moment';
import accounting from 'accounting';
import Toast from 'react-native-root-toast';
import GestureRecognizer from 'react-native-swipe-gestures';
import * as DeviceInfo from 'react-native-device-info';
import { withNavigationFocus } from 'react-navigation';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { Styles, ScaledSheet, BackgroundColor, Fonts, Colors, Img } from "../../common/Style";
import { arrow, readerImg, mix, other, bookshelf } from "../../common/Icons";
import { getChapter, addComments } from '../../actions/Reader';
import { commonShare, shareAddListener, shareRemoveListener } from "../../common/WxShare";
import DrawerJsx from '../../components/DrawerJsx';
import BaseComponent from "../../components/BaseComponent";
import SharePop from '../../components/SharePop';
import Chrysanthemum from "../../components/Chrysanthemum";
import { updateChapter } from '../../actions/LocalAction';
import StatusBarSet from '../../components/StatusBarSet';
import { commonSave, commonLoad } from "../../common/Storage";
import {
    width, height, AnimatedTiming,
    infoToast, setStatusBar,
    contentFormat, isInArray,
    timestampToTime, compareDate,
    setAppBrightness
} from "../../common/Tool";

type Props = {};

type State = {};

class Reader extends BaseComponent<Props, State>{
    constructor(props){
        super(props);
        this.state = {
            controlStatus: false,
            controlName: '',
            visible: false,
            focusStatus: true,

            content: [],
            title: '',
            currentPage: 0,
            nextPage: null,
            prevPage: null,
            chaptersCount: 0,

            nextPageCache: null,
            prevPageCache: null,

            nextPageStatus: false,
            currentChapterHexId: '',

            sourceSiteIndex: 0,
            statusBarControl: false,

            prevStatus: true,
            nextStatus: true,
            comMap: new Map(),

            // 设置系列 - 默认设置
            fontSize: moderateScale(16),
            fontSColor: '#604733',
            fontLineHeight: moderateScale(30),
            bookTitle: '',
            readerPaperBg: ['#EBDBC1','#FFFFFF','#9bdbd3'],
            readerThemeIndex: 1,
            plateTypeIndex: 0,
            readerModelValue: false,
            readerModelText: '日间模式',
            readerModelIcon: readerImg.sun,

            contentStatus: true,
            buySelectStatus: true,

            isVip: false,
            vipChapterIndex: 0,

            forward: false,

            statusBarHidden: true,
            statusBarBackgroundColor: BackgroundColor.bg_fff,
            barStyle: 'dark-content',
        };
        this.commentsText = '';
        this.animateds = {
            header: {
                top: new Animated.Value(0),
            },
            footer: {
                bottom: new Animated.Value(0),
                fontSetBottom: new Animated.Value(0),
            },
        };
        this.readerMenu = {
            footer: [
                { text: '章节目录', icon: readerImg.chapter },
                { text: '设置', icon: readerImg.textSize },
                { text: this.state.readerModelText, icon: this.state.readerModelIcon },
                { text: '书写评论', icon: readerImg.pencil },
            ],
        };
        this.toastConfig = { duration: 3000, position: Toast.positions.CENTER };
        this.gestureConfig = {
            velocityThreshold: 0.1,
            directionalOffsetThreshold: 80
        };
        this.timeUpdate = Date.now();
        this.count = 0 ;          // 偏移量临界值
        this.pageArr = []; // 所有章节页数
        this.pages = 0;
        this.errorTimeUpdated = Date.now();
        this.batteryLevel = 0; // 设备电量值
        this.rightSlideValue = 0;
    }
    async componentWillMount() {
        // vip
        this._vip();

        // 字体设置
        this._fontSet();

        // 主题设置
        this._themeSet();

        // 拿到设备电池量
        this._getDeviceBatteryLevel();

        // 阅读模式
        this._modeAutoChange();
    }
    componentDidMount() {
        // 初始动画设置
        this.animateds.header.top.setValue(verticalScale(-58));
        this.animateds.footer.bottom.setValue(verticalScale(-65));
        this.animateds.footer.fontSetBottom.setValue(verticalScale(-190.67));

        // 软键盘监听
        // this._keyboardHide = Keyboard.addListener('keyboardDidHide',this._keyboardDidHideHandler.bind(this));

        // 初始获取章节数据
        this.commonFetchData(this.props);
    }
    componentWillReceiveProps(nextProps) {
        super.componentWillReceiveProps(nextProps);

        // 进入本组件
        if(!this.props.isFocused && nextProps.isFocused){
            if(nextProps.chapterChange && nextProps.chapterChange.status){
                this.commonFetchData(nextProps);
                this.props.updateChapter && this.props.updateChapter(false);
            }
        }

        // 有错
        if(nextProps.error && nextProps.error.timeUpdated > this.errorTimeUpdated){
            this.errorTimeUpdated = nextProps.error.timeUpdated;
            this.setState({sourceSiteIndex: 1});
        }

        // 章节相关数据处理
        if(nextProps.article && this.timeUpdate < nextProps.articleTimeUpdated){

            console.log('reader-componentWillReceiveProps', nextProps);

            this.timeUpdate = nextProps.articleTimeUpdated;
            this._chapterDataProcessing(nextProps);
        }

        // 评论成功后处理
        // if(nextProps.comments && this.timeUpdate < nextProps.commentsTimeUpdated){
        //     this.timeUpdate = Date.now();
        //     infoToast && infoToast("评论成功");
        // }
    }
    componentWillUnmount() {
        // this._keyboardHide && this._keyboardHide.remove();
        setStatusBar && setStatusBar(BackgroundColor.bg_fff, true, 'dark-content');
        //setStatusBarHidden && setStatusBarHidden(false);
        this.setState({statusBarControl: false});
    }
    // 字体设置 - 本地缓存 - function
    async _fontSet(){
        let font = await commonLoad('fontSet');
        let plate = await commonLoad('plateSet');

        if(plate){
            this.setState({
                fontLineHeight: plate.fontLineHeight,
                plateTypeIndex: plate.plateTypeIndex,
            });
        }

        if(font){
            this.setState({
                fontSize: font.fontSize,
            });
        }
    }
    // 主题设置 - 本地缓存 - function
    async _themeSet(){
        let theme = await commonLoad('themeSet');

        if(theme){
            this.setState({readerThemeIndex: theme.readerThemeIndex});
        }
    }
    // 设置日间或者夜间模式 - function
    async _modeAutoChange(){
        let mode = await commonLoad('modeChange');

        if(mode){
            // 模式初始设置
            this.setState({
                readerModelValue: mode.value,
                readerModelText : mode.value ? '夜间模式' : '日间模式',
                readerModelIcon : mode.value ? readerImg.moon : readerImg.sun,
                // readerThemeIndex: mode.value ? 0 : 1,
            });
        }
    }
    // 章节相关数据处理 - function
    _chapterDataProcessing(nextProps){
        const chapter = nextProps.article.chapter;
        const book = nextProps.article.book;
        const bookTitle = book && book.title;
        const content = nextProps.article.content;
        const chaptersCount = nextProps.article.chaptersCount;
        const sourceSiteIndex = chapter && chapter.sourceSiteIndex;
        const title = chapter && chapter.title;
        const { fontSize, fontLineHeight } = this.state;

        let obj = this._formatChapter(content, sourceSiteIndex, title, fontSize, fontLineHeight);

        if(obj.length === 0 && chapter.result){
            obj.push({
                content: [chapter.result.text || '本章节无内容'],
                title: title,
                num: sourceSiteIndex,
                index: 0,
                length: 0,
                result: chapter.result,
            });
        }

        this.pages = this.pages + obj.length;

        if(obj.length !== 1){
            this.count = (this.pages - 1) * width;
        }
        else{
            this.count = width;
        }

        // if(!this.state.forward){
        //     this.setState({
        //         content: this.state.content.concat(obj),
        //         // nextPageCache: chapter.turnPage.next,
        //     });
        // }
        // else{
        //     this.setState({
        //         content: obj.concat(this.state.content),
        //         // prevPageCache: chapter.turnPage.prev,
        //     });
        //     this.refs['flatListRef'] && this.refs['flatListRef'].scrollToOffset({animated: false, offset: (obj.length) * width });
        // }

        this.setState({
            content: this.state.content.concat(obj),
            sourceSiteIndex: sourceSiteIndex,
            chaptersCount: chaptersCount,
            prevPage: chapter && chapter.turnPage.prev,
            nextPage: chapter && chapter.turnPage.next,
            bookTitle: bookTitle,
            title: chapter && chapter.title,
            vipChapterIndex: book && book.vipChapterIndex,
            currentChapterHexId: chapter && chapter.hexId,
        });
    }
    // vip - function
    _vip(){
        const { vipExpire } = this.props;
        let endVipTime;
        let currentTime = moment().format('YYYY-MM-DD');

        if(vipExpire){
            endVipTime = timestampToTime && timestampToTime(vipExpire);

            // vip 过期
            if(compareDate && compareDate(currentTime, endVipTime)){
                this.setState({isVip: false});
            }
            // 还是 vip
            else{
                this.setState({isVip: true});
            }
        }
    }
    // 拿到设备电池量 - function
    _getDeviceBatteryLevel(){
        DeviceInfo.getBatteryLevel().then(batteryLevel => {
            this.batteryLevel = batteryLevel;
        });
    }
    // 章节处理 - function
    _formatChapter(content, num, title, fontSize, fontLineHeight){
        let _arr = [];
        let array = contentFormat(content, fontSize, fontLineHeight);

        array.forEach(function (element, index) {
            let _chapterInfo = {
                title: title,
                num: num,
                content: element,
                index: index + 1,
                length: array.length,
                result: null,
            };
            _arr.push(_chapterInfo);
        });

        return _arr;
    }
    // 公共获取章节数据 - function
    async commonFetchData(props){
        const { getChapter, navigation } = props;
        const hexId = navigation.getParam('hexId');
        const bookId = navigation.getParam('bookId');
        const direct = navigation.getParam('direct');
        // const value = navigation.getParam('value') || '0';
        const bookHexId = navigation.getParam('bookHexId');

        // 购买选择
        let buy = await commonLoad(bookHexId);
        let val = await this._chapterAutoDeductions();
        // let condition = isInArray(this.pageArr, 1);

        //if(!condition){
            this.setState({
                content: [],
                sourceSiteIndex: 0,
                chaptersCount: 0,
                prevPage: null,
                nextPage: null,
                buySelectStatus: buy ? buy.buySelectStatus : true,
            });

            this.pageArr = [];
            this.count = 0;
            this.pages = 0;
        //}

        // 直接或继续阅读
        if(direct){
            getChapter && getChapter(hexId, false, val, bookHexId);
        }
        // 跳章节阅读
        else{
            getChapter && getChapter(hexId, bookId, val, bookHexId);
        }
    }
    // 获取收费章节 - function
    _fetchChapterData(val){
        const { article, getChapter } = this.props;
        const book = article ? article.book : false;
        const chapter = article ? article.chapter : false;
        const bookHexId = book ? book.hexId : '';
        const bookId = book ? book.id : '';
        const currentChapterHexId = chapter ? chapter.hexId : '';

        getChapter && getChapter(currentChapterHexId, bookId, val, bookHexId);
    }
    // 关闭评论监听 - function
    _keyboardDidHideHandler(){
        this.commentsPanelClose();
    }
    // 输入框控制 - function
    textInputOperate(){
        this._textInput && this._textInput.blur();
        this._textInput && this._textInput.clear();
    }
    // 阅读设置 - function
    readerSetting(){
        // 关闭字体面板
        if(this.state.controlName === 'font'){
            return this.fontSetAnimateClose();
        }

        // 关闭动画
        if(this.state.controlStatus) this.setAnimateClose();

        // 打开动画
        if(!this.state.controlStatus) this.setAnimateOpen();

        this.setState({controlStatus: !this.state.controlStatus});
    }
    // 打开设置 - 动画 - function
    setAnimateOpen(){
        Animated.parallel([
            AnimatedTiming(this.animateds.header.top, 0),
            AnimatedTiming(this.animateds.footer.bottom, 0)
        ]).start(() => {
            this.setState({
                barStyle: 'light-content',
                statusBarHidden: false,
                statusBarBackgroundColor: BackgroundColor.bg_000000_7,
            });
        });
    }
    // 关闭设置 - 动画 - function
    setAnimateClose(){
        Animated.parallel([
            AnimatedTiming(this.animateds.header.top, verticalScale(-58)),
            AnimatedTiming(this.animateds.footer.bottom, verticalScale(-65))
        ]).start(() => {
            this.setState({
                barStyle: 'dark-content',
                statusBarHidden: true,
                statusBarBackgroundColor: BackgroundColor.bg_fff,
            });
        });
    }
    // 打开字体设置 - 动画 - function
    fontSetAnimateOpen(){
        this.setState({controlName: 'font'});
        Animated.parallel([AnimatedTiming(this.animateds.footer.fontSetBottom, 0)]).start();
    }
    // 关闭字体设置 - 动画 - function
    fontSetAnimateClose(){
        this.setState({controlName: ''});
        Animated.parallel([AnimatedTiming(this.animateds.footer.fontSetBottom, verticalScale(-190.67))]).start();
    }
    // 去购买 - function
    async _goBuy(){
        const { navigation } = this.props;
        const bookHexId = navigation.getParam('bookHexId');

        this._fetchChapterData('1');
        this._chapterArrContent();

        commonSave && commonSave(bookHexId, { buySelectStatus: this.state.buySelectStatus });
    }
    // 章节数组内容公共 - function
    _chapterArrContent(){
        let arr = [];

        (this.state.content).map((item, index) => {
            if(item.result === null){
                arr.push(item);
            }
        });

        this.setState({content: arr});
        _.remove(this.pageArr, function(n) {return n === 1});
    }
    // 章节是否自动扣费 - function
    async _chapterAutoDeductions(){
        const { navigation } = this.props;
        const bookHexId = navigation.getParam('bookHexId');

        // 购买选择
        let buy = await commonLoad(bookHexId);
        let val = '1';

        // 是vip
        if(this.state.isVip){
            val = '1';
        }
        // 非vip
        else{
            if(buy){
                val = buy.buySelectStatus ? '1' : '0';
            }
        }

        return val;
    }
    // 去充值 - function
    _recharge(){
        const { navigation } = this.props;
        navigation && navigation.navigate('Charge');
    }
    // 自动购买章节选择 - function
    _autoBuyChapter(){
        const { navigation } = this.props;
        const bookHexId = navigation.getParam('bookHexId');

        this.setState({buySelectStatus: !this.state.buySelectStatus});
        commonSave && commonSave(bookHexId, {buySelectStatus: !this.state.buySelectStatus});
    }
    // 获取下一章数据 - function
    async _getNextChapterData(){
        const { nextPage } = this.state;
        const { navigation, getChapter } = this.props;
        const bookHexId = navigation.getParam('bookHexId');
        let val = await this._chapterAutoDeductions();

        if(nextPage === null){
            return infoToast && infoToast('已是最后一章');
        }

        const currentChapterHexId = nextPage.hexId;
        const bookId = nextPage.bookId;

        getChapter && getChapter(currentChapterHexId, bookId, val, bookHexId);
    }
    // 立即阅读下一章 - function
    _immediatelyReaderNextChapter(){
        this._getNextChapterData();
        this._chapterArrContent();
    }
    // 免费领取书币 - function
    _freeBookMoney(){
        const { navigation } = this.props;
        navigation && navigation.navigate('ShareBookCurrency');
    }
    // 获取书币方式 - demo
    renderRequestBalance(result){
        const { article } = this.props;
        const chapter = article ? article.chapter : false;
        const balance = chapter ? chapter.balance : null;
        const isLogin = this.isAuthorized();

        // 1.提示需要扣费
        // if(parseInt(result.value) === 100){}

        // 2.余额不足
        // if(balance !== null && parseInt(balance.balance) < parseInt(balance.chapterAmount)){}

        // 3.无数据
        // if(parseInt(result.value) === 13){}

        return (
            <View style={[styles.buckleContent, Styles.flexCenter]}>
                {
                    isLogin ?
                    <View>
                        {
                            parseInt(result.value) !== 13 &&
                            <View style={[styles.buckleTitle, Styles.flexCenter]}>
                                <Text style={[Fonts.fontFamily, Fonts.fontSize16, {color: this.state.fontSColor}]}>需要购买后阅读</Text>
                                <Text style={[Fonts.fontFamily, Fonts.fontSize16, {color: this.state.fontSColor}]}>感谢对正版阅读的支持</Text>
                            </View>
                        }
                        <View style={[styles.buckleButs, Styles.flexCenter]}>
                            {
                                parseInt(result.value) === 13 &&
                                <View>
                                    <View style={[Styles.flexCenter]}>
                                        <Text style={[Fonts.fontFamily, Fonts.fontSize16, Colors.gray_404040]}>本章节暂无数据内容</Text>
                                    </View>
                                    <TouchableOpacity
                                        activeOpacity={0.75}
                                        style={[styles.buckleBut,Styles.flexCenter,{backgroundColor: BackgroundColor.bg_f3916b, marginTop: moderateScale(40)}]}
                                        onPress={this._immediatelyReaderNextChapter.bind(this)}
                                    >
                                        <Text style={[Fonts.fontFamily, Fonts.fontSize16, Colors.white_FFF]}>立即阅读下一章</Text>
                                    </TouchableOpacity>
                                </View>
                            }
                            {
                                parseInt(result.value) !== 13 &&
                                <Text style={[Fonts.fontFamily, Fonts.fontSize14, Colors.gray_404040]}>
                                    价格： <Text style={[Colors.orange_f3916b]}>{ balance ? balance.chapterAmount : 0 }</Text>书币
                                    余额：<Text style={[Colors.orange_f3916b]}>{ balance ? balance.balance : 0 }</Text>书币
                                </Text>
                            }
                            {
                                parseInt(result.value) === 100 &&
                                <TouchableOpacity
                                    activeOpacity={0.75}
                                    style={[styles.buckleBut,Styles.flexCenter,{backgroundColor: BackgroundColor.bg_f3916b, marginTop: moderateScale(25)}]}
                                    onPress={this._goBuy.bind(this)}
                                >
                                    <Text style={[Fonts.fontFamily, Fonts.fontSize16, Colors.white_FFF]}>购买</Text>
                                </TouchableOpacity>
                            }
                            {
                                (balance !== null && parseInt(balance.balance) < parseInt(balance.chapterAmount)) &&
                                <TouchableOpacity
                                    activeOpacity={0.75}
                                    style={[styles.buckleBut,Styles.flexCenter,{backgroundColor: BackgroundColor.bg_f3916b, marginTop: moderateScale(25)}]}
                                    onPress={this._recharge.bind(this)}
                                >
                                    <Text style={[Fonts.fontFamily, Fonts.fontSize16, Colors.white_FFF]}>充值</Text>
                                </TouchableOpacity>
                            }
                            <TouchableOpacity
                                activeOpacity={0.75}
                                style={[styles.buckleBut,Styles.flexCenter, {marginTop: moderateScale(25)}]}
                                onPress={this._freeBookMoney.bind(this)}
                            >
                                <Text style={[Fonts.fontFamily, Fonts.fontSize16, Colors.orange_f3916b]}>免费领取书币</Text>
                            </TouchableOpacity>
                            {
                                parseInt(result.value) === 100 &&
                                <TouchableOpacity
                                    activeOpacity={0.5}
                                    style={[styles.gmBox, Styles.flexCenter]}
                                    onPress={this._autoBuyChapter.bind(this)}
                                >
                                    {
                                        this.state.buySelectStatus ?
                                            <Image
                                                source={bookshelf.select}
                                                style={[styles.CollectBookSelectIcon, Img.resizeModeContain, {marginRight: moderateScale(4)}]}
                                            /> :
                                            <View style={[styles.selectCyc, {marginRight: moderateScale(4)}]}/>
                                    }
                                    <Text style={[Fonts.fontFamily, Fonts.fontSize14, {color: '#ccc'}]}>自动购买收费章节</Text>
                                </TouchableOpacity>
                            }
                        </View>
                    </View> :
                    <View>
                        <View style={[styles.buckleTitle, Styles.flexCenter]}>
                            <Text
                                style={[Fonts.fontFamily, Fonts.fontSize16, {color: this.state.fontSColor}]}
                            >
                                本章节需要登录后才能观看哦
                            </Text>
                        </View>
                        <TouchableOpacity
                            activeOpacity={0.75}
                            style={[styles.buckleBut,Styles.flexCenter,{backgroundColor: BackgroundColor.bg_f3916b, marginTop: moderateScale(40)}]}
                            onPress={this._loginPage.bind(this)}
                        >
                            <Text style={[Fonts.fontFamily, Fonts.fontSize16, Colors.white_FFF]}>立即登录</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={0.75}
                            style={[styles.buckleBut,Styles.flexCenter,{backgroundColor: BackgroundColor.bg_f3916b, marginTop: moderateScale(30)}]}
                            onPress={this._goBack.bind(this)}
                        >
                            <Text style={[Fonts.fontFamily, Fonts.fontSize16, Colors.white_FFF]}>下次登录</Text>
                        </TouchableOpacity>
                    </View>
                }
            </View>
        );
    }
    // 进入登录 - function
    _loginPage(){
        const { navigation } = this.props;
        navigation && navigation.navigate('Login');
    }
    // 滚动 - function
    handleScroll(e){
        const { getChapter, navigation } = this.props;
        const bookId = navigation.getParam('bookId');
        const bookHexId = navigation.getParam('bookHexId');

        // const vipChapterIndex = (article && article.book && article.book.vipChapterIndex) || 0;
        // const sourceSiteIndex = (article && article.chapter && article.chapter.sourceSiteIndex) || 0;
        // const confirmPay = parseInt(sourceSiteIndex) > parseInt(vipChapterIndex) ? '1' : '0';

        let val = this.state.buySelectStatus ? '1' : '0';
        let x = e.nativeEvent.contentOffset.x;

        if(this.count === 0){
            this.count = (this.pages - 1) * width;
        }

        // 重新获取电池电量
        this._getDeviceBatteryLevel();

        console.log('handleScroll', x, this.count);

        // 获取到下一章数据
        if(x >= this.count){
            this.count += (this.pages - 1) * width;

            this.setState({forward: false});

            if(this.state.nextPage !== null){
                const nextHexId = this.state.nextPage.hexId;
                getChapter && getChapter(nextHexId, bookId, val, bookHexId);
            }
            else{
                infoToast && infoToast('已是最后一页', this.toastConfig);
            }
        }

        // 获取上一章数据
        if(x === 0){

            this.setState({forward: true});

            // 获取上一页数据
            if(this.state.prevPage !== null){
                const prevHexId = this.state.prevPage.hexId;
                getChapter && getChapter(prevHexId, bookId, val, bookHexId);
            }
            else{
                infoToast && infoToast('已是第一页', this.toastConfig);
            }
        }
    }
    // 阅读 - demo
    renderReaderFlatList(){
        const { sourceSiteIndex, vipChapterIndex, content } = this.state;
        const isLogin = this.isAuthorized();

        if(content.length === 0){
            if(!isLogin && parseInt(sourceSiteIndex) !== 0 && parseInt(sourceSiteIndex) >= parseInt(vipChapterIndex)){
                return this.renderRequestBalance();
            }

            return (
                <View style={[Styles.flexCenter, Styles.flex1, {width: width}]}>
                    <Chrysanthemum/>
                </View>
            );
        }

        return (
            <FlatList
                ref={'flatListRef'}
                data={content}
                horizontal={true}
                pagingEnabled={true}
                keyExtractor={(item, index) => index + ''}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                renderItem={this.renderReaderRow.bind(this)}
                onScroll={(e) => this.handleScroll(e)}
                keyboardDismissMode={'on-drag'}
                onScrollEndDrag={this._onScrollEndDrag.bind(this)}
            />
        );

    }
    // 拖拽结束 - function
    _onScrollEndDrag(e){
        // const { getChapter, navigation } = this.props;
        // let x = e.nativeEvent.contentOffset.x;
        // const bookId = navigation.getParam('bookId');
        // const bookHexId = navigation.getParam('bookHexId');
        // let val = this.state.buySelectStatus ? '1' : '0';
        //
        // if(x === 0 && !this.state.forward){
        //     this.setState({forward: true});
        //
        //     // 获取上一页数据
        //     if(this.state.prevPage !== null){
        //         const prevHexId = this.state.prevPage.hexId;
        //         getChapter && getChapter(prevHexId, bookId, val, bookHexId);
        //     }
        //     else{
        //         infoToast && infoToast('已是第一页', this.toastConfig);
        //     }
        // }
    }
    // 阅读渲染 - demo
    renderReaderRow({item}){
        const { article } = this.props;
        const comFontStyles = [Fonts.fontFamily, Fonts.fontSize14, Colors.gray_808080];
        const chaptersCount = article ? article.chaptersCount : 0;
        const time = moment().format("HH:MM");
        const { fontLineHeight, fontSize, fontSColor } = this.state;
        const batteryLevelWidth: number = this.batteryLevel * moderateScale(17);
        const batteryLevelPercentage = accounting.toFixed(Number((this.batteryLevel * 100)), 0);
        // const commonColor = batteryLevelPercentage <= moderateScale(10) ? 'red' : '#66CC99';
        const commonColor = batteryLevelPercentage <= moderateScale(10) ? 'red' : '#999999';

        return (
            <View style={[Styles.row,{zIndex: 10}]}>
                <TouchableOpacity
                    activeOpacity={1}
                    style={[{height: height, width: width}]}
                    onPress={this.readerSetting.bind(this)}
                >
                    <View style={[{flex: 1, justifyContent: 'space-between'}]}>
                        <View style={[styles.readerRow, Styles.paddingHorizontal15]}>
                            <Text style={comFontStyles}>{ item.title || '' }</Text>
                            <View style={[Styles.row]}>
                                <Text style={comFontStyles}>{ time }</Text>
                                <View style={[styles.batteryLevelBox, {marginTop: moderateScale(6)}]}>
                                    <View style={[styles.batteryLevelInner, {borderColor: commonColor}]}>
                                        <View style={[styles.batteryLevel, {width: batteryLevelWidth, backgroundColor: commonColor}]}/>
                                    </View>
                                    <View style={[styles.batterHeader, {backgroundColor: commonColor, marginTop: moderateScale(-2)}]}/>
                                </View>
                            </View>
                        </View>
                        <View style={{flex: 1,alignSelf:'center'}}>
                            {
                                item.result !== null ? this.renderRequestBalance(item.result) :
                                    (item.content || []).map((value, index) => {
                                        return (
                                            <Text
                                                key={index}
                                                style={[Fonts.fontFamily,{color: fontSColor, fontSize: fontSize, lineHeight: fontLineHeight}]}
                                            >
                                                { value }
                                            </Text>
                                        )
                                    })
                            }
                        </View>
                        <View style={[styles.readerRow, Styles.paddingHorizontal15]}>
                            <Text style={comFontStyles}>{ item.index } / { item.length }</Text>
                            <Text style={comFontStyles}>{ item.num } / { chaptersCount }</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
    // 阅读内容 - demo
    renderReaderContent(){
        // return (
        //     <GestureRecognizer
        //         style={[styles.readerContainer]}
        //         // onSwipeLeft={(state) => this.onSwipeLeft(state)}
        //         onSwipeRight={(state) => this.onSwipeRight(state)}
        //         config={this.gestureConfig}
        //     >
        //         { this.renderReaderFlatList() }
        //     </GestureRecognizer>
        // );

        return (
            <View style={[styles.readerContainer]}>
                { this.renderReaderFlatList() }
            </View>
        );
    }
    onSwipeLeft(gestureState) {
        console.log('向左滑动',gestureState);
    }
    onSwipeRight(gestureState) {

        //if(this.count === 0){
            console.log('向右滑动',gestureState);
        //}
    }
    // 返回 - function
    _goBack(){
        const { navigation } = this.props;
        navigation && navigation.goBack();
    }
    // 头部 - demo
    renderHeader(){
        const animatedTopValue = this.animateds.header.top;

        return (
            <Animated.View style={[styles.readerHeaderSetBar,{backgroundColor: BackgroundColor.bg_000000_7, top: animatedTopValue}]}>
                <TouchableOpacity
                    activeOpacity={1}
                    style={[styles.readerHeaderReturn, Styles.paddingLeft15]}
                    onPress={this._goBack.bind(this)}
                >
                    <Image
                        source={arrow.left}
                        tintColor={BackgroundColor.bg_fff}
                        style={styles.arrowImage}
                        resizeMode={'contain'}
                    />
                </TouchableOpacity>
                <View style={[Styles.flexCenter, Styles.flex1]}>
                    <Text style={[Fonts.fontFamily, Fonts.fontSize16, Colors.white_FFF]}>《{ this.state.bookTitle }》</Text>
                </View>
                <TouchableOpacity
                    style={styles.readerHeaderRmb}
                    activeOpacity={1}
                    onPress={this._share.bind(this)}
                >
                    <Image
                        source={mix.share}
                        tintColor={'#FFFFFF'}
                        style={[Img.resizeModeContain, styles.titleRightChildrenImage]}
                    />
                </TouchableOpacity>
            </Animated.View>
        );
    }
    // 底部 - demo
    renderFooterNav(){
        const animatedBottomValue = this.animateds.footer.bottom;

        return (
            <Animated.View style={[styles.readerFooterSetBar,{backgroundColor: BackgroundColor.bg_000000_7, bottom: animatedBottomValue}]}>
                { this.readerMenu.footer.map((item, index) => this.renderItemFooterMenu(item, index)) }
            </Animated.View>
        );
    }
    // 底部导航渲染 - demo
    renderItemFooterMenu(item, index){
        return (
            <TouchableOpacity
                key={index}
                activeOpacity={1}
                style={[styles.readerFooterSetBox, Styles.flexCenter]}
                onPress={this.footerMenuOnPress.bind(this, index)}
            >
                <Image
                    source={index === 2 ? this.state.readerModelIcon : item.icon}
                    tintColor={'#FFF'}
                    style={[styles.readerFooterImage, Img.resizeModeContain]}
                />
                <Text style={[Fonts.fontFamily, Fonts.fontSize12, Colors.white_FFF]}>
                    { index === 2 ? this.state.readerModelText : item.text }
                </Text>
            </TouchableOpacity>
        );
    }
    // 底部菜单点击 - function
    footerMenuOnPress(index){
        switch(index){
            case 0: // 打开抽屉面板
                this.catalogPanelOpen();
                break;
            case 1: // 打开字体设置栏
                this.fontSetAnimateOpen();
                break;
            case 2: // 阅读模式切换
                this.readerModelSwitch();
                break;
            case 3: // 书写评论
                this.commentsPanelOpen();
                break;
        }
    }
    // 阅读模式切换 - function
    async readerModelSwitch(){
        // 模式切换
        this.setState({
            readerModelValue: !this.state.readerModelValue,
            readerModelText : !this.state.readerModelValue ? '夜间模式' : '日间模式',
            readerModelIcon : !this.state.readerModelValue ? readerImg.moon : readerImg.sun,
            // readerThemeIndex: !this.state.readerModelValue ? 0 : 1
        });

        // 夜间模式
        if(!this.state.readerModelValue){
            setAppBrightness(0.05);
        }

        // 日间模式
        if(this.state.readerModelValue){
            setAppBrightness(0.20);
        }

        // 本地缓存
        commonSave && commonSave('modeChange', {value: !this.state.readerModelValue});
    }
    // 打开目录 - function
    catalogPanelOpen(){
        const { navigation } = this.props;
        const { book } = this.props.article;
        const hexId = book ? book.hexId : '';
        const bookId = book ? book.id : '';
        const title = book ? book.title : '';
        
        // 关闭动画
        if(this.state.controlStatus) this.setAnimateClose();
        this.setState({controlStatus: !this.state.controlStatus});

        //navigation && navigation.navigate('ChapterDirectory',{ hexId, bookId, title, type: 'bookmark' });
        navigation && navigation.navigate('ChapterDirectory',{ hexId, bookId, title, type: 'chapter' });
    }
    // 字体尺寸控制 - function
    fontSizeControl(type: string){
        let fontSize = 0;

        // 减小
        if(type === 'sub'){
            if(this.state.fontSize <= moderateScale(14)){
                return infoToast && infoToast('已是最小字号', this.toastConfig);
            }

            fontSize = this.state.fontSize - moderateScale(1);
        }

        // 增加
        if(type === 'add'){
            if(this.state.fontSize >= moderateScale(22)){
                return infoToast && infoToast('已是最大字号', this.toastConfig);
            }

            fontSize = this.state.fontSize + moderateScale(1);
        }

        this.setState({fontSize});
        this._fontAndPlateSet(fontSize, this.state.fontLineHeight);

        // 本地缓存
        commonSave && commonSave('fontSet',{fontSize});
    }
    // 字体设置 - demo
    renderFooterFontSet(){
        const animatedBottomValue = this.animateds.footer.fontSetBottom;
        const comFontStyles = [Fonts.fontFamily, Fonts.fontSize14, Colors.white_FFF];

        return (
            <Animated.View style={[styles.readerFooterFontSetBar, {backgroundColor: BackgroundColor.bg_000000_7, bottom: animatedBottomValue}]}>
                <View style={styles.readerFooterSBRow}>
                    <View style={[styles.titleFont]}><Text style={comFontStyles}>字号</Text></View>
                    <View style={[styles.fontSetContent]}>
                        <TouchableOpacity
                            onPress={() => this.fontSizeControl('sub')}
                            activeOpacity={1}
                            style={[styles.setFontBut, Styles.flexCenter, { borderColor: BackgroundColor.bg_fff}]}
                        >
                            <Text style={[Fonts.fontFamily,Fonts.fontSize15,Colors.white_FFF]}>A -</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => this.fontSizeControl('add')}
                            activeOpacity={1}
                            style={[styles.setFontBut, Styles.flexCenter,{borderColor: BackgroundColor.bg_fff}]}
                        >
                            <Text style={[Fonts.fontFamily,Fonts.fontSize15,Colors.white_FFF]}>A +</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.readerFooterSBRow}>
                    <View style={[styles.titleFont]}><Text style={comFontStyles}>主题</Text></View>
                    <View style={[styles.fontSetContent]}>
                        {
                            (this.state.readerPaperBg || []).map((bg, i) => {
                                const borderColor = this.state.readerThemeIndex === i ? BackgroundColor.bg_f3916b : BackgroundColor.bg_transparent;
                                const sty = this.state.readerThemeIndex === i ? styles.readerFooterYq : styles.readerFooterYqBig;

                                return (
                                    <TouchableOpacity
                                        onPress={this._readerThemeSwitch.bind(this, i)}
                                        key={i}
                                        activeOpacity={1}
                                        style={[styles.selected, Styles.flexCenter, {borderColor}]}
                                    >
                                        <View style={[{backgroundColor: bg}, sty]}/>
                                    </TouchableOpacity>
                                )
                            })
                        }
                    </View>
                </View>

                <View style={styles.readerFooterSBRow}>
                    <View style={[styles.titleFont]}><Text style={comFontStyles}>板式</Text></View>
                    <View style={[styles.fontSetContent]}>
                        {
                            [4,3,2].map((number, i) => {
                                const borderColor = this.state.plateTypeIndex === i ? BackgroundColor.bg_f3916b : BackgroundColor.bg_fff;
                                const backgroundColor = this.state.plateTypeIndex === i ? BackgroundColor.bg_f3916b : BackgroundColor.bg_fff;

                                return (
                                    <TouchableOpacity
                                        key={i}
                                        activeOpacity={1}
                                        style={[styles.selected, Styles.flexCenter, {borderColor}]}
                                        onPress={this._readerPlateType.bind(this, i)}
                                    >
                                        <View style={[styles.readerFooterYq, styles.plateType]}>
                                            { this._line(number, backgroundColor) }
                                        </View>
                                    </TouchableOpacity>
                                )
                            })
                        }
                    </View>
                </View>
            </Animated.View>
        );
    }
    // 阅读主题设置 - function
    _readerThemeSwitch(index){
        this.setState({readerThemeIndex: index});
        // 本地缓存
        commonSave && commonSave('themeSet',{readerThemeIndex: index});
    }
    // 阅读板式设置 - function
    _readerPlateType(index){
        let fontLineHeight;

        // 板式1
        if(index === 0){
            fontLineHeight = moderateScale(30);
        }


        // 板式2
        if(index === 1){
            fontLineHeight = moderateScale(36);
        }

        // 板式3
        if(index === 2){
            fontLineHeight = moderateScale(42);
        }

        this.setState({fontLineHeight, plateTypeIndex: index});
        this._fontAndPlateSet(this.state.fontSize, fontLineHeight);

        // 本地缓存
        commonSave && commonSave('plateSet',{fontLineHeight, plateTypeIndex: index});
    }
    // 字体设置后重新排版 - function
    _fontAndPlateSet(fontSize, fontLineHeight){
        const { article } = this.props;
        const chapter = article && article.chapter;
        const content = article && article.content;
        const sourceSiteIndex = chapter && chapter.sourceSiteIndex;
        const title = chapter && chapter.title;

        let obj = this._formatChapter(content, sourceSiteIndex, title, fontSize, fontLineHeight);

        if(obj.length === 0){
            return infoToast && infoToast('本章未显示文字内容，无法改变字体大小');
        }

        this.pages = obj.length;
        this.count = (this.pages - 1) * width;
        this.setState({content: obj});
    }
    // 阅读板式的线 - function
    _line(numbers, backgroundColor){
        return _.range(numbers).map((obj,key) => {
            return (<View key={key} style={[styles.line, { backgroundColor: backgroundColor }]}/>);
        });
    }
    // 去评论 - function
    commentsPanelOpen(){
        const { navigation } = this.props;
        const bookId = navigation.getParam('bookId');
        const bookHexId = navigation.getParam('bookHexId');
        const chapterId = this.state.currentChapterHexId;
        const isLogin = this.isAuthorized();

        if(!isLogin){
            return infoToast && infoToast('请先登录在评论', this.toastConfig);
        }

        return navigation && navigation.navigate('BookComment',{bookId, bookHexId, chapterId});
        // this.setState({visible: true});
    }
    commentsPanelClose(){
        this.setState({visible: false});
        this.textInputOperate();
    }
    // 书写评论 - demo
    renderFooterComments(){
        return (
            <Modal
                visible={this.state.visible}
                animationType={'fade'}
                onRequestClose={this.commentsPanelClose.bind(this)}
                transparent={true}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    style={[styles.commentsContent, {backgroundColor: 'transparent'}]}
                    onPress={this.commentsPanelClose.bind(this)}
                >
                    <View style={[styles.commentsBox]}>
                        <TouchableOpacity
                            activeOpacity={1}
                            style={[styles.commentsCommit]}
                            onPress={this.sendComments.bind(this)}
                        >
                            <Text style={[Fonts.fontFamily, Fonts.fontSize15, Colors.gray_808080]}>发送</Text>
                        </TouchableOpacity>
                        <View style={styles.commentsContent}>
                            <TextInput
                                style={[styles.commentsTextInput, Fonts.fontFamily, Fonts.fontSize14]}
                                multiline={true}
                                editable={true}
                                autoFocus={this.state.focusStatus}
                                autoCapitalize={'none'}
                                placeholder={'写出战胜作者的评论吧~'}
                                placeholderTextColor={'#cccccc'}
                                underlineColorAndroid={'transparent'}
                                onChangeText={this.changeText.bind(this)}
                                ref={ref => this._textInput = ref}
                                keyboardType={'default'}
                            />
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        );
    }
    // 提交评论 - function
    sendComments(){
        const { addComments, navigation } = this.props;
        const bookId = navigation.getParam('bookId');
        const bookHexId = navigation.getParam('bookHexId');
        const chapterId = this.state.currentChapterHexId;
        const content = this.commentsText;

        if(content === ''){
            return infoToast && infoToast('请输入有效的评论', { duration: 200, position: Toast.positions.CENTER });
        }

        addComments && addComments(bookHexId, bookId, chapterId, content);
        this.commentsPanelClose();
    }
    // 输入文字 - function
    changeText(commentsText){
        this.commentsText = commentsText;
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
        commonShare && commonShare('friends', channelID, shareUrl, agentTag, this.state.bookTitle);
        shareAddListener && shareAddListener();
    }
    // 分享朋友圈 - function
    _shareFriendsCircle(){
        const shareUrl = global.launchSettings && global.launchSettings.agentData && global.launchSettings.agentData.data &&
            global.launchSettings.agentData.data.shareUrl || 'http://share.lameixisi.cn/share/index.html';
        const agentTag = (global.launchSettings && global.launchSettings.agentTag) || '10';
        const channelID = global.launchSettings && global.launchSettings.channelID;

        shareRemoveListener && shareRemoveListener();
        commonShare && commonShare('friendsCircle', channelID, shareUrl, agentTag, this.state.bookTitle);
        shareAddListener && shareAddListener();
    }
    // 状态栏设置 - demo
    renderStatusBar(){
        return (
            <StatusBarSet
                hidden={this.state.statusBarHidden}
                backgroundColor={this.state.statusBarBackgroundColor}
                barStyle={this.state.barStyle}
            />
        );
    }
    // 空的定位层 - demo
    renderEmptyLayer(){
        const { controlStatus } = this.state;

        if(controlStatus){
            return (
                <TouchableOpacity
                    activeOpacity={1}
                    style={[styles.emptyLayer]}
                    onPress={this.readerSetting.bind(this)}
                />
            );
        }

        return null;
    }
    // 阅读背景 - demo
    renderReaderBg(){
        if(this.state.readerThemeIndex === 0){
            return (
                <View style={[styles.readerBgBox]}>
                    <Image source={readerImg.readBg1} style={[Img.resizeModeStretch, styles.readerBg]}/>
                </View>
            );
        }

        return null;
    }
    // 总渲染 - demo
    render(){
        const { readerPaperBg, readerThemeIndex } = this.state;
        const backgroundColor = readerPaperBg[readerThemeIndex];

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
                <View style={[Styles.container, readerThemeIndex !== 0 ? { backgroundColor } : {}]}>
                    { this.renderStatusBar() }
                    { this.renderHeader() }
                    { this.renderReaderContent() }
                    { this.renderFooterNav() }
                    { this.renderFooterFontSet() }
                    {/*{ this.renderFooterComments() }*/}
                    { this.renderEmptyLayer() }
                    { this.renderReaderBg() }
                </View>
            </DrawerJsx>
        );
    }
}

const styles = ScaledSheet.create({
    batteryLevelBox:{
        height: '10@vs',
        width: '22@s',
        position:'relative',
        flexDirection:'row',
        marginLeft: '10@ms',
    },
    batteryLevelInner:{
        height: '10@vs',
        width: '20@s',
        borderWidth: '0.5@s',
        alignItems:'center',
        flexDirection:'row',
        paddingLeft: '1@s'
    },
    batteryLevel:{
        // height: '9.5@vs'
        height: '7.5@vs'
    },
    batterHeader:{
        height: '4@vs',
        width: '2@s',
        backgroundColor:'#FFF',
        position:'absolute',
        top:'50%',
        left: '20@ms',
    },
    readerBgBox: {
        width: width,
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        right: 0,
        height: '100%',
        zIndex: 0
    },
    readerBg: {
        width: width,
        height: '100%'
    },
    emptyLayer: {
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        zIndex: 90,
        backgroundColor:'transparent'
    },
    buckleTitle: {
        alignSelf: 'center',
        paddingBottom: '60@ms',
    },
    buckleButs: {
        alignSelf: 'center'
    },
    buckleBut: {
        borderWidth: 1,
        borderColor: BackgroundColor.bg_f3916b,
        height: '44@vs',
        width: '300@s',
        borderRadius: '50@ms',
    },
    buckleContent: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    readerRollBox: {
        width: width,
        height: '100%',
        top: 0,
        position: 'absolute',
        zIndex: 20
    },
    GestureRecognizer: {
        backgroundColor:'transparent',
        flex: 1
    },
    readerRollContent: {
        flex: 1,
        position: 'relative'
    },
    readerContainer: {
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        zIndex: 10,
    },
    gestureContent: {
        position:'absolute',
        left:0,
        top:0,
        right:0,
        bottom:0,
        zIndex: 60,
        flexDirection:'row',
    },
    readerHeaderRmb: {
        // height: '44@vs',
        height: '58@vs',
        paddingTop: '14@vs',
        position: 'absolute',
        top: 0,
        right: 0,
        zIndex: 100,
        width: width / 3,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingRight: '15@ms',
    },
    commentsTextInput:{
        flex: 1,
        padding: '15@ms',
        textAlign: 'left',
        textAlignVertical: 'top', // 只支持Android
        lineHeight: '20@vs',
        color: '#333333',
    },
    commentsCommit:{
        height: '48@vs',
        paddingHorizontal: '15@ms',
        overflow: 'hidden',
        justifyContent: 'flex-end',
        flexDirection: 'row',
        alignItems: 'center',
    },
    commentsBox:{
        height: '180@vs',
        position: 'absolute',
        zIndex: 600,
        backgroundColor: '#f6f4f1',
        left: 0,
        bottom: 0,
        width: width,
        elevation: 6
    },
    commentsContent: {
        width: width,
        position: 'absolute',
        zIndex: 600,
        overflow: 'hidden',
        left: 0,
        bottom: 0,
        top: '48@vs',
        right: 0,
    },
    line: {
        width: '15@s',
        height: '1@vs',
    },
    plateType: {
        alignItems:'center',
        justifyContent:'space-between',
        paddingTop: '8@ms',
        paddingBottom: '8@ms',
    },
    selected: {
        width: '38@s',
        height: '38@vs',
        borderWidth: 1,
        borderStyle: 'solid',
        borderRadius: '38@ms',
    },
    readerFooterYq: {
        width: '30@s',
        height: '30@vs',
        borderRadius: '30@ms',
    },
    readerFooterYqBig: {
        width: '38@s',
        height: '38@vs',
        borderRadius: '38@ms',
    },
    setFontBut: {
        height: '30@vs',
        width: '90@s',
        borderWidth: 1,
        borderStyle: 'solid',
        borderRadius: '25@ms',
    },
    fontSetContent: {
        flexDirection:'row',
        flex:1,
        alignItems:'center',
        justifyContent:'space-between'
    },
    titleFont: {
        width: '70@s',
        height: '55@vs',
        alignItems:'center',
        flexDirection:'row'
    },
    readerFooterFontSetBar: {
        position: 'absolute',
        left: 0,
        zIndex: 200,
        width: width,
        overflow: 'hidden',
    },
    readerFooterSBRow: {
        paddingLeft: '15@ms',
        paddingRight: '55@ms',
        flexDirection: 'row',
        height: '60@vs',
    },
    readerFooterSetBox: {
        flexDirection: 'column',
        flex: 1,
    },
    readerFooterImage: {
        width: '25@s',
        height: '25@vs'
    },
    readerFooterSetBar: {
        position: 'absolute',
        width: width,
        height: '65@vs',
        left: 0,
        zIndex: 100,
        flexDirection: 'row',
    },
    readerHeaderSetBar: {
        position: 'absolute',
        width: width,
        // height: '44@vs',
        height: '58@vs',
        paddingTop: '14@vs',
        left: 0,
        zIndex: 100,
    },
    readerHeaderReturn: {
        // height: '44@vs',
        height: '58@vs',
        paddingTop: '14@vs',
        width: width / 3,
        position: 'absolute',
        left: 0,
        top: 0,
        zIndex: 100,
        overflow: 'hidden',
        flexDirection: 'row',
        alignItems: 'center',
    },
    arrowImage: {
        height: '16@ms',
    },
    readerText: {
        includeFontPadding: false,
        textAlign: 'justify',
    },
    realContent: {
        width: width,
        height: '100%',
        position: 'relative',
    },
    readerRow: {
        width: width,
        height: '40@ms',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 2,
    },
    readerBody: {
        flex: 1,
    },
    titleRightChildrenImage: {
        width: "15@s",
        height: "15@vs",
    },
    CollectBookSelectIcon: {
        width: '16@s',
        height: '16@vs'
    },
    selectCyc: {
        width: '16@s',
        height: '16@vs',
        borderRadius: '20@ms',
        borderWidth: 1,
        borderColor: '#cccccc',
    },
    gmBox: {
        flexDirection:'row',
        paddingVertical: '30@ms',
        marginTop: '20@ms'
    },
});

const mapStateToProps = (state, ownProps) => {
    let bookHexId = ownProps.navigation.getParam('bookHexId');

    let data = state.getIn(['reader','chapter', bookHexId]);
    let localData = state.getIn(['local','updateSection']);
    // let vipObj = state.getIn(['local','vip']);
    let myData = state.getIn(['user', 'userData','myData']);
    let userData = state.getIn(['user','userData','baseInfo']);

    if(Immutable.Map.isMap(localData)){ localData = localData.toJS() }
    if(Immutable.Map.isMap(data)){ data = data.toJS() }
    // if(Immutable.Map.isMap(vipObj)){ vipObj = vipObj.toJS() }
    if(Immutable.Map.isMap(myData)){ myData = myData.toJS() }
    if(Immutable.Map.isMap(userData)){ userData = userData.toJS() }

    return { ...ownProps, ...data, ...localData, ...myData, ...userData };
};

export default withNavigationFocus(connect(mapStateToProps,{getChapter, addComments, updateChapter})(Reader));














