
'use strict';

import React,{ Component, PureComponent } from 'react';
import { View, Text, StatusBar } from 'react-native';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import { Styles, ScaledSheet, BackgroundColor } from "../../common/Style";
import Header from '../../components/Header';
import { height, timestampToTime, width } from "../../common/Tool";
import CommentRows from '../../components/CommentRows';
import { reloadMyComments, loadMyComments } from "../../actions/User";
import NovelFlatList from '../../components/NovelFlatList';
import { RefreshState, pixel } from "../../common/Tool";
import { verticalScale } from "react-native-size-matters";
import DefaultDisplay from '../../components/DefaultDisplay';

type Props = {
    records: Array<any>,
    currentOffset: number,
    refreshState: number,
    totalRecords: number
};

class Comments extends Component<Props>{
    static defaultProps = {
        records: [],
        currentOffset: 0,
        refreshState: 0,
        totalRecords: 0,
    };
    constructor(props){
        super(props);
        this.state = {
            currentIndex: 0,
        };
    }
    componentDidMount() {
        this.onHeaderRefresh && this.onHeaderRefresh(RefreshState.HeaderRefreshing);
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
                title={'我的书评'}
                isArrow={true}
                goBack={this._goBack.bind(this)}
            />
        );
    }
    renderItemBooks({item, index}){
        return (
            <CommentRows
                isFabulous={false}
                showFaces={false}
                userName={item.title}
                contentText={item.content}
                commentTime={timestampToTime(item.timeCreated)}
                pointPraise={item.likeCount}
            />
        );
    }
    // 头部刷新 - function
    onHeaderRefresh(refreshState){
        const { reloadMyComments } = this.props;

        reloadMyComments && reloadMyComments(refreshState, 0);
    }
    // 底部加载 - function
    onFooterRefresh(refreshState){
        const { loadMyComments, currentOffset } = this.props;
        const records = this.props.records ? this.props.records : [];

        loadMyComments && loadMyComments(refreshState, currentOffset, records);
    }
    // 内容 - demo
    renderContent(){
        const { currentOffset, refreshState, totalRecords, records } = this.props;
        const _height =  height - (StatusBar.currentHeight + verticalScale(44));

        return (
            <NovelFlatList
                showArrow={true}
                data={records}
                ListEmptyComponent={
                    <View style={[{height: _height, width: width}]}>
                        <DefaultDisplay />
                    </View>
                }
                renderItem={this.renderItemBooks.bind(this)}
                keyExtractor={(item,index) => index + ''}
                onHeaderRefresh={this.onHeaderRefresh.bind(this)}
                onFooterRefresh={this.onFooterRefresh.bind(this)}
                refreshState={refreshState}
                totalRecords={totalRecords}
                offset={ currentOffset }
            />
        );
    }
    render(){
        return (
            <View style={[Styles.container, {backgroundColor: BackgroundColor.bg_f1f1f1}]}>
                { this.renderHeader() }
                { this.renderContent() }
            </View>
        );
    }

}

const styles = ScaledSheet.create({
    deleteButton:{
        backgroundColor: 'red',
        flex: 1
    },
    separator: {
        backgroundColor: '#E5E5E5',
        width: '100%',
    }
});

const mapStateToProps = (state, ownProps) => {
    let userData = state.getIn(['user', 'userData','commentsData']);

    if(Immutable.Map.isMap(userData)){ userData = userData.toJS() }
    return { ...ownProps, ...userData };
};

export default connect(mapStateToProps,{reloadMyComments,loadMyComments})(Comments);




































