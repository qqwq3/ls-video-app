'use strict';

import React from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Animated,
    Easing
} from 'react-native';
import { connect } from 'react-redux';
import { withNavigationFocus } from 'react-navigation-is-focused-hoc';
import PropTypes from 'prop-types';
import Immutable from 'immutable';
import ImageLoad from 'react-native-image-placeholder';
import Toast from 'react-native-root-toast';
import { loadHistories, reloadHistories, deleteHistory, editStatus } from "../../actions/history";
import { RefreshState } from "../../Constants";
import HeaderBox from '../../common/HeaderBox';
import RightElement from './RightElement';
import NoData from '../Common/NoData';
import { width, height, pixel, statusBarSetPublic, isLogout } from "../../common/tool";
import FooterPrompt from '../Common/FooterPrompt';
import ListControl from '../Common/ListControl';
import XingrenFlatList from '../../components/XingrenFlatList';

const util = require('../../common/Util');
const cellInListHeight = 120;

class HistoryScreen extends React.Component {
    static propTypes = {
        offset: PropTypes.number.isRequired,
        records: PropTypes.arrayOf(PropTypes.object),
        refreshState: PropTypes.number.isRequired,
    };
    static defaultProps = {
        records: [],
        refreshState: RefreshState.Idle,
        offset: 0,
    };
    constructor(props) {
        super(props);
        this.state = {
            footerButsAnimatedStartValue: new Animated.Value(0),
            animatedStatus: false,
            recordsData: [],
            timeStatus: false,
        };
    }
    onHeaderRefresh = (refreshState) => {
        this.props.reloadHistories(refreshState);
    };
    onFooterRefresh = (refreshState) => {
        let currentOffset = this.props.offset;
        this.props.loadHistories(refreshState, currentOffset);
    };
    componentWillMount(){
        statusBarSetPublic('#FFFFFF','dark-content',true);
    }
    componentDidMount() {
        this.onHeaderRefresh(RefreshState.HeaderRefreshing);
    }
    componentWillReceiveProps(nextProps) {
        // 进入本组件的一些处理
        if (!this.props.isFocused && nextProps.isFocused) {
            this.onHeaderRefresh(RefreshState.HeaderRefreshing);
            this.setState({timeStatus: true});
        }

        // 离开本组件的一些处理
        if (this.props.isFocused && !nextProps.isFocused) {
            this.setState({timeStatus: false});
        }
    }
    _editFunc(){
        const { footerButsAnimatedStartValue,animatedStatus } = this.state;
        this.setState({animatedStatus: !animatedStatus});
        this._animated(50,footerButsAnimatedStartValue);

        //this.onHeaderRefresh(RefreshState.HeaderRefreshing);
    }
    _cancelFunc(){
        const { footerButsAnimatedStartValue,animatedStatus } = this.state;
        this.setState({animatedStatus: false});
        this._animated(0,footerButsAnimatedStartValue,100);

        //this.onHeaderRefresh(RefreshState.HeaderRefreshing);
    }
    _animated(value: number,startValue: any,duration: 400,easing: Easing.linear){
        let obj = { toValue: value, duration: duration, easing: easing };
        return Animated.timing(startValue,obj).start();
    }
    _butAllSelectFun(){
        Alert.alert('全选');
    }
    _butDeleteFun(){
        const { footerButsAnimatedStartValue, animatedStatus } = this.state;
        Alert.alert('删除');
        //this._animated(0,footerButsAnimatedStartValue,100);
    }
    // 去播放
    play(item) {
        const { navigate } = this.props.navigation;
        let hexId = item && item.hexId,
            episode = item && item.src && item.src.episode;
        return navigate('MoviePlayScreen', {code: hexId, episode: episode});
    }
    // 删除单行
    _rowDelete(item){
        const { deleteHistory } = this.props;
        let movieId = item && item.movieId,
            serialsSrcId = item && item.serialsSrcId;

        deleteHistory && deleteHistory(movieId, serialsSrcId);
        Toast.show('删除成功',{duration: 2000});
    }
    // 返回
    _goBack() {
        const { goBack } = this.props.navigation;
        return goBack();
    }
    // 去登录
    _goLogin(){
        const { navigate } = this.props.navigation;
        return navigate('Login');
    }
    // 列表渲染
    _renderItem({item, index}){
        return (
            <ListControl
                timeStatus={this.state.timeStatus}
                history={true}
                item={item}
                play={this.play.bind(this,item)}
                rowDelete={this._rowDelete.bind(this,item)}
            />
        );
    }
    _getItemLayout(item, index){
        return {length: cellInListHeight, offset: cellInListHeight * index, index};
    }
    render() {
        const { records, totalRecords, offset, refreshState } = this.props;
        const { footerButsAnimatedStartValue, animatedStatus } = this.state;
        const iconHistory = require('../imgs/default/history.png');
        const _isLogout = isLogout(this.props);

        return (
            <View style={styles.container}>
                <HeaderBox
                    isText={true}
                    text={'历史记录'}
                    isArrow={true}
                    goBack={this._goBack.bind(this)}
                    //isEdit={true}
                    //rightElement={(recordsArr.length === 0) ? null : <RightElement cancelFunc={this._cancelFunc.bind(this)} editFunc={this._editFunc.bind(this)}/>}
                />
                {
                    !_isLogout ?
                    (
                        (records && (Object.keys(records)).length > 0) ?
                        <XingrenFlatList
                            data={records}
                            renderItem={this._renderItem.bind(this)}
                            keyExtractor={item => item.id}
                            //getItemLayout={this._getItemLayout.bind(this)}
                            columnWrapperStyle={styles.rowStyle}
                            onHeaderRefresh={this.onHeaderRefresh}
                            onFooterRefresh={this.onFooterRefresh}
                            refreshState={refreshState}
                            numColumns={1}
                            totalRecords={totalRecords}
                            offset={offset}
                            showReturnTop={true}
                        />  :
                        <NoData
                            source={iconHistory}
                            isText={true}
                            text={'暂无历史内容'}
                        />
                    ) :
                    <NoData
                        isBtn={true}
                        btnText={'去登录吧'}
                        btnClickFunc={this._goLogin.bind(this)}
                        source={iconHistory}
                        isText={true}
                        text={'亲，登录后观看历史记录哦！'}
                    />
                }
                {/*<Animated.View style={{height:footerButsAnimatedStartValue}}>*/}
                    {/*<FooterPrompt*/}
                        {/*isButton={true}*/}
                        {/*butDeleteText={'删除'}*/}
                        {/*butAllSelectFun={this._butAllSelectFun.bind(this)}*/}
                        {/*butDeleteFun={this._butDeleteFun.bind(this)}*/}
                    {/*/>*/}
                {/*</Animated.View>*/}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
});

const mapStateToProps = (state, ownProps) => {
    const data = state.getIn(['history', 'root']);
    const userData = state.getIn(['user']);

    return {
        ...ownProps,
        ...(Immutable.Map.isMap(data) ? data.toJS() : data),
        ...(Immutable.Map.isMap(userData) ? userData.toJS() : userData),
    };
};

export default withNavigationFocus(connect(mapStateToProps, {
    loadHistories,
    reloadHistories,
    deleteHistory,
    editStatus
})(HistoryScreen));