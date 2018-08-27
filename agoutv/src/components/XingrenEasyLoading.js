'use strict';

import React from 'react';
import { StyleSheet, Dimensions, Text, View, Modal, ActivityIndicator } from 'react-native';
import PropTypes from 'prop-types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;



export class EasyLoading {
    constructor() {
    }
    static bind(loading, key = 'default') {
        loading && (this.map[key] = loading);
    }
    static unBind(key = 'default') {
        this.map[key] = null
        delete this.map[key];
    }
    static show(text = 'Loading...', timeout = -1, key = 'default') {
        this.map[key] && this.map[key].setState({ "isShow": true, "text": text, "timeout": timeout });
    }
    static dismis(key = 'default') {
        this.map[key] && this.map[key].setState({ "isShow": false });
    }
}

EasyLoading.map = {};


export class Loading extends React.Component {

    static propTypes = {
        type: PropTypes.string,
        color: PropTypes.string,
        textStyle: PropTypes.any,
        loadingStyle: PropTypes.any,
    };

    constructor(props) {
        super(props);
        let handle = 0;
        this.state = {
            isShow: false,
            timeout: -1,
            text: "Loading..."
        }
        EasyLoading.bind(this, this.props.type || 'default');
    }
    componentWillUnmount() {
        clearTimeout(this.handle);
        EasyLoading.unBind(this.props.type || 'default');
    }
    render() {
        clearTimeout(this.handle);
        (this.state.timeout != -1) && (this.handle = setTimeout(() => {
            EasyLoading.dismis(this.props.type || 'default');
        }, this.state.timeout));
        return (
            <Modal
                animationType={"fade"}
                transparent={true}
                visible={this.state.isShow}
                style={{alignItems: 'center', justifyContent: 'center'}}
                onRequestClose={() => { alert("Modal has been closed.") } }>
                <View style={[styles.load_box, this.props.loadingStyle]}>
                    <ActivityIndicator animating={true} color={this.props.color} size={'small'} style={styles.load_progress} />
                    {this.state.text ? <Text style={[styles.load_text, this.props.textStyle]}>{this.state.text}</Text> : null}
                </View>
            </Modal>
        );
    }
}


const styles = StyleSheet.create({
    load_box: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    load_progress: {
        backgroundColor: '#0f0f0f80',
        padding: 20,
        borderRadius: 6,
    },
    load_text: {
        marginTop: 35,
        color: '#FFF',
    }
});