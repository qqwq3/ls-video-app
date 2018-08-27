
import React, {PureComponent} from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    RefreshControl,
    Animated,
} from 'react-native';
import {RefreshState} from '../Constants';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const DEBUG = false;
const log = (text: string) => {
    DEBUG && console.log(text)
};

const footerRefreshingText = '数据加载中…';
const footerFailureText = '点击重新加载';
const footerNoMoreDataText = '已加载全部数据';

type Props = {
    refreshState: number,
    onHeaderRefresh: (refreshState: number) => void,
    onFooterRefresh?: (refreshState: number) => void,
    data: Array<any>,
    footerContainerStyle?: any,
    footerTextStyle?: any,
    onEndReachedThreshold: number,
    showReturnTop?: ?boolean
};

class XingrenFlatList extends PureComponent {
    props: Props;
    constructor(props){
        super(props);
        this.state = {
            isShowBtn: false,
        };
        this.animateds = {
            returnBtn: new Animated.Value(0),
        };
    }
    static defaultProps = {
        onEndReachedThreshold: 0.70,
        showReturnTop: false,
    };
    componentWillUnmount() {
        this.setState = () => {return};
    }
    onHeaderRefresh = () => {
        if (this.shouldStartHeaderRefreshing()) {
            this.props.onHeaderRefresh(RefreshState.HeaderRefreshing);
        }
    };
    onEndReached = (info: any) => {
        if (this.shouldStartFooterRefreshing()) {
            this.props.onFooterRefresh && this.props.onFooterRefresh(RefreshState.FooterRefreshing);
        }
    };
    shouldStartHeaderRefreshing = () => {
        if(this.props.refreshState == RefreshState.HeaderRefreshing || this.props.refreshState == RefreshState.FooterRefreshing) {
            return false;
        }
        return true;
    };
    shouldStartFooterRefreshing = () => {
        let {refreshState, data, totalRecords, offset} = this.props;

        if (!data || data && data.length === 0) {
            return false;
        }

        if(data.length === Number(totalRecords)){
            return false;
        }

        if (totalRecords <= 0 || offset >= totalRecords) {
            return false;
        }

        return (refreshState == RefreshState.Idle);
    };
    animatedFunc(startValue: any,toValue: Number, duration?: ?Number = 500, delay?: ?Number = 0, callBack?: Function => void){
        Animated.timing(startValue,{
            toValue: toValue,
            delay: delay,
            duration: duration,
        }).start(() => callBack && callBack());
    }
    onScroll(e){
        let contentOffsetY = e.nativeEvent.contentOffset && e.nativeEvent.contentOffset.y;
        let animatedReturnBtn = this.animateds.returnBtn;

        if(contentOffsetY <= 0){
            // 隐藏动画
            //this.animatedFunc(animatedReturnBtn,0,500,0,() => { this.setState({isShowBtn: false}) });
        }
        else{
            // 显示动画
            //this.animatedFunc(animatedReturnBtn,1,500,0,() => { this.setState({isShowBtn: true}) });
        }
    }
    render() {
        const { showReturnTop } = this.props;
        const { isShowBtn } = this.state;

        return (
            <View style={{flex:1}}>
                <FlatList
                    ref={'FlatList'}
                    onEndReached={this.onEndReached}
                    onEndReachedThreshold={this.props.onEndReachedThreshold}
                    ListFooterComponent={this.renderFooter}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    legacyImplementation={false}
                    automaticallyAdjustContentInsets={false}
                    onScroll={this.onScroll.bind(this)}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.props.refreshState == RefreshState.HeaderRefreshing}
                            onRefresh={this.onHeaderRefresh}
                            tintColor='rgb(0,117,248)'
                            colors={['rgb(0,117,248)']}
                        />
                    }
                    {...this.props}
                />
                {
                    showReturnTop ?
                    (
                        isShowBtn ?
                        <AnimatedTouchableOpacity
                            activeOpacity={1}
                            onPress={this._returnTop.bind(this)}
                            style={[styles.returnTop,{opacity:this.animateds.returnBtn}]}
                        >
                            <Text style={styles.returnTopText}>返回</Text>
                            <Text style={styles.returnTopText}>顶部</Text>
                        </AnimatedTouchableOpacity> : null
                    ) : null
                }
            </View>
        )
    }
    _returnTop(){
        return this.scrollToOffset ? this.scrollToOffset(0,0,true) : {};
    }
    scrollToOffset(x: Number = 0, y: Number = 0, animated?: ?boolean = false){
        this.refs['FlatList'] ? this.refs['FlatList'].scrollToOffset({x:x,y:y,animated:animated}) : null;
    }
    renderFooter = () => {
        let footer = null;
        let footerContainerStyle = [styles.footerContainer, this.props.footerContainerStyle];
        let footerTextStyle = [styles.footerText, this.props.footerTextStyle];

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
                        <Text style={footerTextStyle}>{footerFailureText}</Text>
                    </TouchableOpacity>
                );
                break;
            }
            case RefreshState.FooterRefreshing: {
                footer = (
                    <View style={footerContainerStyle}>
                        <ActivityIndicator size="small" color="rgb(0,118,248)"/>
                        <Text style={[footerTextStyle, {marginLeft: 7}]}>{footerRefreshingText}</Text>
                    </View>
                );
                break;
            }
            case RefreshState.NoMoreDataFooter: {
                footer = (
                    <View style={footerContainerStyle}>
                        <Text style={footerTextStyle}>{footerNoMoreDataText}</Text>
                    </View>
                );
                break;
            }
        }

        return footer;
    }
}

const styles = StyleSheet.create({
    returnTopText:{
        fontSize:12,
        color:"#FFFFFF",
    },
    returnTop:{
        position:'absolute',
        right:15,bottom:15,
        width:50,height:50,
        backgroundColor:'rgba(0,0,0,0.6)',
        zIndex:200,borderRadius:50,
        alignItems: 'center',
        justifyContent:'center'
    },
    footerContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        height: 44,
    },
    footerText: {
        fontSize: 14,
        color: 'rgb(0,117,248)'
    }
});

export default XingrenFlatList;