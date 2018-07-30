
'use strict';

import React, { Component } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    Animated,
} from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { Styles, ScaledSheet, BackgroundColor, Fonts, Colors } from "../common/Style";
import { RefreshState } from '../common/Tool';
import Chrysanthemum from '../components/Chrysanthemum';

const footerRefreshingText = '数据加载中…';
const footerFailureText = '点击重新加载';
const footerNoMoreDataText = '已加载全部数据';

type Props = {
    onEndReachedThreshold?: string | number,
    refreshState?: number | string,
    nextPage: string | number,
    items?: Array<any>,
    total?: number | string,
};

class CommonFlatList extends Component<Props>{
    static defaultProps  = {
        refreshState: RefreshState.Idle,
        onEndReachedThreshold: 0.2,
        nextPage: 1,
        items: [],
        total: 0,
    };
    constructor(props){
        super(props);
    }
    onEndReached(){
        if(parseInt(this.props.total) === this.props.items.length || this.state.isLoadMore){
            return;
        }



        // if(this.cacheReults.items.length === this.cacheReults.total || this.state.isLoadMore){
        //     return
        // }
        //
        // let page = this.cacheReults.nextPage;
        //
        // this.setState({isLoadMore: true});
        // this._requestData(page);
    }
    onHeaderRefresh(){

    }
    renderFooter(){

    }
    render(){
        return (
            <FlatList
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                legacyImplementation={false}
                onEndReached={this.onEndReached.bind(this)}
                onEndReachedThreshold={this.props.onEndReachedThreshold}
                ListFooterComponent={this.renderFooter.bind(this)}
                refreshControl={
                    <RefreshControl
                        refreshing={parseInt(this.props.refreshState) === parseInt(RefreshState.HeaderRefreshing)}
                        onRefresh={this.onHeaderRefresh.bind(this)}
                        tintColor={BackgroundColor.bg_f3916b}
                        colors={[BackgroundColor.bg_f3916b]}
                    />
                }
                { ...this.props }
            />
        );
    }
}

const styles = ScaledSheet.create({
    returnTopText:{
        fontSize: '12@ms',
        color: "#FFFFFF",
    },
    footerContainer: {
        flex: 1,
        flexDirection: 'row',
        padding: '10@ms',
        height: '44@vs',
    }
});

export default CommonFlatList;












