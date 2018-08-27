
/*动漫剧集选择*/

'use strict';

import React,{ PureComponent } from 'react';
import {StyleSheet, Text, View, TouchableOpacity, FlatList} from 'react-native';
import {width,height,pixel} from "../../common/tool";

type Props = {
    selectNode?: Function,
    putType?: string
};

class AnimeSelect extends PureComponent<Props>{
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

        k.map((item,index) => {_data.push({key:index,obj:item});});
        return _data;
    }
    render(){
        const { putType } = this.props;
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
                contentContainerStyle={{paddingHorizontal:10}}
            /> :
            <FlatList
                data={data}
                renderItem={this._renderItem.bind(this)}
                numColumns={5}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{paddingHorizontal:10,paddingBottom:65}}
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
        let episode = obj.episode || '';
        let _text_color = Number(episode) === Number(selectNode) ? "rgb(250,250,250)" : "rgb(64,64,64)";
        let _bg_color = Number(episode) === Number(selectNode) ? "rgb(0,117,248)" : "rgb(239,239,239)";

        return (
            putType === 'horizontal' ?
            <View style={[styles.rows,putType === 'horizontal' ? {height:'auto', padding: 0} : {}]}>
                <TouchableOpacity
                    activeOpacity={.5}
                    onPress={() => Number(episode) === Number(selectNode) ? {} : this._select(obj)}
                    style={[styles.zyBox,{width:45, height:45,backgroundColor:_bg_color}]}
                >
                    <Text style={[styles.zyBoxText,{color:_text_color}]}>{episode}</Text>
                </TouchableOpacity>
            </View> :
            <View style={styles.flBox}>
                <TouchableOpacity
                    activeOpacity={.5}
                    onPress={() => Number(episode) === Number(selectNode) ? {} : this._select(obj)}
                    style={[styles.zyBox,{flex: 1,height:46,backgroundColor:_bg_color}]}
                >
                    <Text style={[styles.zyBoxText,{color:_text_color}]}>{episode}</Text>
                </TouchableOpacity>
            </View>
        );
    }
}

export default AnimeSelect;

const styles = StyleSheet.create({
    rows: {
        width: (width-20) / 5,
        height: (width-20) / 5,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10
    },
    flBox:{
        width: (width - 20) / 5 ,
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
        paddingHorizontal:10,
        marginTop: 20,
    },
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
        justifyContent:'center',
        alignItems:"center",
    },
    zyBoxText:{
        color:'rgb(64,64,64)',
        fontSize:14
    }
});










































