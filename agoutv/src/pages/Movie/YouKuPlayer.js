
/*优酷播放器*/

import React,{ PureComponent } from 'react';
import { View, StyleSheet, WebView, StatusBar, BackHandler, Platform, ActivityIndicator } from 'react-native';
import Orientation from 'react-native-orientation';
import Cookie from 'react-native-cookie';
import { connect } from 'react-redux';
import Immutable from 'immutable';
import { addTask } from '../../actions/task';

class YouKuPlayer extends PureComponent{
    constructor(props){
        super(props);
        this.state = {};
        this.timer = 0;
    }
    componentWillMount() {
        Orientation.lockToLandscape();
        StatusBar.setHidden(true,'fade');
        this._addEventListenerBackHandler();
    }
    componentWillUnmount() {
        Orientation.lockToPortrait();
        StatusBar.setHidden(false,'fade');
        this._removeEventListenerBackHandler();

        const { navigation, addTask } = this.props;
        const params = navigation.state.params;
        const video = params.video;
        const episode = params.episode;
        const movie_id = video && video.id;
        const serials_src_id = video.playLink[episode].serialsSrcId;

        if(Number(this.timer) >= 10){
            addTask && addTask('watch_video', this.timer, movie_id, serials_src_id);
        }
        this._closeTimer();
    }
    // 监听设备返回键
    _addEventListenerBackHandler(){
        // 安卓设备
        if(Platform.OS === 'android'){
            this.appBackHandler = BackHandler.addEventListener('hardwareBackPress',this._handleBack.bind(this));
        }
        // 苹果设备 - 临时处理
        else{

        }
    }
    // 打开计时器
    _openTimer(){
        this.viewTimer = setInterval(() => {
            this.timer += 1;
        },1000);
    }
    // 关闭计时器
    _closeTimer(){
        this.viewTimer && clearInterval(this.viewTimer);
        this.timer = 0;
    }
    // 删除监听
    _removeEventListenerBackHandler(){
        // 安卓设备
        if(Platform.OS === 'android'){
            this.appBackHandler && this.appBackHandler.remove();
        }
        // 苹果设备 - 临时处理
        else{

        }
    }
    // 设备返回键监听对应函数
    _handleBack(){
        Orientation.lockToPortrait();
        StatusBar.setHidden(false,'fade');
        return false;
    }
    // 加载完毕
    _onLoad(){
        this._openTimer();
    }
    render(){
        const { video, srcId } = this.props.navigation.state.params;
        const src= video && video.src;
        const data = launchSettings && launchSettings.cookies && launchSettings.cookies.youku;
        const cookies = data.split(';');
        const userAgentStr = "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36";

        // 优酷播放
        if(Cookie.setCookies(".youku.com", cookies) && Number(src) === 1 && srcId !== null){
            let html = `<iframe
                             marginheight='0'
                             marginwidth='0'
                             scrolling="no"
                             style="height:100%;width:100%;left:0;right:0;top:0;bottom:0;position:absolute"
                             src='http://player.youku.com/embed/${srcId}'
                             frameborder='0'
                          ></iframe>`;

            return (
                <WebView
                    source={{html: html}}
                    userAgent={userAgentStr}
                    style={{flex: 1}}
                    scalesPageToFit={true}
                    mediaPlaybackRequiresUserAction={true}
                    onLoad={this._onLoad.bind(this)}
                />
            );
        }

        return (
            <View style={styles.content}>
                <ActivityIndicator size={'large'} color={'rgb(0,117,248)'}/>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    content:{
       flex:1,
        justifyContent:'center',
        alignItems:'center'
    },
});

const mapStateToProps = (state, ownProps) => {
    let taskData = state.getIn(['task']);
    if (Immutable.Map.isMap(taskData)) { taskData = taskData.toJS() }
    return {taskData: taskData};
};

export default connect(mapStateToProps,{addTask})(YouKuPlayer);




























