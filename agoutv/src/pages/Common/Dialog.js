
/*弹出层*/

import React,{ PureComponent } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, ViewPropTypes } from 'react-native';
import PropTypes from 'prop-types';
import { pixel, width } from "../../common/tool";

class Dialog extends PureComponent{
    constructor(props){
        super(props);
        this.state = {
            modalVisible: false
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
                <TouchableOpacity activeOpacity={1} style={[styles.popContent,{backgroundColor:popBackgroundColor}]} onPress={() => mandatory ? this.modeHide() : this.modeEmpty()}>
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
                                        style={[styles.popBtn,{borderRightColor:'#dcdcdc',borderRightWidth:1/pixel}]}
                                        activeOpacity={0.5}
                                        onPress={() => onDismiss ? onDismiss() : {}}
                                    >
                                        <Text style={[styles.popBtnText,{color:'rgb(193,193,193)'}]}>{ buttonLeftText }</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.popBtn}
                                        activeOpacity={0.5}
                                        onPress={() => onConfirm ? onConfirm() : {}}
                                    >
                                        <Text style={[styles.popBtnText,{color:'rgb(0,117,248)'}]}>{ buttonRightText }</Text>
                                    </TouchableOpacity>
                                </View> :
                                <TouchableOpacity
                                    style={styles.popBtn}
                                    activeOpacity={0.5}
                                    onPress={() => onConfirm ? onConfirm() : {}}
                                >
                                    <Text style={[styles.popBtnText,{color:'rgb(0,117,248)'}]}>{ buttonRightText }</Text>
                                </TouchableOpacity>
                            }
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        );
    }

}

Dialog.defaultProps = {
    animationType:       'fade',
    popWidth:            width - 80,
    popHeight:           200,
    mandatory:           false,
    title: '',
    titleStyle: {
        fontSize:        15,
        color:           '#333333'
    },
    buttonLeftText:     '取消',
    buttonRightText:    '确定',
    buttons: 2,
    popBackgroundColor: 'transparent'
};

Dialog.propTypes = {
    popShowCallback  :    PropTypes.func,
    animationType    :    PropTypes.string,
    popWidth         :    PropTypes.number,
    popHeight        :    PropTypes.number,
    mandatory        :    PropTypes.bool,
    children         :    PropTypes.node,
    title            :    PropTypes.string,
    titleStyle       :    PropTypes.object,
    buttonLeftText   :    PropTypes.string,
    buttonRightText  :    PropTypes.string,
    onDismiss        :    PropTypes.func,
    onConfirm        :    PropTypes.func,
    buttons          :    PropTypes.number,
    popBackgroundColor:   PropTypes.string,
};

export default Dialog;

const styles = StyleSheet.create({
    innerButtons:{
        flex:1,
        flexDirection:'row',
    },
    popBtnText:{
        fontSize:15,
    },
    popBtn:{
        flex:1,
        justifyContent:'center',
        alignItems:'center'
    },
    popBody:{
        flex:1,
        overflow:'hidden',
        padding:10
    },
    popFooter:{
        height: 44,
        borderTopWidth:1 / pixel,
        borderTopColor: '#dcdcdc',
        flexDirection:'row'
    },
    popHead:{
        height:44,
        borderBottomColor:'#dcdcdc',
        borderBottomWidth: 1/ pixel,
        justifyContent:'center',
        alignItems:'center',
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


































