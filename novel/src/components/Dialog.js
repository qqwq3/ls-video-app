
/*弹出层*/

'use strict';

import React,{ PureComponent } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { pixel, width } from "../common/Tool";
import { Colors } from "../common/Style";

type Props = {
    popShowCallback    :  () => void,
    animationType      :  string,
    popWidth           :  number,
    popHeight          :  number,
    mandatory          :  boolean,
    children           :  Node,
    title              :  string,
    titleStyle         :  Object,
    buttonLeftText     :  string,
    buttonRightText    :  string,
    onDismiss          :  () => void,
    onConfirm          :  () => void,
    buttons            :  number,
    popBackgroundColor :  string,
};

class Dialog extends PureComponent<Props>{
    static defaultProps = {
        animationType: 'fade',
        popWidth: width - scale(80),
        popHeight: verticalScale(200),
        mandatory: false,
        title: '',
        titleStyle: {
            fontSize: moderateScale(15),
            color: '#333333'
        },
        buttonLeftText: '取消',
        buttonRightText: '确定',
        buttons: 2,
        popBackgroundColor: 'transparent',
    };
    constructor(props){
        super(props);
        this.state = {
            modalVisible: false,
        };
    };
    // 显示
    modeShow(){
        this.setState({modalVisible: true});
    }
    // 隐藏
    modeHide(){
        this.setState({modalVisible: false});
    }
    modeEmpty(){
        return null;
    }
    render(){
        const {
            popShowCallback,
            animationType,
            popWidth,
            popHeight,
            mandatory,
            title,
            titleStyle,
            buttonLeftText,
            buttonRightText,
            onDismiss,
            onConfirm,
            buttons,
            popBackgroundColor
        } = this.props;
        const { modalVisible } = this.state;

        return (
            <Modal
                onShow={() => popShowCallback ? popShowCallback() : {}}
                animationType={animationType}
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => this.modeHide()}
                hardwareAccelerated={true}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    style={[styles.popContent,{backgroundColor:popBackgroundColor}]}
                    onPress={() => mandatory ? this.modeHide() : this.modeEmpty()}
                >
                    <View style={[styles.popBox,{width: popWidth, height: popHeight}]}>
                        <View style={styles.popHead}>
                            <Text style={titleStyle}>{ title }</Text>
                        </View>
                        <View style={styles.popBody}>
                            { this.props.children }
                        </View>
                        <View style={styles.popFooter}>
                            {
                                buttons === 2 ?
                                <View style={styles.innerButtons}>
                                    <TouchableOpacity
                                        style={[styles.popBtn, {borderRightColor: '#dcdcdc', borderRightWidth: moderateScale(1 / pixel)}]}
                                        activeOpacity={0.5}
                                        onPress={() => onDismiss ? onDismiss() : {}}
                                    >
                                        <Text style={[styles.popBtnText, Colors.gray_c0c0c0]}>{ buttonLeftText }</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.popBtn}
                                        activeOpacity={0.5}
                                        onPress={() => onConfirm ? onConfirm() : {}}
                                    >
                                        <Text style={[styles.popBtnText, Colors.orange_f3916b]}>{ buttonRightText }</Text>
                                    </TouchableOpacity>
                                </View> :
                                <TouchableOpacity
                                    style={styles.popBtn}
                                    activeOpacity={0.5}
                                    onPress={() => onConfirm ? onConfirm() : {}}
                                >
                                    <Text style={[styles.popBtnText, Colors.orange_f3916b]}>{ buttonRightText }</Text>
                                </TouchableOpacity>
                            }
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        );
    }

}

export default Dialog;

const styles = StyleSheet.create({
    innerButtons:{
        flex: 1,
        flexDirection: 'row',
    },
    popBtnText:{
        fontSize: moderateScale(15),
    },
    popBtn:{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    popBody:{
        flex: 1,
        overflow: 'hidden',
        padding: moderateScale(10)
    },
    popFooter:{
        height: verticalScale(44),
        borderTopWidth: moderateScale(1 / pixel),
        borderTopColor: '#dcdcdc',
        flexDirection: 'row'
    },
    popHead:{
        height: verticalScale(44),
        borderBottomColor:'#dcdcdc',
        borderBottomWidth: moderateScale(1 / pixel),
        justifyContent: 'center',
        alignItems: 'center',
    },
    popBox:{
        backgroundColor:"#FFF",
        borderRadius: 6,
        elevation: 6
    },
    popContent:{
        flex:1,
        position:'absolute',
        left:0,
        top:0,
        right:0,
        bottom:0,
        zIndex:999,
        justifyContent:'center',
        alignItems:'center'
    },
});


































