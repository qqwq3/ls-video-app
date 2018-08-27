
/*综艺剧集选择*/

'use strict';

import React,{PureComponent} from 'react';
import {StyleSheet, Text, View, TouchableOpacity, FlatList} from 'react-native';
import _ from 'lodash';
import {width,height,pixel} from "../../common/tool";

type Props = {
    selectNode?: Function,
    putType?: string
};

class VarietySelect extends PureComponent<Props>{
    constructor(Props){
        super(Props);
        this.state = {
            selectNode: this.props.episode,
        };
        this.dataArr = [];
    }
    static defaultProps = {
        selectNode: () => {},
        putType: 'horizontal' //horizontal,vertical
    };
    componentWillReceiveProps(nextProps) {
        if(nextProps.defaultNode !== null && nextProps.defaultNode !== this.state.selectNode){
            this.setState({selectNode: nextProps.defaultNode});
        }
    }
    _data(){
        const {video} = this.props;
        const _video = video && (video !== undefined);
        const playLinkObj = _video && video.playLink;
        const _data = this.dataArr.slice();
        let k = Object.values(playLinkObj);
        let _k = _.reverse(k);

        _k.map((item,index) => {_data.push({key:index,obj:item});});
        return _data;
    }
    render(){
        const {putType} = this.props;
        let data = this._data();

        return (
            putType === 'horizontal' ?
            <FlatList
                style={styles.flatList}
                data={data}
                renderItem={this._renderItem.bind(this)}
                horizontal={true}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{paddingRight:20}}
            /> :
            <FlatList
                data={data}
                renderItem={this._renderItem.bind(this)}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{paddingBottom:50}}
            />
        )
    }
    _select(item){
        const { video } = this.props;
        const { cleanStream } = this.props;
        let src = video && video.src;

        this.setState({selectNode: item.episode});
        cleanStream && cleanStream(item.episode);

        // 优酷单独处理
        if(Number(src) === 1){
            return null;
        }

        return this.props.selectNode(item);
    }
    _renderItem({item,index}){
        const {selectNode} = this.state;
        const {putType} = this.props;
        let obj = item.obj;
        let _s = (obj.subTitle).includes(obj.episode);
        // let _title = _s ? obj.subTitle : `第${obj.episode}期 ${obj.subTitle}`;
        let _text_color = Number(obj.episode) === Number(selectNode) ? "rgb(0,117,248)" : "rgb(64,64,64)";

        return (
            putType === 'horizontal' ?
            <TouchableOpacity
                activeOpacity={.5}
                onPress={() => Number(obj.episode) === Number(selectNode) ? {} : this._select(obj)}
                style={[styles.zyBox,{marginLeft:20}]}
            >
                <Text numberOfLines={2} style={[styles.zyBoxText,{color:_text_color}]}>{obj.subTitle}</Text>
            </TouchableOpacity> :
            <View style={styles.zyBoxW}>
                <TouchableOpacity
                    activeOpacity={.5}
                    onPress={() => Number(obj.episode) === Number(selectNode) ? {} : this._select(obj)}
                    style={styles.zyBox1}
                >
                    <Text numberOfLines={2} style={[styles.zyBoxText,{color:_text_color}]}>{obj.subTitle}</Text>
                </TouchableOpacity>
            </View>
        );
    }
}

export default VarietySelect;

const styles = StyleSheet.create({
    flatList:{
        marginTop:6
    },
    zyBoxW:{
        backgroundColor:'#ffffff',
        overflow:'hidden',
        width: width/2 - 7.5,
        justifyContent:'center',
        paddingTop: 15,
        flexDirection:'row',
        paddingLeft:15
    },
    zyBox1:{
        backgroundColor:'rgb(239,239,239)',
        overflow:'hidden',
        borderRadius:4,
        justifyContent:'center',
        alignItems:"center",
        paddingHorizontal:8,
        flex:1,
        height:50
    },
    zyBox:{
        backgroundColor:'rgb(239,239,239)',
        overflow:'hidden',
        borderRadius:4,
        width:140,
        justifyContent:'center',
        alignItems:"center",
        padding:8,
    },
    zyBoxText:{
        color:'rgb(64,64,64)',
        fontSize:12,
        lineHeight:18,
    }
});







































