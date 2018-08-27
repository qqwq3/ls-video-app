
/*邀请好友*/

import React,{ Component } from 'react';
import {
    StyleSheet,
    Image,
    ImageBackground,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import Toast from 'react-native-root-toast';
import HeaderBox from '../../common/HeaderBox';
import { height, pixel, statusBarSetPublic, money, timestampToTime } from "../../common/tool";
import CommonMenu from '../Common/CommonMenu';
import { loadInviteInfo, reLoadInviteInfo, loadNoticeFriends, reLoadNoticeFriends } from '../../actions/user';
import XingrenFlatList from '../../components/XingrenFlatList';
import { RefreshState } from "../../Constants";
import { shareContent, shareAddListener, shareRemoveListener } from '../../common/wxShare';
import { addTask } from '../../actions/task';

class InviteFriends extends Component<{}>{
    constructor(props){
        super(props);
        this.state = {
            refreshing: false,
            records: [],
        };
    }
    componentWillMount(){
        const { addTask } = this.props;
        statusBarSetPublic('#FF8A57','light-content',true);
        // 监听分享
        shareAddListener && shareAddListener(_ => {
            addTask && addTask('share_friend');
            Toast.show('你已成功分享好友',{duration: 2000, position: -55});
        });
    }
    componentDidMount() {
        // 我的好友 - 初始加载
        this.onHeaderMyFriendsRefresh(RefreshState.HeaderRefreshing);
        // 唤醒好友 - 初始加载
        this.onHeaderNoticeFriendsRefresh(RefreshState.HeaderRefreshing);
    }
    componentWillUnmount() {
        // 删除分享监听
        shareRemoveListener && shareRemoveListener();
    }
    // 我的好友 - 刷新
    onHeaderMyFriendsRefresh = (refreshState) => {
        const { dataRet, reLoadInviteInfo } = this.props;
        const selectObj = (dataRet && Immutable.Map(dataRet.selectedObj)) || Immutable.fromJS({});
        let ret = selectObj;

        if (selectObj.isEmpty()) {
            ret = selectObj.setIn(['type'], 1);
        }

        reLoadInviteInfo && reLoadInviteInfo(0, refreshState, ret.toJS());
    };
    // 我的好友 - 加载
    onFooterMyFriendsRefresh = (refreshState) => {
        const { dataRet, loadInviteInfo } = this.props;

        let currentOffset = (dataRet && dataRet.offset) || 0;
        let ret = (dataRet && Immutable.Map(dataRet.selectedObj)) || {};

        loadInviteInfo && loadInviteInfo(currentOffset, refreshState, ret.toJS());
    };
    // 唤醒好友 - 刷新
    onHeaderNoticeFriendsRefresh = (refreshState) => {
        const { dataRetFriends, reLoadNoticeFriends } = this.props;
        const selectObjFriends = (dataRetFriends && Immutable.Map(dataRetFriends.selectedObj)) || Immutable.fromJS({});
        let ret = selectObjFriends;

        if (selectObjFriends.isEmpty()) {
            ret = selectObjFriends.setIn(['type'], 1);
        }

        reLoadNoticeFriends && reLoadNoticeFriends(0, refreshState, ret.toJS());
    };
    // 唤醒好友 - 加载
    onFooterNoticeFriendsRefresh = (refreshState) => {
        const { dataRetFriends, loadNoticeFriends } = this.props;

        let currentOffset = (dataRetFriends && dataRetFriends.offset) || 0;
        let ret = (dataRetFriends && Immutable.Map(dataRetFriends.selectedObj)) || {};

        loadNoticeFriends && loadNoticeFriends(currentOffset, refreshState, ret.toJS());
    };
    // 返回
    _goBack(){
        const { navigation } = this.props;
        navigation.goBack();
    }
    // 头部 - demo
    renderHeader(){
        const iconInviteMain = require('../imgs/invite/invite_main_img.png');
        const { userData } = this.props;
        const inviteCode = (userData && userData.inviteCode) || '0';

        return (
            <ImageBackground
                source={iconInviteMain}
                style={styles.header}
                imageStyle={{resizeMode:'cover'}}
            >
                <HeaderBox
                    isText={true}
                    text={'邀请好友'}
                    isArrow={true}
                    backgroundColor={'transparent'}
                    borderBottomColor={'transparent'}
                    titleColor={'#FFF'}
                    arrowColor={'#FFF'}
                    goBack={this._goBack.bind(this)}
                />
                <View style={[styles.headerBtnBox]}>
                    <TouchableOpacity onPress={this._shareImmediately.bind(this)} activeOpacity={0.80} style={[styles.headerBox,{marginTop:88}]}>
                        <LinearGradient colors={['#fcf4a8', '#ffc754']}  style={styles.headerBtn}>
                            <Text style={[styles.fontFamily,styles.headerBoxText]}>立即分享赚钱</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                    <Text style={[styles.fontFamily,styles.fontSmall,{marginTop:10}]}>我的邀请码：{ inviteCode }</Text>
                </View>
            </ImageBackground>
        );
    }
    // 立即去分享 - function
    _shareImmediately(){
        const { userData } = this.props;
        let shareTitle: string = (userData && userData.name+" 邀请你观看免费VIP视频") || '超视TV-所有VIP视频免费看';
        const inviteCode = (userData && userData.inviteCode) || '0';
        const shareBody: string = '聚合全网优质资源，一站看遍所有VIP视频。你想要的，这里全有，全免费！';
        const shareImageUrl: string = 'http://download.xiyunkai.cn/icon/chaoshiicon.png';
        const channelID = (global.launchSettings && global.launchSettings.channelID) || 'nice01';
        const shareUrl = (global.launchSettings && global.launchSettings.shareUrl) || 'http://www.xiyunkai.cn';
        const shareLink: string = shareUrl + `/agoutv/invite.html?channelId=${channelID}&code=${inviteCode}`;

        shareContent('friends',shareTitle,shareBody,shareImageUrl,shareLink);
    }
    // 活动说明 - demo
    renderActivities(){
        const detailImage = require('../imgs/invite/invite_method_img.png');
        const headerBoxCS = {marginTop:15,marginBottom:35,height:44,width:220,alignSelf:'center'};
        const headerBoxCSWH = {height:44,width:220};

        return (
            <ScrollView
                showsVerticalScrollIndicator={false}
                tabLabel={'活动说明'}
                style={[styles.menuContent]}
            >
                <Image source={detailImage} resizeMode={'contain'} style={styles.detailImage}/>
                <TouchableOpacity onPress={this._shareImmediately.bind(this)} activeOpacity={0.80} style={[styles.headerBox,headerBoxCS]}>
                    <LinearGradient colors={['#fcf4a8', '#ffc754']}  style={[styles.headerBtn,headerBoxCSWH]}>
                        <Text style={[styles.fontFamily,styles.headerBoxText]}>立即分享赚钱</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
        );
    }
    // 公共头部 - 表格
    renderTabs(value: number) {
        return (
            <View style={styles.listHeader}>
                <View style={[styles.cell, {justifyContent: 'flex-start'}]}>
                    <Text style={[styles.fontFamily, styles.cellText]}>头像</Text>
                </View>
                <View style={[styles.cell, value === 3 ? {} : {justifyContent: 'flex-start'}]}>
                    <Text style={[styles.fontFamily, styles.cellText]}>昵称</Text>
                </View>
                <View style={[styles.cell, value === 3 ? {justifyContent: 'flex-end'} : {}]}>
                    <Text style={[styles.fontFamily, styles.cellText]}>{value === 3 ? '唤醒好友' : '邀请日期'}</Text>
                </View>
                {
                    value === 3 ? null :
                    <View style={[styles.cell, {justifyContent: 'flex-end'}]}>
                        <Text style={[styles.fontFamily, styles.cellText]}>贡献收益</Text>
                    </View>
                }
            </View>
        );
    }
    // 暂无相关数据
    _noRelateData(){
        return (
            <View style={styles.noRelateDate}>
                <Text style={[styles.fontFamily,styles.noRelateDateText]}>暂无相关数据</Text>
            </View>
        );
    }
    // 我的好友 - demo
    renderMyFriends(){
        const { dataRet } = this.props;
        let offset = dataRet && dataRet.offset;
        let totalRecords = dataRet && dataRet.totalRecords;
        let refreshState = dataRet && dataRet.refreshState;
        const records = (dataRet && dataRet.records) || [];

        return (
            <View
                tabLabel={'我的好友'}
                style={[styles.menuContent]}
            >
                { this.renderTabs(4) }
                {
                    records ?
                    <XingrenFlatList
                        ListEmptyComponent={this._noRelateData.bind(this)}
                        data={records}
                        renderItem={this._renderMyFriendsItem.bind(this)}
                        keyExtractor={(item,index) => index}
                        onHeaderRefresh={this.onHeaderMyFriendsRefresh}
                        onFooterRefresh={this.onFooterMyFriendsRefresh}
                        refreshState={refreshState}
                        numColumns={1}
                        totalRecords={totalRecords}
                        offset={offset}
                        showReturnTop={true}
                    />:
                    <View style={styles.loadingContent}>
                        <ActivityIndicator size={'small'} color={'rgb(0,117,248)'}/>
                    </View>
                }
            </View>
        );
    }
    // 我的好友渲染 - demo
    _renderMyFriendsItem({item,index}){
        return (
            item ?
            <View style={[styles.item,index % 2 !== 0 ? {backgroundColor:'#F2F8FE'} : {}]}>
                <View style={[styles.itemCell,{width:50}]}>
                    <View style={styles.itemTx}>
                        <Image source={{uri:item.avatar}} resizeMode={'contain'} style={styles.itemTxImage}/>
                    </View>
                </View>
                <View style={[styles.itemContent]}>
                    <Text numberOfLines={1} style={[styles.fontFamily,styles.name]}>{ item.nickName }</Text>
                </View>
                <View style={[styles.itemContent,{justifyContent:'flex-end',paddingRight:6}]}>
                    <Text numberOfLines={1} style={[styles.fontFamily,styles.name]}>{ timestampToTime(item.inviteTime) }</Text>
                </View>
                <View style={[styles.itemCell,{justifyContent:'flex-end'}]}>
                    <Text numberOfLines={1} style={[styles.fontFamily,styles.name]}>{ money(item.reward) }元</Text>
                </View>
            </View> : null
        );
    }
    // 唤醒好友渲染 - demo
    _renderWakeUpFriendsItem({item,index}){
        return (
            item ?
            <View style={[styles.item,{backgroundColor:'#F2F8FE'}]}>
                <View style={[styles.itemCell,]}>
                    <View style={styles.itemTx}>
                        <Image source={{uri:item.avatar}} resizeMode={'contain'} style={styles.itemTxImage}/>
                    </View>
                </View>
                <View style={[styles.itemContent]}>
                    <Text numberOfLines={1} style={[styles.fontFamily,styles.name]}>{ item.nickName }</Text>
                </View>
                <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={this._wakeUpFriends.bind(this,{item,index})}
                    style={[styles.itemCell,{justifyContent:'flex-end'}]}
                >
                    <View style={styles.itemBtn} >
                        <Text style={[styles.fontFamily,styles.itemBtnText]}>唤醒</Text>
                    </View>
                </TouchableOpacity>
            </View> : null
        );
    }
    // 唤醒好友 - function
    _wakeUpFriends({item,index}){
        const randoms = Math.ceil(Math.random()*20); // 获取1到20的随机整数，取0的几率极小。
        const { userData } = this.props;
        const inviteCode = (userData && userData.inviteCode) || '0';
        const shareBody: string = `超视TV最近更新了${randoms}部独家视频资源，快来和好友一起看吧~`; // 临时处理
        const shareTitle: string = `${userData.name}喊你来看新片`;
        const shareImageUrl: string = userData.avatar;
        const channelID = (global.launchSettings && global.launchSettings.channelID) || 'nice01';
        const shareUrl = (global.launchSettings && global.launchSettings.shareUrl) || 'http://www.xiyunkai.cn';
        const shareLink: string = `${shareUrl}/agoutv/invite.html?channelId=${channelID}&code=${inviteCode}`;

        shareContent('friends',shareTitle,shareBody,shareImageUrl,shareLink);
    }
    // 唤醒好友 - demo
    renderWakeUpFriends(){
        const { dataRetFriends } = this.props;
        let offset = dataRetFriends && dataRetFriends.offset;
        let totalRecords = dataRetFriends && dataRetFriends.totalRecords;
        let refreshState = dataRetFriends && dataRetFriends.refreshState;
        const records = (dataRetFriends && dataRetFriends.records) || [];

        return (
            <View
                tabLabel={'唤醒好友'}
                style={[styles.menuContent]}
            >
                { this.renderTabs(3) }
                {
                    records ?
                    <XingrenFlatList
                        data={records}
                        ListEmptyComponent={this._noRelateData.bind(this)}
                        renderItem={this._renderWakeUpFriendsItem.bind(this)}
                        keyExtractor={(item,index) => index}
                        onHeaderRefresh={this.onHeaderNoticeFriendsRefresh}
                        onFooterRefresh={this.onFooterNoticeFriendsRefresh}
                        refreshState={refreshState}
                        numColumns={1}
                        totalRecords={totalRecords}
                        offset={offset}
                        showReturnTop={true}
                    /> :
                    <View style={styles.loadingContent}>
                        <ActivityIndicator size={'small'} color={'rgb(0,117,248)'}/>
                    </View>
                }
            </View>
        );
    }
    // 身体内容 - demo
    renderBody(){
        const bodyHeight = height - 260 + 38;

        return (
            <View style={styles.bodyContainer}>
                <View style={[styles.body,{height:'100%'}]}>
                    <ScrollableTabView
                        renderTabBar={this.renderTabBar.bind(this)}
                        initialPage={0}
                        tabBarInactiveTextColor={'#4c4c4c'}
                        tabBarActiveTextColor={'#f3916b'}
                        tabBarBackgroundColor={'#ffffff'}
                        locked={false}
                        scrollWithoutAnimation={false}
                        prerenderingSiblingsNumber={3}
                    >
                        { this.renderActivities() }
                        { this.renderMyFriends() }
                        { this.renderWakeUpFriends() }
                    </ScrollableTabView>
                </View>
            </View>
        );
    }
    renderTabBar(){
        return (<CommonMenu menuNumber={3}/>);
    }
    render(){
        return (
            <View style={styles.content}>
                { this.renderHeader() }
                { this.renderBody() }
            </View>
        );
    }
}

const styles = StyleSheet.create({
    bodyContainer:{
        flex:1,
        position:'relative',
        marginTop:-55,
        zIndex:100
    },
    noRelateDate:{
        height:100,
        justifyContent:'center',
        alignItems:'center'
    },
    noRelateDateText:{
        fontSize:16,
        color:'#dcdcdc'
    },
    loadingContent:{
        flex:1,
        justifyContent:'center',
        alignItems:'center'
    },
    listContent:{
        flexDirection:'column',
    },
    itemBtn:{
        width:50,
        justifyContent:'center',
        alignItems:'center',
        height:25,
        borderWidth:0.5,
        borderColor:'rgb(0,117,248)',
        overflow:'hidden',
        borderRadius:50
    },
    itemBtnText:{
        fontSize:12,
        color:'rgb(0,117,248)'
    },
    name:{
        fontSize:12,
        color:'#404040'
    },
    item:{
        height:50,
        overflow:'hidden',
        flexDirection:'row',
        width:'100%',
        paddingHorizontal:15,
    },
    itemTx:{
        width:40,
        height:40,
        borderRadius:50,
        overflow:'hidden',
        backgroundColor:'#dcdcdc'
    },
    itemTxImage:{
        width:40,
        height:40,
    },
    itemCell:{
        width:80,
        height:50,
        alignItems:'center',
        flexDirection:"row"
    },
    itemContent:{
        flex:1,
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center'
    },
    cell:{
        flex:1,
        justifyContent:'center',
        alignItems:'center',
        flexDirection:'row'
    },
    cellText:{
        fontSize:14,
        color:"#404040",
    },
    listHeader:{
        marginHorizontal:15,
        height:44,
        borderBottomWidth: 1 / pixel,
        borderBottomColor: '#dcdcdc',
        flexDirection:'row'
    },
    detailImage:{
        width:'100%',
        height:580
    },
    menuContent:{
        height:'100%',
        position:'relative',
        borderBottomRightRadius:6,
        borderBottomLeftRadius:6,
    },
    body:{
        position:'absolute',
        left:10,
        right:10,
        bottom:0,
        zIndex:10,
        top:0,
        backgroundColor:'#fff',
        borderTopLeftRadius:6,
        borderTopRightRadius:6,
        elevation:2
    },
    fontSmall:{
        fontSize:12,
        color:'#fff'
    },
    headerBoxText:{
        fontSize:16,
        color:'#A46800'
    },
    headerBtn:{
        width:135,
        height:35,
        borderRadius:50,
        overflow:'hidden',
        position:'relative',
        justifyContent:'center',
        alignItems:'center'
    },
    headerBtnBox:{
        alignItems:'center',
        justifyContent:'center'
    },
    fontFamily: {
        fontFamily: 'PingFangSC-Medium',
    },
    header:{
        width:'100%',
        height:260,
        overflow:'hidden',
        position:'relative'
    },
    content:{
        flex:1,
        backgroundColor:'#fff',
        position:'relative'
    },
});

const mapStateToProps = (state, ownProps) => {
    let userData = state.getIn(['user']);
    let data = state.getIn(['user','root']);

    if (Immutable.Map.isMap(data)) { data = data.toJS() }
    if (Immutable.Map.isMap(userData)) { userData = userData.toJS() }

    return { ...ownProps, ...data, ...userData };
};

export default connect(mapStateToProps,{
    loadInviteInfo,
    reLoadInviteInfo,
    loadNoticeFriends,
    reLoadNoticeFriends,
    addTask
})(InviteFriends);



















