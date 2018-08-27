
// 分类二级菜单组件

'use strict';

import React,{ PureComponent } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Dimensions,
    PixelRatio,
    FlatList
} from 'react-native';
import PropTypes from 'prop-types';

const {width, height} = Dimensions.get('window');
const pixel = PixelRatio.get();

class FilterPanel extends PureComponent<{}>{
    render(){
        return (
            <View style={styles.filterContent}>
                <FilterSingle/>
            </View>
        )
    }
}

const records = [
    {title: '全部',key:0},
    {title: '内地',key:1},
    {title: '欧美',key:2}
];

class FilterSingle extends PureComponent<{}>{
    render(){

        return (
            <View style={styles.filterSingle}>
                <FlatList
                    keyExtractor={item => item.id}
                    data={records}
                    renderItem={this._renderItem.bind(this)}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    style={styles.filterSingleFlatList}
                    horizontal={true}
                />
            </View>
        );
    }
    _renderItem({item,index}){

        return (
            <TouchableOpacity
                accessible={true}
                style={styles.headerWr}
                onPress={this._select.bind(this)}
                activeOpacity={0.75}
            >
                <View style={[styles.headerWrView,styles.headerWrViewBorder]}>
                    <Text style={styles.headerWrText}>{item.title}</Text>
                </View>
            </TouchableOpacity>
        );
    }
    _select(){

    }
}

export default FilterPanel;

const styles = StyleSheet.create({
    headerWrView:{
        height: 25,
        paddingHorizontal:15,
        alignItems:'center',
        flexDirection:'row'
    },
    headerWrViewBorder:{
        borderRadius: 25,
        borderWidth: 0.5,
        borderColor:'rgb(0,117,248)'
    },
    headerWrText:{
        fontSize:12,
        color:'rgb(175,175,192)'
    },
    headerWr:{
        height:40,
        flexDirection:'row',
        alignItems:'center'
    },
    filterContent:{
        height:160,
        borderBottomColor:'#dcdcdc',
        borderBottomWidth:1/pixel,
        marginHorizontal:6,
        marginBottom:6,
    },
    filterSingle:{
        height: 40,
        flexDirection:'row'
    },
    filterSingleFlatList:{

    },
});



















































