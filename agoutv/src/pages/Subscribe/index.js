'use strict';

import React from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Alert
} from 'react-native';
import {connect} from 'react-redux';
import XingrenFlatList from '../../components/XingrenFlatList';
import PropTypes from 'prop-types';
import Immutable from 'immutable';
import Swipeout from 'react-native-swipeout';
import TabBarIcon from '../../common/TabBarIcon';
import {
    loadSubscribes,
    reloadSubscribes,
    deleteSubscribe,
    loadSubscribeSession
} from "../../actions/subscribe";
import {RefreshState} from "../../Constants";
import ImageLoad from 'react-native-image-placeholder';
import NoData from '../Common/NoData';
import {width,height,pixel} from "../../common/tool";
import HeaderBox from '../../common/HeaderBox';

const util = require('../../common/Util');

class SubscribeScreen extends React.Component {
    static navigationOptions = {
        tabBarIcon: ({focused}) => (
            <TabBarIcon
                focused={focused}
                defaultIcon={require('../imgs/tab_subscribe_unsel.png')}
                activeIcon={require('../imgs/tab_subscribe_sel.png')}
            />
        ),
        tabBarLabel: '订阅',
        header: null
    };
    static propTypes = {
        offset: PropTypes.number.isRequired,
        records: PropTypes.arrayOf(PropTypes.object),
        refreshState: PropTypes.number.isRequired,
    };
    static defaultProps = {
        records: [],
        refreshState: RefreshState.Idle,
        offset: 0
    };
    constructor(props) {
        super(props);
        this.state = {
            dataStatus: false,
            records: this.props.records,
        };
    }
    onHeaderRefresh = (refreshState) => {
        this.props.reloadSubscribes(refreshState);
    };
    onFooterRefresh = (refreshState) => {
        let currentOffset = this.props.offset;
        this.props.loadSubscribes(refreshState, currentOffset);
    };
    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.updateTime !== this.props.updateTime;
    }
    componentWillReceiveProps(nextProps) {
        const {records} = this.props;
        if(nextProps.records !== records){
            this.setState({records: nextProps.records});
        }
    }
    componentWillMount() {
        const {records,loadSubscribeSession} = this.props;
        if (!records || records.length === 0) {this.onHeaderRefresh(RefreshState.HeaderRefreshing)}
        if (records && records.length > 0) {loadSubscribeSession && loadSubscribeSession()}
    }
    componentDidMount() {
        // const {records,subScribeSession} = this.props;
        //
        // if(subScribeSession){
        //     this.setState({records: subScribeSession});
        // }
        // else{
        //     this.setState({records: records});
        // }
    }
    deleteSubscribeItem(item) {
        this.props.deleteSubscribe(item.movieId);
    }
    play(item) {
        const {navigate} = this.props.navigation;

        //console.log('dsssss',item);

        navigate('MoviePlayScreen', {code: item.hexId, episode: item.latestSerialsSrc.episode});
    }
    _goBack(){
        const { goBack } = this.props.navigation;
        return goBack();
    }
    render() {
        const {records} = this.state;
        const {userData} = this.props;
        let userStatus = (userData && (userData !== undefined)) || false;

        //console.log('订阅列表',records,this.props);

        return (
            <View style={styles.container}>
                <HeaderBox isText={true} text={'我的订阅'} isArrow={true} goBack={this._goBack.bind(this)}/>
                {
                    userStatus ?
                    ((records && records.length > 0) ?
                        <XingrenFlatList
                            data={records}
                            renderItem={({item}) => <SubscribeItor item={item} deleteSubscribeCallBack={(item) => this.deleteSubscribeItem(item)} play={(item) => this.play(item)}/>}
                            keyExtractor={item => item.id}
                            getItemLayout={(data, index) => ({length: cellInListHeight, offset: cellInListHeight * index, index})}
                            onHeaderRefresh={this.onHeaderRefresh}
                            onFooterRefresh={this.onFooterRefresh}
                            refreshState={this.props.refreshState}
                            numColumns={1}
                            totalRecords={this.props.totalRecords}
                            offset={this.props.offset}
                        /> :
                        <NoData source={require('../imgs/subscribe.png')} isText={true} text={'亲，还没订阅哦，去订阅吧！'}/>
                    ) :
                    <NoData
                        isBtn={true}
                        btnText={'去登录吧'}
                        btnClickFunc={this._goBack.bind(this)}
                        source={require('../imgs/subscribe.png')}
                        isText={true}
                        text={'亲，登录后观看订阅哦！'}
                    />
                }
            </View>
        );
    }
}

