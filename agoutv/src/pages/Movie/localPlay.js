'use strict';

import React from 'react';
import {
    Alert,
    View,
    Text
} from 'react-native';
import { saveCommon, loadCommon } from '../../common/Storage';
import CSVideoPlayer from '../../common/CSVideoPlayer';
import { toHHMMSS } from "../../common/tool";

class PlayLocalScreen extends React.Component {
    static navigationOptions = {
        header: null,
    };
    constructor(props){
        super(props);
        this.state = {
            stream: null,
            video: false,
        };
        // 当前播放时间记录
        this.currentPlayerRecord = 0;
    }
    componentWillMount(){
        let obj = (this.props.navigation && this.props.navigation.state && this.props.navigation.state.params) || false;
        let video = obj.video;
        if(obj){
            let T = Number(video.type);
            let cacheId = video.hexId;
            if(T !== 1){
                cacheId = cacheId + video.episode;
            }
            loadCommon(cacheId).then((data)=>{
                this.currentPlayerRecord = data;
                this.setState({stream: obj.source, video: obj.video});
            });
        }

    }

    componentDidMount() {
    }

    componentWillUnmount() {
        const {video} = this.state;
        let T = Number(video.type);
        let cacheId = video.hexId;
        if(T !== 1){
            cacheId = cacheId + video.episode;
        }
        loadCommon(cacheId).then((data)=>{
            this.currentPlayerRecord = data;
            let playedTime = toHHMMSS(data);
            cacheManager.setPlayedTime(video.id,playedTime);
        });

    }
    _screenDirection(status){

    }
    // 返回
    _onBack(){
        const { goBack } = this.props.navigation;
        return goBack();
    }
    // 视频播放出错
    _onPlayError() {
        Alert.alert('提示', '播放出错,请重试', [
            { text: '确定', onPress: () => {
               this._onBack();
            } }
        ]);
    }
    render() {
        const { stream, video } = this.state;
        let arr = [];
        let item = arr.push(video.item) || []
        let obj = new Object();
        obj.code = video.hexId;
        obj.episode = video.episode;
        obj.video = video;
        return (
            stream ?
            <CSVideoPlayer
                {...obj}
                saveInfo={true}
                screen={'horizontal'}
                title={video.title || ''}
                showOnStart={false}
                source={{uri:stream}}
                isTopControl={true}
                middlePlayBtnDisplay={false}
                resizeMode={'contain'}
                ref={ref => this.CSVideoPlayerRef = ref}
                screenDirection={this._screenDirection.bind(this)}
                timeRecord={true}
                timeRecordValue={this.currentPlayerRecord}
                claritys={item}
                onError={this._onPlayError.bind(this)}
                onBack={this._onBack.bind(this)}
            /> :
            <View style={{flex:1}}>
                <Text>播放错误</Text>
            </View>
        );
    }
}

export default PlayLocalScreen;
