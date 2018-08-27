
/*活动模板*/

import React,{ PureComponent } from 'react';
import { Modal, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { statusBarSetPublic } from "../../common/tool";

type Props = {
    animationType?: string,
    hardwareAccelerated?: ?boolean,
    transparent?: ?boolean,
    children: ?Node,
    backgroundColor?: string,
    allowClose: ?boolean,
    allowFunction: () => void,
    statusBarColor: ?string,
    statusBarType: ?string
};

class ActivityTemplate extends PureComponent<Props>{
    static defaultProps = {
        animationType: 'fade',
        hardwareAccelerated: true,
        transparent: true,
        children: <Text/>,
        backgroundColor: 'rgba(0,0,0,0.5)',
        allowClose: false,
        statusBarColor: '#FFFFFF',
        statusBarType: 'dark-content',
    };
    constructor(props){
        super(props);
        this.state = {
            visible: false,
        };
    }
    componentWillMount(){
        statusBarSetPublic && statusBarSetPublic('rgba(0,0,0,0.5)','light-content',true);
    }
    componentWillUnmount() {
        const { statusBarColor, statusBarType } = this.props;

        statusBarSetPublic && statusBarSetPublic(statusBarColor,statusBarType,true);
    }
    // 关闭
    hide(){
        this.setState({visible: false});
    }
    // 显示
    show(){
        this.setState({visible: true});
    }
    // 显示控制
    showControl(){
        const { allowFunction } = this.props;

        if(allowFunction){
            return allowFunction();
        }

        return null;
    }
    render(){
        const { animationType, hardwareAccelerated, transparent, children, backgroundColor } = this.props;

        return (
            <Modal
                transparent={transparent}
                visible={this.state.visible}
                animationType={animationType}
                hardwareAccelerated={hardwareAccelerated}
                onRequestClose={this.hide.bind(this)}
            >
                <TouchableOpacity
                    activeOpacity={1.0}
                    style={[styles.container,{backgroundColor:backgroundColor}]}
                    onPress={this.showControl.bind(this)}
                >
                    { children }
                </TouchableOpacity>
            </Modal>
        );
    }
}

export default ActivityTemplate;

const styles = StyleSheet.create({
    container:{
        flex:1,
        justifyContent:'center',
        alignItems:'center',
        position:'relative',
        zIndex:99999999
    }
});
























