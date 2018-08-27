
// 搜索默认页

'use strict';

import React,{ Component } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Image,
    ScrollView,
    Alert
} from 'react-native';
import PropTypes from 'prop-types';
import { width,height,pixel } from '../../common/tool';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import { RefreshState } from "../../Constants";
import {
    searchVideos,
    reloadSearchVideos
} from '../../actions/explore';
import { removeSearchHisory } from "../../common/Storage";

class SearchDefaultPage extends Component<{}>{
    static propTypes = {
        clearHistory: PropTypes.func.isRequired,
        history: PropTypes.array.isRequired,
        reloadSearchContent: PropTypes.func
    };
    static defaultProps = {
        history: [],
        reloadSearchContent: () => {}
    };
    render(){
        return (
            <ScrollView
                style={{flex:1,width:width}}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
            >
                <View>
                    <TouchableOpacity
                        style={styles.searchRow}
                        activeOpacity={1}
                        onPress={this._clearHistory.bind(this)}
                    >
                        <Text style={[styles.searchRowText,{fontSize:15}]}>搜索记录</Text>
                        <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
                            <Image source={require('../imgs/icon_trash.png')} style={styles.searchDel}/>
                            <Text style={styles.searchRowText}>清空</Text>
                        </View>
                    </TouchableOpacity>

                    {
                        (this.props.history !== [] && this.props.history).map((word,index) => {
                            return (
                                <View key={index} style={styles.rows}>
                                    <View style={styles.rowsView}>
                                        <TouchableOpacity activeOpacity={1.0} onPress={this._showVideoList.bind(this,word)} style={styles.rowsClickText}>
                                            <Text style={styles.rowsText}>{word}</Text>
                                        </TouchableOpacity>
                                        {/*<View style={styles.rowsCancel}><Image resizeMode={'contain'} source={require('../imgs/icon_search_close.png')}/></View>*/}
                                    </View>
                                </View>
                            )
                        })
                    }
                </View>

                {/*暂时隐藏-待接口完善后处理*/}
                {/*<View>*/}
                    {/*<View style={styles.searchRow}>*/}
                        {/*<Text style={[styles.searchRowText,{fontSize:15}]}>热门搜索</Text>*/}
                    {/*</View>*/}

                    {/*<View style={styles.labelBox}>*/}
                        {/*<View style={styles.labelView}>*/}
                            {/*<Text style={styles.rowsText}>猎场</Text>*/}
                        {/*</View>*/}
                        {/*<View style={styles.labelView}>*/}
                            {/*<Text style={styles.rowsText}>猎场猎场</Text>*/}
                        {/*</View>*/}
                    {/*</View>*/}
                {/*</View>*/}
            </ScrollView>
        )
    }
    _showVideoList(word){
        if (typeof word !== 'undefined' && word && word.trim()) {
            this.props.reloadSearchVideos(RefreshState.HeaderRefreshing, word.trim(),0);
            this.props.reloadSearchContent();
        }
    }
    async _clearHistory(){
        let removeHistory = await removeSearchHisory();
        this.props.clearHistory();
    }
}

const mapStateToProps = (state, ownProps) => {
    let data = state.getIn(['explore', 'root']);
    if (Immutable.Map.isMap(data)) {
        data = data.toJS();
    }
    return {
        ...ownProps,
        ...data,
    };
};

export default connect(mapStateToProps, {
    searchVideos,
    reloadSearchVideos
})(SearchDefaultPage);

const styles = StyleSheet.create({
    rowsClickText:{
        flex:1,
        height:45,
        justifyContent:'center'
    },
    rowsCancel:{
        height:45,
        width:100,
        justifyContent:'center',
        alignItems:'flex-end',
    },
    rowsView:{
        flex:1,
        justifyContent:'space-between',
        alignItems:'center',
        flexDirection:'row'
    },
    searchRowText:{
        fontSize:13,
        color:'rgb(175,175,192)'
    },
    searchRow:{
        height:40,
        flexDirection:'row',
        alignItems:'center',
        paddingHorizontal:15,
        overflow:'hidden',
        justifyContent:'space-between'
    },
    searchDel:{
        marginRight:5,
        marginTop:-1
    },
    rowsText:{
        fontSize:14,
        color:'rgb(64,64,64)'
    },
    rows:{
        marginHorizontal:15,
        height:45,
        borderBottomColor:'#dcdcdc',
        borderBottomWidth:1/pixel,
        alignItems:'center',
        flexDirection:'row'
    },
    labelView:{
        paddingLeft:0,
        paddingRight:20,
        paddingVertical:10
    },
    labelBox:{
        paddingHorizontal:15,
        paddingBottom:15,
        overflow:'hidden',
        flexDirection:'row',
        flexWrap:'wrap'
    },
});

































