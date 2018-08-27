//收入排行榜
'use strict';

import React,{ Component } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, ImageBackground, StatusBar, Image } from 'react-native';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import HeaderBox from '../../common/HeaderBox';
import { width, height, pixel, statusBarSetPublic, money } from "../../common/tool";
import XingrenFlatList from '../../components/XingrenFlatList';
import { RefreshState } from "../../Constants";
import { SCREEN_WIDTH } from "../../common/Util";
import { incomeRank } from '../../actions/wallet'

const util = require('../../common/Util');
const cellInListHeight = 120;

const images = {
    rankMainImg: require('../imgs/incomeRanking/rank_main_img.png'),
    iconCrown1: require('../imgs/incomeRanking/icon_crown_no.1.png'),
    iconCrown2: require('../imgs/incomeRanking/icon_crown_no.2.png'),
    iconCrown3: require('../imgs/incomeRanking/icon_crown_no.3.png'),
};

class IncomeRanking extends Component{
    static propTypes = {
        offset: PropTypes.number.isRequired,
        records: PropTypes.arrayOf(PropTypes.object),
        refreshState: PropTypes.number.isRequired,
    };
    static defaultProps = {
        refreshState: RefreshState.Idle,
        offset: 0,
    };
    constructor(props){
        super(props)
        this.state={
            tabValue:0,
            weekRecords: [],
            allRecords:[],
        }
    }
    componentWillMount() {
        //加载数据
        this.props.incomeRank && this.props.incomeRank('week');
        statusBarSetPublic('purple','light-content',true);
    }
    componentWillReceiveProps(nextProps) {
        if(this.props !== nextProps && nextProps.rank){
            console.log('nextProps:',nextProps);
            if(nextProps.rank.week){
                this.setState({weekRecords:nextProps.rank.week.data.records});
            }
            if(nextProps.rank.all){
                this.setState({allRecords:nextProps.rank.all.data.records});
            }
        }
    }
    componentWillUnmount() {
        statusBarSetPublic('rgb(0,117,248)','light-content',true);
    }
    _goBack(){
        const {goBack} = this.props.navigation;
        return goBack();
    }
    _switchTab(index){
        this.setState({tabValue:index});
        const {allRecords} = this.state;
        if(index === 1 && allRecords !== [] && allRecords.length === 0){
            this.props.incomeRank && this.props.incomeRank('all');
        }
    }
    onHeaderRefresh = (refreshState) => {
        // this.props.reloadHistories(refreshState);
    };
    onFooterRefresh = (refreshState) => {
        // let currentOffset = this.props.offset;
        // this.props.loadHistories(refreshState, currentOffset);
    };
    _getItemLayout(item, index){
        return {length: cellInListHeight, offset: cellInListHeight * index, index};
    }
    // 列表渲染
    _renderItem({item, index}){
        let isColor = index%2;
        let num = index + 1;
        return (
            <View style={[styles.itemBox,isColor === 0?{}:{backgroundColor:'#F2F8FE'}]}>
                <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
                    {num === 1?<Image source={images.iconCrown1}/>:null}
                    {num === 2?<Image source={images.iconCrown2}/>:null}
                    {num === 3?<Image source={images.iconCrown3}/>:null}
                    {num > 3 ? <Text>{num}</Text>:null }
                </View>

                <View style={{flex:1,alignItems:'center'}}>
                    <Image style={{width:40,height:40,borderRadius:40}} source={{uri:item.avatar}} />
                </View>
                <View style={{flex:1,alignItems:'center'}}>
                    <Text style={[styles.fontFamily,styles.contenText]}>{item.uid}</Text>
                </View>
                <View style={{flex:1,alignItems:'center'}}>
                    <Text>{item.inviteCount}</Text>
                </View>
                <View style={{flex:1,alignItems:'center'}}>
                    <Text>{ money(item.incomeMoney) }</Text>
                </View>
            </View>
        );
    }
    _titleRender(){
        const {tabValue} = this.state;
        // let
        return(
            <View style={styles.titleBox}>
                <TouchableOpacity
                    style={[styles.titleBtn,]}
                    onPress={()=>this._switchTab(0)}
                >
                    <View>
                        <Text style={[tabValue === 0?{color:'#0076f8'}:{color:'#afafc0'},styles.fontFamily,{fontSize:16}]}>周排行</Text>
                        {
                            tabValue === 0? <View style={styles.lineSty}></View>:null
                        }
                    </View>
                </TouchableOpacity>
                <View style={{borderRightColor:'#dcdcdc',borderRightWidth:1,height:30,marginTop:10}}/>
                <TouchableOpacity
                    style={styles.titleBtn}
                    onPress={()=>this._switchTab(1)}
                >
                    <View>
                        <Text style={[tabValue === 1?{color:'#0076f8'}:{color:'#afafc0'},styles.fontFamily,{fontSize:16}]}>总排行</Text>
                        {
                            tabValue === 1? <View style={styles.lineSty}></View>:null
                        }
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
    _contentRender(){
        const { weekRecords, allRecords } = this.state;
        let totalRecords = 17;
        const { tabValue } = this.state;
        const { refreshState, offset } = this.props;

        return(
            <View style={styles.contentBox}>
                <View style={styles.contenTitleBox}>
                    <View style={{flex:1,alignItems:'center'}}><Text style={styles.contenTitle}>排名</Text></View>
                    <View style={{flex:1,alignItems:'center'}}><Text style={styles.contenTitle}>头像</Text></View>
                    <View style={{flex:1,alignItems:'center'}}><Text style={styles.contenTitle}>用户ID</Text></View>
                    <View style={{flex:1,alignItems:'center'}}><Text style={styles.contenTitle}>好友数</Text></View>
                    <View style={{flex:1,alignItems:'center'}}><Text style={styles.contenTitle}>总收入</Text></View>
                </View>
                <View style={{flex:1,marginBottom:10}}>
                    {tabValue === 0 ?
                        <XingrenFlatList
                            data={weekRecords}
                            renderItem={this._renderItem.bind(this)}
                            keyExtractor={(item, index) => index}
                            //getItemLayout={this._getItemLayout.bind(this)}
                            onHeaderRefresh={this.onHeaderRefresh}
                            onFooterRefresh={this.onFooterRefresh}
                            refreshState={refreshState}
                            numColumns={1}
                            totalRecords={totalRecords}
                            offset={offset}
                            showReturnTop={true}
                        /> :
                        <XingrenFlatList
                            data={allRecords}
                            renderItem={this._renderItem.bind(this)}
                            keyExtractor={(item, index) => index}
                            //getItemLayout={this._getItemLayout.bind(this)}
                            onHeaderRefresh={this.onHeaderRefresh}
                            onFooterRefresh={this.onFooterRefresh}
                            refreshState={refreshState}
                            numColumns={1}
                            totalRecords={totalRecords}
                            offset={offset}
                            showReturnTop={true}
                        />
                    }
                </View>
            </View>
        );
    }
    // 头部 - demo
    renderHeader(){
        return (
            <ImageBackground source={images.rankMainImg} style={{width:'100%',height:260}}>
                <HeaderBox
                    isText={true}
                    arrowColor={'#FFF'}
                    backgroundColor={'transparent'}
                    text={'收入排行榜'}
                    titleColor={'#FFF'}
                    borderBottomColor={'transparent'}
                    isArrow={true}
                    goBack={this._goBack.bind(this)}
                />
            </ImageBackground>
        );
    }
    render(){
        return(
            <View  style={styles.content}>
                { this.renderHeader() }
                <View style={{flex:1,marginTop:-55,position:'relative',zIndex:100}}>
                    <View style={[styles.rankBox]}>
                        {this._titleRender()}
                        {this._contentRender()}
                    </View>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    content:{
        flex:1,
        backgroundColor:'#fff'
    },
    contenText:{
      fontSize:14,
      color:'#404040',
    },
    itemBox:{
       height:50,
        flexDirection:'row',
        justifyContent:'space-around',
        alignItems:'center',
    },
    contenTitleBox:{
        flexDirection:'row',
        justifyContent:'space-around',
        alignItems:'center',
        height:50,
        borderBottomWidth:1/pixel,
        borderBottomColor:'#afafc0'
    },
    contenTitle:{
        color:'#404040',
        fontSize:14,
    },
    fontFamily: {
        fontFamily: 'PingFangSC-Medium',
    },
    lineSty:{
      height:3,
      backgroundColor:'#0076f8',
      marginTop:5,
    },
    titleBtn:{
        flex:1,
        // borderWidth:1,
        // borderColor:'red',
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center'
    },
    contentBox:{
        flex:1,
    },
    titleBox:{
        height:50,
        backgroundColor:'#fff',
        flexDirection:'row',
        justifyContent:'space-around',
        marginTop:6,
    },
    rankBox:{
        flex:1,
        backgroundColor:'#fff',
        width: util.SCREEN_WIDTH-20,
        marginLeft:10,
        borderRadius:6,
        marginBottom:-10,
        elevation:4
    }
});

const mapStateToProps = (state, ownProps) => {
    let data = state.getIn(['wallet']);

    if (Immutable.Map.isMap(data)) {data = data.toJS()}

    return { ...ownProps, ...data };
};

export default connect(mapStateToProps, {incomeRank})(IncomeRanking);

