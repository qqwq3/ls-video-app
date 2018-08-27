
'use strict';

import React,{ PureComponent } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import PropTypes from 'prop-types';
import { pixel } from "../../common/tool";
import XingrenFlatList from '../../components/XingrenFlatList';
import { MovieCellInList } from '../Movie/movieCellInList';
import { RefreshState, ICON_PREV_URL } from "../../Constants";

const H = 180;
const iconVideoChange = require('../imgs/icon_video_change.png');

class SectionItem extends PureComponent<{}>{
    static propTypes = {
        sectionMapData: PropTypes.object.isRequired,
        play: PropTypes.func.isRequired,
    };
    constructor(props) {
        super(props);
        this.state = {
            currentData:[],
            currentIndex:0,
            dataMaxLen:0,
        };
    }
    componentWillMount(){
        const {sectionMapData} = this.props;
        if(sectionMapData){
            let data = sectionMapData.data;
            let tempData = [];
            let length = data.length;
            this.state.dataMaxLen = Math.trunc(length/6);
            for(let i=0,len = length;i<len;i+=6){
                tempData.push(data.slice(i,i+6));
            }
            this.setState({currentData:tempData});
        }
    }
    play = (item) => {
        this.props.play(item);
    };
    render() {
        const { sectionMapData } = this.props;
        const { dataMaxLen } = this.state;
        let iconImg = null;
        if (sectionMapData.img) {
            let imgUrl = ICON_PREV_URL + sectionMapData.img;
            iconImg = <Image source={{uri:imgUrl}} style={[styles.hotIcon]} resizeMode={'contain'}/>;
        }

        return (
            <View style={[styles.sectionContainer,{padding:0}]}>
                <View style={[styles.hotContainer,{paddingHorizontal:6}]}>
                    <View style={[styles.headerBoxR]}>
                        {iconImg !== null && iconImg}
                        <Text style={[styles.hotTextStyle]}>{sectionMapData.name}</Text>
                    </View>
                    <TouchableOpacity activeOpacity={1} onPress={this._more.bind(this, sectionMapData)} style={styles.more}>
                        <Text style={styles.moreText}>更多</Text>
                    </TouchableOpacity>
                </View>
                <XingrenFlatList
                    data={this.state.currentData[this.state.currentIndex]}
                    renderItem={({item}) => <MovieCellInList catType={sectionMapData.catType} item={item} onPress={this.play}/>}
                    keyExtractor={item => item.id}
                    columnWrapperStyle={[styles.cloumnWrapperStyle]}
                    getItemLayout={(data, index) => ({length: H, offset: H * index, index})}
                    numColumns={sectionMapData.catType === 4 ? 2 : 3}
                />
                {
                    Number(dataMaxLen) !== 1 ?
                    <View style={[styles.alterContainer]}>
                        <TouchableOpacity activeOpacity={1} onPress={this._another_batch.bind(this, sectionMapData)} style={[styles.batch]}>
                            <Image source={iconVideoChange} resizeMode={'contain'} style={{height:16}}/>
                            <Text style={[styles.batchText]}>换一批更精彩</Text>
                        </TouchableOpacity>
                    </View> : null
                }
            </View>
        );
    }
    _more(param) {
        const { navigate } = this.props.navigation;
        const { reLoadWithFilters, categoryObj } = this.props;
        let id= param.catType;
        let name = param.name;
        let navigateFlag = navigate('InnerIndex', {name,id});
        let defaultNavId = categoryObj && categoryObj.genre && categoryObj.genre[id][1].id;
        navigateFlag && reLoadWithFilters && reLoadWithFilters(RefreshState.HeaderRefreshing, {type: id, genre: defaultNavId});
    }
    _another_batch(){
        let tempIndex = this.state.currentIndex + 1;
        if(tempIndex >= this.state.dataMaxLen){
            tempIndex = 0;
        }
        this.setState({currentIndex:tempIndex});
    }
}

export default SectionItem;

const styles = StyleSheet.create({
    hotIcon: {
        marginRight: 5,
        width: 15,
        height: 15,
        marginTop:2
    },
    batchText:{
        fontSize: 12,
        marginLeft: 6,
        color: 'rgb(175,175,192)'
    },
    batch:{
        flex:1,
        flexDirection: 'row',
        justifyContent:'center',
        alignItems: 'center',
        height:44
    },
    alterContainer: {
        flexDirection: 'row',
        justifyContent:'center',
        height: 44,
        alignItems: 'center',
    },
    cloumnWrapperStyle: {
        justifyContent: 'space-between',
        marginHorizontal:6
    },
    headerBoxR:{
        flexDirection: 'row',
        flex: 1
    },
    sectionContainer: {
        marginTop: 6,
        flexDirection: 'column'
    },
    hotContainer: {
        flexDirection: 'row',
        marginHorizontal: 6,
        height: 44,
        alignItems: 'center',
        borderTopColor: '#dcdcdc',
        borderTopWidth: 1 / pixel
    },
    hotTextStyle: {
        fontSize: 14,
        color: '#404040',
        fontWeight: 'bold',
        fontFamily: 'PingFangSC-Medium',
    },
    more: {
        height: 44,
        width: 150,
        justifyContent: 'flex-end',
        flexDirection: 'row',
        alignItems: 'center',
    },
    moreText: {
        fontSize: 12,
        color: 'rgb(175,175,192)'
    },
});















































