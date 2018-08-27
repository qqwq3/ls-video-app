'use strict';

import React from 'react';
import {
    View,
    Text,
    TextInput,
    Modal,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';
import XingrenLink from './XingrenLink';
import {pixel} from "../common/tool";

export default class XingrenInputModal extends React.Component {
    static propTypes = {
        visible: PropTypes.bool,
        onClose: PropTypes.func,
        onShow: PropTypes.func,
        onSubmit: PropTypes.func,
        onCancel: PropTypes.func,
        title: PropTypes.string.isRequired,
        placeholder: PropTypes.string,
        maxLength: PropTypes.number,
        modalBackgroundColor: PropTypes.string.isRequired,
        modalAnimationType: PropTypes.string.isRequired,
        subTitle: PropTypes.string,
    };
    static defaultProps = {
        visible: false,
        placeholder: null,
        modalBackgroundColor:'transparent',
        modalAnimationType: 'slide'
    };

    constructor(props) {
        super(props);

        this.state = {text: '', visible: this.props.visible, isBusy: false};
        this._onSubmit = this._onSubmit.bind(this);
    }

    _onSubmit(text) {
        if (typeof(text) !== 'string') {
            text = this.state.text;
        }

        this.props.onSubmit && this.props.onSubmit(text);
    }

    _onCancel() {
        this.props.onCancel && this.props.onCancel();
        this.hide();
    }

    getText() {
        return this.state.text;
    }

    close() {
        this.setState({isBusy: false, visible: false, text: ''});
    }

    show(defaultValue = '') {
        this.setState({visible: true, text: defaultValue});
    }

    hide() {
        this.setState({visible: false});
    }

    busy() {
        this.setState({isBusy: true});
        this.hide();
    }

    idle() {
        this.setState({isBusy: false});
    }

    _renderBusy() {
        return (
            <View style={styles.busyContainer}>
                <View style={styles.busyContainerView}>
                    <ActivityIndicator color={'rgb(255,255,255)'} size={'small'} style={styles.busyIndicator}/>
                </View>
            </View>
        );
    }

    render() {
        return (
            <Modal
                visible={(this.props.visible && this.state.visible) || this.state.visible}
                transparent={true}
                onRequestClose={() => this.props.onClose && this.props.onClose()}
                onShow={() => this.props.onShow && this.props.onShow()}
                animationType={this.props.modalAnimationType}
            >
                <TouchableOpacity style={[styles.modalBackground,{backgroundColor:this.props.modalBackgroundColor}]} activeOpacity={1} onPress={() => this.close()}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalBody}>
                            <Text style={styles.modalTitle}>{this.props.title}</Text>
                            <Text style={styles.modalSubTitle}>{this.props.subTitle}</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder={this.props.placeholder}
                                placeholderTextColor="#cccccc"
                                underlineColorAndroid="transparent"
                                maxLength={this.props.maxLength}
                                autoFocus={true}
                                onSubmitEditing={(e) => this._onSubmit(e.nativeEvent.text)}
                                onChangeText={(text) => this.setState({text,})}
                                defaultValue={this.state.text}
                            />
                        </View>
                        <View style={styles.modalFooter}>
                            <XingrenLink text={'取消'} style={styles.modalCancelButton} textStyle={styles.modalCancelButtonText} onPress={this._onCancel.bind(this)}/>
                            <XingrenLink text={'确定'} style={styles.modalOKButton}     textStyle={styles.modalOKButtonText}     onPress={this._onSubmit.bind(this)}/>
                        </View>
                        {this.state.isBusy ? this._renderBusy() : null}
                    </View>
                </TouchableOpacity>
            </Modal>
        );
    }
}

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
    modalContainer: {
        width: 306,
        height: 209,
        borderRadius: 5,
        backgroundColor: '#fff',
        elevation:6
    },
    modalBody: {
        flex: 1,
        borderBottomWidth: 1/pixel,
        borderBottomColor: '#dcdcdc',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalFooter: {
        height: 50,
        flexDirection: 'row',
    },
    modalCancelButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRightWidth: 1/pixel,
        borderRightColor: '#DCDCDC',
    },
    modalCancelButtonText: {
        color: 'rgb(64,64,64)',
        fontSize: 16,
    },
    modalOKButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    modalOKButtonText: {
        color: 'rgb(0,117,248)',
        fontSize: 16,
    },
    modalTitle: {
        color: 'rgb(64,64,64)',
        fontSize: 18,
        marginBottom: 31,
    },
    modalSubTitle: {
        color: '#cccccc',
        fontSize: 12,
        marginBottom: 31,
        marginTop:-31,
    },
    modalInput: {
        width: 267,
        height: 45,
        marginLeft: 20,
        marginRight: 20,
        borderColor: '#dcdcdc',
        borderWidth: 1/pixel,
        borderRadius: 0.2,
        textAlign:'center',
        fontSize:14
    },
    busyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor: 'rgba(0,0,0,0)',
        width: 306,
        height: 209,
    },
    busyContainerView:{
        width:80,
        height:80,
        backgroundColor:'rgba(0,0,0,0.6)',
        borderRadius:6,
        justifyContent:"center",
        alignItems:'center'
    },
    busyIndicator: {
        padding: 12,
        backgroundColor: '#0f0f0f',
        borderRadius: 6
    },
});