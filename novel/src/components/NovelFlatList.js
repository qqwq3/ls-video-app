
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
    refreshState?: number | string,
    onEndReachedThreshold?: number,
    footerContainerStyle?: Object,
    footerTextStyle?: Object,
};

class NovelFlatList extends Component<Props>{
    static defaultProps  = {
        refreshState: RefreshState.Idle,
        onEndReachedThreshold: 0.2,
    };
    constructor(props){
        super(props);
    }
    onEndReached(){
        if (this.shouldStartFooterRefreshing()) {
            this.props.onFooterRefresh && this.props.onFooterRefresh(RefreshState.FooterRefreshing);
        }
    }
    onHeaderRefresh(){
        if (this.shouldStartHeaderRefreshing()) {
            this.props.onHeaderRefresh && this.props.onHeaderRefresh(RefreshState.HeaderRefreshing);
        }
    }
    renderFooter(){
        let footer = null;
        let footerContainerStyle = [styles.footerContainer, Styles.flexCenter, this.props.footerContainerStyle];
        let footerTextStyle = [Fonts.fontFamily, Colors.orange_f3916b, Fonts.fontSize14, this.props.footerTextStyle];

        switch (this.props.refreshState) {
            case RefreshState.Idle:
                footer = (<View/>);
                break;
            case RefreshState.Failure: {
                footer = (
                    <TouchableOpacity
                        style={footerContainerStyle}
                        onPress={() => {
                            this.props.onFooterRefresh && this.props.onFooterRefresh(RefreshState.FooterRefreshing)
                        }}
                    >
                        <Text style={footerTextStyle}>{ footerFailureText }</Text>
                    </TouchableOpacity>
                );
                break;
            }
            case RefreshState.FooterRefreshing: {
                footer = (
                    <View style={footerContainerStyle}>
                        <Chrysanthemum/>
                        <Text style={[footerTextStyle, {marginLeft: moderateScale(7)}]}>{ footerRefreshingText }</Text>
                    </View>
                );
                break;
            }
            case RefreshState.NoMoreDataFooter: {
                footer = (
                    <View style={footerContainerStyle}>
                        <Text style={footerTextStyle}>{ footerNoMoreDataText }</Text>
                    </View>
                );
                break;
            }
        }

        return footer;
    }
    shouldStartHeaderRefreshing (){
        if(parseInt(this.props.refreshState) === parseInt(RefreshState.HeaderRefreshing)
            || parseInt(this.props.refreshState) === parseInt(RefreshState.FooterRefreshing)) {
            return false;
        }
        return true;
    }
    shouldStartFooterRefreshing = () => {
        let { refreshState, data, totalRecords, offset } = this.props;

        if (!data || (data && data.length === 0)) {
            return false;
        }

        let intTotalRecords = parseInt(totalRecords);
        if(data.length === intTotalRecords){
            return false;
        }

        let intOffset = parseInt(offset);
        if (intTotalRecords <= 0 || intOffset >= intTotalRecords) {
            return false;
        }

        return (refreshState === RefreshState.Idle);
    };
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
        height: '44@vs',
    }
});

export default NovelFlatList;












