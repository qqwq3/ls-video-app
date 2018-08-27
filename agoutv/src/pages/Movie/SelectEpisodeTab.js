
/*电视剧选集*/

'use strict';

import React,{ PureComponent } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList } from 'react-native';
import { width } from "../../common/tool";

type Props = {
    screenProps: Object,
    type: string,
    cleanStream?: () => void,
};

class SelectEpisodeTab extends PureComponent<Props>{
    static defaultProps = {
        selectedOption: 1,
        type: 'horizontal'
    };
    constructor(props){
        super(props);
        this.state = {
            selectNode: this.props.screenProps.episode,
        };
    }
    componentWillReceiveProps(nextProps) {
        if(nextProps.screenProps.defaultNode !== null && nextProps.screenProps.defaultNode !== this.state.selectNode){
            this.setState({selectNode: nextProps.screenProps.defaultNode});
        }
    }
    setSelectedOption = (selectedEpisode) => {
        const {screenProps, cleanStream} = this.props; //defaultNode,episode

        if (selectedEpisode !== screenProps.episode) {
            let video = screenProps.video;
            let code = screenProps.code;
            let episodeValue = video.playLink[selectedEpisode];
            let src = video && video.src;

            this.setState({selectNode: selectedEpisode});
            cleanStream && cleanStream(selectedEpisode);

            // 优酷单独处理
            if(Number(src) === 1){
                return null;
            }

            screenProps.playVideo && screenProps.playVideo(video.id, code, selectedEpisode, episodeValue.serialsSrcId);
        }
    };
    _renderItem({item,index}){
        const {selectNode } = this.state;
        const { type } = this.props;
        let number_item = Number(item);
        let color = Number(number_item) === Number(selectNode) ? 'rgb(255,255,255)' : 'rgb(64,64,64)';
        let bgColor = Number(number_item) === Number(selectNode) ? 'rgb(0,117,248)' : 'rgb(239,239,239)';

        return (
            <View key={index} style={[styles.rows,type === 'horizontal' ? {height:'auto',paddingBottom:0} : {}]}>
                <TouchableOpacity
                    style={[styles.rowsBox,{backgroundColor:bgColor},type === 'horizontal' ? {width:45,height:45} : {}]}
                    onPress={() => Number(number_item) === Number(selectNode) ? {} : this.setSelectedOption(number_item)}
                    activeOpacity={0.75}
                >
                    <Text style={[styles.rowsBoxText,{color:color}]} numberOfLines={1}>{number_item}</Text>
                </TouchableOpacity>
            </View>
        );
    }
    render() {
        let {screenProps} = this.props;
        const { type } = this.props;
        let episodeRecords = (screenProps && screenProps.video && screenProps.video.playLink && Object.keys(screenProps.video.playLink)) || [];

        return (
            type === 'horizontal' ?
                <FlatList
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    data={episodeRecords}
                    keyExtractor={item => item}
                    renderItem={this._renderItem.bind(this)}
                    horizontal={true}
                    scrollEnabled={true}
                    contentContainerStyle={{paddingHorizontal:10}}
                /> :
                <FlatList
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    data={episodeRecords}
                    keyExtractor={item => item}
                    renderItem={this._renderItem.bind(this)}
                    columnWrapperStyle={styles.cloumnWrapperStyle}
                    horizontal={false}
                    numColumns={5}
                    initialNumToRender={20}
                    scrollEnabled={true}
                    contentContainerStyle={{paddingHorizontal:10,paddingTop:10,paddingBottom:45}}
                />
        );
    }
}

export default SelectEpisodeTab;

const styles = StyleSheet.create({
    rows: {
        width: (width-20) / 5,
        height: (width-20) / 5,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10
    },
    rowsBox:{
        borderRadius: 4,
        height:'100%',
        width:'100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor:'rgb(239,239,239)'
    },
    rowsBoxText:{
        fontSize: 15,
        alignContent: 'center',
    },
    cloumnWrapperStyle: {
        justifyContent: 'flex-start',
        flexWrap: 'wrap',
    },
    FlatListContent:{
        paddingTop:6,
        paddingBottom:6,
    }
});








