const cellInListHeight = 130;

class SubscribeItor extends React.Component {
    static propTypes = {
        item: PropTypes.object.isRequired,
        deleteSubscribeCallBack: PropTypes.func.isRequired,
        play: PropTypes.func.isRequired,
    };
    constructor(props) {
        super(props);
    }
    deleteSubscribeSelf = () => {
        this.props.deleteSubscribeCallBack(this.props.item);
    };
    play = () => {
        this.props.play(this.props.item);
    };
    render() {
        let {item} = this.props;

        return (
            <View style={styles.swipeoutBox}>
                <Swipeout
                    style={styles.swipeout}
                    autoClose={true}
                    right={[{backgroundColor:'red', component: <DeleteButton/>, onPress: this.deleteSubscribeSelf}]}
                    buttonWidth={90}
                >
                    <TouchableOpacity
                        style={styles.swipeoutTouchable}
                        onPress={this.play}
                        activeOpacity={1}
                    >
                        <ImageLoad
                            source={{uri: item.cover}}
                            style={styles.imageLoad}
                            customImagePlaceholderDefaultStyle={{height: 60, width: 60,justifyContent: 'center'}}
                            isShowActivity={false}
                            placeholderSource={require('../imgs/default_film_cover.png')}
                            borderRadius={2}
                        />
                        <View style={styles.swipeoutContentText}>
                            <Text style={styles.swipeoutTitle}>{item.title}</Text>
                            <View style={{flexDirection:"row"}}>
                                <Text style={[styles.smallText,{marginRight:10}]}>更新至</Text>
                                <Text style={styles.smallText}>第{item.latestSerialsSrc.episode}集</Text>
                            </View>
                            <Text style={styles.smallText}>{item.duration}</Text>
                            <Text style={styles.smallText}>时间：{util.tsToDateFormat(item.movieLastUpdated, 'yyyy-MM-dd')}</Text>
                        </View>
                    </TouchableOpacity>
                </Swipeout>
                <View style={styles.line}/>
            </View>
        );
    }
}

class DeleteButton extends React.PureComponent<{}>{
    render(){
        return (
            <View style={styles.deleteButton}>
                <Text style={styles.deleteButtonText}>删除</Text>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    smallText:{
        fontSize:13,
        color:'rgb(175,175,192)'
    },
    swipeoutTitle:{
        fontSize: 14,
        fontWeight:'bold',
        fontFamily: 'PingFangSC-Semibold',
        color: 'rgb(64,64,64)'
    },
    deleteButton:{
        backgroundColor:'red',
        justifyContent:'center',
        alignItems:'center',
        flex:1
    },
    deleteButtonText:{
        fontSize:16,
        color:'#ffffff'
    },
    swipeoutContentText:{
        flex: 1,
        paddingLeft:10,
        justifyContent:'space-between',
        paddingTop:10
    },
    line:{
        position:'absolute',
        width:width-10,
        left:10,
        bottom:0,
        height:1,
        borderBottomColor: '#dcdcdc',
        borderBottomWidth: 1/pixel
    },
    swipeoutBox:{
        position:'relative',
        flexDirection:'column'
    },
    swipeout:{
        backgroundColor:'#ffffff',
        paddingHorizontal:10
    },
    imageLoad:{
        height: 110,
        width: 80,
        marginTop:10
    },
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    swipeoutTouchable:{
        flexDirection: 'row',
        paddingBottom:10
    },
});

const mapStateToProps = (state, ownProps) => {
    const data = state.getIn(['subscribe', 'root']);
    let userSessionData = state.getIn(['user']);
    const pData = state.getIn(['subscribe']);

    return {
        ...ownProps,
        ...(Immutable.Map.isMap(data) ? data.toJS() : data),
        ...(Immutable.Map.isMap(pData) ? pData.toJS() : pData),
        ...(Immutable.Map.isMap(userSessionData) ? userSessionData.toJS() : userSessionData)
    };
};

export default connect(
    mapStateToProps, {
        loadSubscribes,
        reloadSubscribes,
        deleteSubscribe,
        loadSubscribeSession
    })(SubscribeScreen);