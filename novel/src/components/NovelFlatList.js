
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
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

type Props = {
    refreshState?: number | string,
    onEndReachedThreshold?: number,
    footerContainerStyle?: Object,
    footerTextStyle?: Object,
    showArrow?: boolean,
};

class NovelFlatList extends Component<Props>{
    static defaultProps  = {
        refreshState: RefreshState.Idle,
        onEndReachedThreshold: 0.7,
        showArrow: false,
    };
    constructor(props){
        super(props);
        this.state = {
            showArrow: false,
        };
        this.animateds = {
            opacity: new Animated.Value(0),
        };
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
    onMomentumScrollEnd(e){
        const { y } = e.nativeEvent.contentOffset;

        // 关闭置顶按钮
        if(y === 0){
            this.animatedClose();
        }
        // 打开置顶按钮
        else{
            this.animatedOpen();
        }
    }
    onScrollEndDrag(e){
        const { y } = e.nativeEvent.contentOffset;

        // 关闭置顶按钮
        if(y === 0){
            this.animatedClose();
        }
        // 打开置顶按钮
        else {
            this.animatedOpen();
        }
    }
    // 关闭动画 - function
    animatedClose(){
        Animated.spring(this.animateds.opacity, {
            toValue: 0,
        }).start(() => {
            this.setState({showArrow: false});
        });
    }
    // 动画打开 - function
    animatedOpen(){
        this.setState({showArrow: true});

        Animated.spring(this.animateds.opacity, {
            toValue: 1,
        }).start(() => {

        });
    }
    returnTop(){
        this.setState({showArrow: false});
        this.flatListRef && this.flatListRef.scrollToOffset(0, true);
    }
    render(){
        return (
            <View style={[styles.container]}>
                <FlatList
                    ref={ref => this.flatListRef = ref}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    legacyImplementation={false}
                    onEndReached={this.onEndReached.bind(this)}
                    onEndReachedThreshold={this.props.onEndReachedThreshold}
                    ListFooterComponent={this.renderFooter.bind(this)}
                    onMomentumScrollEnd={this.onMomentumScrollEnd.bind(this)}
                    onScrollEndDrag={this.onScrollEndDrag.bind(this)}
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
                {
                    (this.props.showArrow && this.state.showArrow) ?
                        <AnimatedTouchableOpacity
                            activeOpacity={0.50}
                            style={[styles.returnTopBox, Styles.flexCenter, {opacity: this.animateds.opacity}]}
                            onPress={this.returnTop.bind(this)}
                        >
                            <Text style={[
                                Fonts.fontFamily,
                                Fonts.fontSize16,
                                Colors.white_FFF
                            ]}>
                                { '\u21E7' }
                            </Text>
                        </AnimatedTouchableOpacity> : null
                }
            </View>
        );
    }
}

const styles = ScaledSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
    returnTopText:{
        fontSize: '12@ms',
        color: "#FFFFFF",
    },
    footerContainer: {
        flex: 1,
        flexDirection: 'row',
        height: '44@vs',
    },
    returnTopBox: {
        zIndex: 1000,
        position: 'absolute',
        right: '15@ms',
        bottom: '15@ms',
        width: '40@s',
        height: '40@vs',
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: '40@ms'
    }
});

export default NovelFlatList;












