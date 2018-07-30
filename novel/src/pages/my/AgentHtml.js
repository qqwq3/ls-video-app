
import React, { PureComponent } from 'react';
import { ActivityIndicator, View, WebView, StatusBar, BackHandler, Platform, } from 'react-native';
import Cookie from 'react-native-cookie';
import { Styles, BackgroundColor } from "../../common/Style";
import { height } from "../../common/Tool";

export default  class AgentHtml extends PureComponent{
    constructor(props){
        super(props);
    }

    componentDidMount(){
        const { navigation } = this.props;
        const agent = navigation.getParam('agent');
        this.setState({
            loginStatus:agent.loginStatus,
            agentAdminUrl:agent.agentAdminUrl ,
        })
    }

    componentWillMount() {
        // Orientation.lockToPortrait();
        StatusBar.setHidden(true,'fade');
        this._addEventListenerBackHandler();
    }
    componentWillUnmount() {
        StatusBar.setHidden(false,'fade');
        this._removeEventListenerBackHandler();
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
        //Orientation.lockToPortrait();
        StatusBar.setHidden(false,'fade');
        return false;
    }
    // 加载完毕
    _onLoad(){
        console.log("..", "加载完毕")
    }
    sendMessage() {
        this.refs.webview.postMessage(this.state.loginStatus);
    }
    render(){
        let adminUrl = this.state ? this.state.agentAdminUrl : false;
        let cookieValue = this.state ? this.state.loginStatus : "";
        if(adminUrl && Cookie.set(adminUrl, "loginStatus", cookieValue)) {
            const userAgentStr = "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36";
            let html = `<iframe
                         marginheight='0'
                         marginwidth='0'
                         scrolling="no"
                         style="height:100%;width:100%;left:0;right:0;top:0;bottom:0;position:absolute"
                         src='${adminUrl}'
                         frameborder='0'
                      ></iframe>`;

            return (
                <WebView
                    ref={'webview'}
                    source={{html: html}}
                    userAgent={userAgentStr}
                    style={{flex: 1}}
                    scalesPageToFit={true}
                    onLoad={this._onLoad.bind(this)}
                    onMessage={(e) => {
                        this.sendMessage(e)
                    }}
                />
            );
        }else {
            return (
                <View style={[Styles.container, Styles.flexCenter, {minHeight: height}]}>
                    <ActivityIndicator color={BackgroundColor.bg_f3916b} size={'small'}/>
                </View>
            )
        }
    }
}

