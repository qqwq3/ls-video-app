'use-strict';

import React from 'react';
import {
    View,
    Text,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';
import PropTypes from 'prop-types';

const util = require('../common/Util');

export default class XingrenLoading extends React.Component {
    static propTypes = {
        visible: PropTypes.bool.isRequired,
    };

    static defaultProps = {
        visible: false,
    };

    render() {
        if (!this.props.visible) {
            return (
                <View style={{width:0,height:0}}></View>
            );
        }

        return (
            <View style={styles.container}>
                <ActivityIndicator style={styles.indicator} />
            </View>
        );
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: util.SCREEN_WIDTH,
        height: util.SCREEN_HEIGHT - 80,
        position: 'absolute',
        top: 0,
        left: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    indicator: {
        padding: 12,
        backgroundColor: '#0f0f0f',
        opacity: 0.8,
        borderRadius: 6,
    },
});