'use strict';

import React from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Alert
} from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Immutable from 'immutable';
import { withNavigationFocus } from 'react-navigation-is-focused-hoc';
import { loadCollections, reloadCollections, deleteCollection } from "../../actions/collection";
import { RefreshState } from "../../Constants";
import HeaderBox from '../../common/HeaderBox';
import NoData from '../Common/NoData';
import ListControl from '../Common/ListControl';
import { statusBarSetPublic, isLogout } from "../../common/tool";
import XingrenFlatList from '../../components/XingrenFlatList';

const cellInListHeight = 120;

class CollectionScreen extends React.Component {
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
            currentData: []
        };
    }
    onHeaderRefresh = (refreshState) => {
        this.props.reloadCollections(refreshState);
    };
    onFooterRefresh = (refreshState) => {
        let currentOffset = this.props.offset;
        this.props.loadCollections(refreshState, currentOffset);
    };
    componentWillMount(){
        statusBarSetPublic && statusBarSetPublic('#FFFFFF','dark-content',true);
    }
    componentDidMount() {
        this.onHeaderRefresh(RefreshState.HeaderRefreshing);
    }
    componentWillReceiveProps(nextProps) {
        // 进入本组件的一些处理
        if (!this.props.isFocused && nextProps.isFocused) {
            this.onHeaderRefresh(RefreshState.HeaderRefreshing);
        }

        // 离开本组件的一些处理
        if (this.props.isFocused && !nextProps.isFocused) {

        }
    }
    // 去播放
    play(item) {
        const { navigate } = this.props.navigation;
        let movieIdHex = item && item.movieIdHex,
            episode = item && item.src && item.src.episode;
        return navigate('MoviePlayScreen', {code: movieIdHex, episode: episode});
    }
    // 返回
    _goBack() {
        const { goBack } = this.props.navigation;
        return goBack();
    }
    // 删除单行
    _rowDelete(item,index){
        const { deleteCollection } = this.props;
        let movieId = item && item.movieId,
            serialsSrcId = item && item.serialsSrcId;

        return deleteCollection(movieId, serialsSrcId);
    }
    // 去登录
    _goLogin(){
        const { navigate } = this.props.navigation;
        return navigate('Login');
    }
    // 渲染
    _renderItem({item,index}){
        return (
            <ListControl
                collection={true}
                item={item}
                play={this.play.bind(this,item)}
                rowDelete={this._rowDelete.bind(this,item,index)}
            />
        );
    }
    _getItemLayout(item, index){
        return { length: cellInListHeight, offset: cellInListHeight * index, index };
    }
    render() {
        const { records, totalRecords, offset, refreshState } = this.props;
        const iconHistory = require('../imgs/default/like.png');
        const _isLogout = isLogout(this.props);

        return (
            <View style={styles.container}>
                <HeaderBox isText={true} text={'我的收藏'} isArrow={true} goBack={this._goBack.bind(this)}/>
                {
                    !_isLogout ?
                    (
                        (records && (Object.keys(records)).length > 0) ?
                            <XingrenFlatList
                                data={records}
                                renderItem={this._renderItem.bind(this)}
                                keyExtractor={item => item.id}
                                //getItemLayout={this._getItemLayout.bind(this)}
                                onHeaderRefresh={this.onHeaderRefresh}
                                onFooterRefresh={this.onFooterRefresh}
                                refreshState={refreshState}
                                totalRecords={totalRecords}
                                offset={offset}
                                showReturnTop={true}
                            /> :
                            <NoData source={iconHistory} isText={true} text={'暂无收藏内容'}/>
                    ) :
                    <NoData
                        isBtn={true}
                        btnText={'去登录吧'}
                        btnClickFunc={this._goLogin.bind(this)}
                        source={iconHistory}
                        isText={true}
                        text={'亲，登录后观看收藏哦！'}
                    />
                }
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    }
});

const mapStateToProps = (state, ownProps) => {
    const data = state.getIn(['collection', 'root']);
    const userData = state.getIn(['user']);

    return {
        ...ownProps,
        ...(Immutable.Map.isMap(data) ? data.toJS() : data),
        ...(Immutable.Map.isMap(userData) ? userData.toJS() : userData),
    };
};

export default withNavigationFocus(connect(mapStateToProps, {
    loadCollections,
    reloadCollections,
    deleteCollection
})(CollectionScreen));