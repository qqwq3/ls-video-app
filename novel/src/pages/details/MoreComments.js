
'use strict';

import React,{ Component } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import { Styles, ScaledSheet, BackgroundColor } from "../../common/Style";
import Header from '../../components/Header';
import CommentRows from '../../components/CommentRows';
import { reloadBookComments, likeComments, loadBookComments } from '../../actions/Details';
import NovelFlatList from '../../components/NovelFlatList';
import { infoToast, timestampToTime, loadImage, RefreshState } from "../../common/Tool";
import { my } from "../../common/Icons";

type Props = {};

class MoreComments extends Component<Props>{
    constructor(props){
        super(props);
        this.state = {
            currentIndex: 0,
            commentsMap: new Map(),
        };
    }
    componentDidMount() {
        this.onHeaderRefresh && this.onHeaderRefresh(RefreshState.HeaderRefreshing);
    }
    componentWillReceiveProps(nextProps) {
        // console.log('moreComments',nextProps);
    }
    // 返回 - function
    _goBack(){
        const { navigation } = this.props;
        navigation.goBack();
    }
    // 头部 - demo
    renderHeader(){
        return (
            <Header
                title={'书籍评论'}
                isArrow={true}
                goBack={this._goBack.bind(this)}
            />
        );
    }
    // 点赞 - function
    _pointPraiseOnPress(commentsId, likeCount){
        const { commentsMap } = this.state;
        const { likeComments, navigation } = this.props;

        if(commentsMap.has(commentsId)){
            infoToast && infoToast('亲，您已经点过赞了');
        }
        else{
            const hexId = navigation.getParam('hexId');
            likeComments && likeComments(hexId, commentsId);
            commentsMap.set(commentsId, parseInt(likeCount) + 1);
        }

        this.setState({commentsMap});
    }
    // 头部刷新 - function
    onHeaderRefresh(refreshState){
        const { reloadBookComments, navigation } = this.props;
        const bookId = navigation.getParam('bookId');
        const hexId = navigation.getParam('hexId');
        const currentOffset = 0;

        reloadBookComments && reloadBookComments(hexId, bookId, currentOffset);
    }
    // 底部加载 - function
    onFooterRefresh(refreshState){
        const { loadBookComments, comments, navigation } = this.props;
        const bookId = navigation.getParam('bookId');
        const hexId = navigation.getParam('hexId');
        const currentOffset = comments ? comments.currentOffset : 0;

        loadBookComments && loadBookComments(hexId, bookId, currentOffset);
    }
    // 内容 - demo
    renderContent(){
        const { comments } = this.props;
        const records = comments ? (comments.records || []) : [];
        const currentOffset = comments ? comments.currentOffset : 0;
        const refreshState = comments ? comments.refreshState : RefreshState.HeaderRefreshing;
        const totalRecords = comments ? comments.totalRecords : 0;

        return (
            <NovelFlatList
                data={records}
                renderItem={this.renderItemComments.bind(this)}
                keyExtractor={(item, index) => index + ''}
                numColumns={1}
                onHeaderRefresh={this.onHeaderRefresh.bind(this)}
                onFooterRefresh={this.onFooterRefresh.bind(this)}
                refreshState={refreshState}
                totalRecords={totalRecords}
                offset={currentOffset}
                contentContainerStyle={styles.contentContainerStyle}
            />
        );
    }
    // 评论数据渲染 - demo
    renderItemComments({item, index}){
        const { commentsMap } = this.state;
        const likeCount = commentsMap.has(item.id) ? commentsMap.get(item.id) : item.likeCount;

        return (
            <CommentRows
                userName={item.userName}
                contentText={item.content}
                commentTime={timestampToTime(item.timeCreated, true)}
                pointPraise={likeCount}
                //ImageSource={{uri: loadImage(item.userId)}}
                ImageSource={item.avatar === '' ? my.userDefault : {uri: item.avatar}}
                pointPraiseOnPress={this._pointPraiseOnPress.bind(this,item.id, item.likeCount)}
            />
        );
    }
    render(){
        return (
            <View style={[Styles.container, {backgroundColor: BackgroundColor.bg_fff}]}>
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
});

const mapStateToProps = (state, ownProps) => {
    const bookHex = ownProps.navigation.state.params.hexId;
    let data = state.getIn(['details', bookHex]);

    if(Immutable.Map.isMap(data)){ data = data.toJS() }
    return { ...ownProps, ...data }
};

export default connect(mapStateToProps,{ reloadBookComments, likeComments, loadBookComments })(MoreComments);



