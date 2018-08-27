
/*等级特权*/

import React, { PureComponent } from 'react';
import { StyleSheet, View, Text, ImageBackground, StatusBar, ScrollView, ActivityIndicator } from 'react-native';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import HeaderBox from '../../common/HeaderBox';
import { loadLevelPrivileges } from '../../actions/task';

const styles = StyleSheet.create({
    promptText:{
        fontSize:14,
        color:'#404040',
    },
    fontFamily: {
        fontFamily: 'PingFangSC-Medium'
    },
    label:{
        marginRight:15,
        height:18,
        width:40,
        borderRadius:3,
        overflow:'hidden',
        backgroundColor:'#ffc755',
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center'
    },
    labelText:{
        fontSize:12,
        color:'#FFF'
    },
    rows:{
        flexDirection: 'row',
        alignItems:'center',
    },
    body:{
        flex:1,
        padding:40,
        position:'relative'
    },
    header:{
        width:'100%',
        height:220,
        overflow:'hidden',
    },
    content:{
        flex: 1,
        position: 'relative',
        backgroundColor: '#FFF',
    },
    loadingContent:{
        flex:1,
        justifyContent:'center',
        alignItems:'center'
    },
});

class LevelPrivileges extends PureComponent<{}>{
    constructor(props){
        super(props);
        this.state = {

        };
    }
    componentWillMount(){
        const { loadLevelPrivileges, taskLevelInfo } = this.props;
        if(!taskLevelInfo || taskLevelInfo && taskLevelInfo.code !== 0){
            loadLevelPrivileges && loadLevelPrivileges();
        }
        this._statusBarSet();
    }
    componentWillUnmount() {
        this._statusBarHy();
    }
    // 设置设备状态栏
    _statusBarSet(){
        StatusBar.setBarStyle('light-content',true);
        StatusBar.setBackgroundColor('#E8C997',true);
    }
    // 还原设备状态栏
    _statusBarHy(){
        StatusBar.setBarStyle('dark-content',true);
        StatusBar.setBackgroundColor('#A0B4CA',true);
    }
    // 去登录
    _goLogin(){
        const { navigation } = this.props;
        navigation.navigate('Login');
    }
    // 返回
    _goBack(){
        const { navigation } = this.props;
        navigation.goBack();
    }
    // 头部 - demo
    renderHeader(){
        const iconLevelIntroBase = require('../imgs/taskCenter/level_intro_base.png');

        return (
            <ImageBackground
                source={iconLevelIntroBase}
                style={styles.header}
                imageStyle={{resizeMode:'cover'}}
            >
                <HeaderBox
                    isText={true}
                    text={'等级特权说明'}
                    isArrow={true}
                    backgroundColor={'transparent'}
                    borderBottomColor={'transparent'}
                    titleColor={'#FFF'}
                    arrowColor={'#FFF'}
                    goBack={this._goBack.bind(this)}
                />
            </ImageBackground>
        );
    }
    // 内容 - demo
    renderContent(){
        const { taskLevelInfo } = this.props;
        const data: Array<any> = (taskLevelInfo && taskLevelInfo.code === 0 && Object.entries(taskLevelInfo.data)) || [];

        return (
            <View style={styles.body}>
                {
                    data.length === 0 ?
                        <View style={[styles.loadingContent]}>
                            <ActivityIndicator color={'rgb(0,117,248)'} size={'small'} />
                        </View> :
                        data.map((item, index) => {
                            return (
                                <View key={index} style={[styles.rows,{marginBottom:30}]}>
                                    <View style={styles.label}>
                                        <Text style={[styles.labelText,styles.fontFamily]}>LV{ item[0] }</Text>
                                    </View>
                                    <Text style={[styles.fontFamily,styles.promptText]}>{ item[1] }</Text>
                                </View>
                            );
                        })
                }
            </View>
        );
    }
    render(){
        return (
            <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
                { this.renderHeader() }
                { this.renderContent() }
            </ScrollView>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    let data = state.getIn(['task']);

    if (Immutable.Map.isMap(data)) {
        data = data.toJS();
    }

    return { ...ownProps, ...data };
};

export default connect(mapStateToProps,{loadLevelPrivileges})(LevelPrivileges);



























