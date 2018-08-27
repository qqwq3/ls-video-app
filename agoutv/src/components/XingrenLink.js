'use strict';

import React from 'react';
import {
    TouchableOpacity,
    ActivityIndicator,
    Text,
    StyleSheet,
    View,
    ViewPropTypes,
} from 'react-native';
import PropTypes from 'prop-types';

export default class XingrenLink extends React.Component {
    static propTypes = {
        onPress: PropTypes.func,
        text: PropTypes.string.isRequired,
        textStyle: Text.propTypes.style,
        style: (ViewPropTypes || View.propTypes).style,
        disabledStyle: (ViewPropTypes || View.propTypes).style,
        disabledTextStyle: Text.propTypes.style,
        disabled: PropTypes.bool,
    };
    static defaultProps = {
        text: 'Button',
        disabled: false,
        disabledStyle: null,
        disabledTextStyle: null,
    };
    _onPress = (e) => {
        this.props.onPress && this.props.onPress(e);
    };
    render() {
        return (
            <TouchableOpacity style={[this.props.style, this.props.disabled ? this.props.disabledStyle : null]} onPress={this._onPress} disabled={this.props.disabled}>
                <Text style={[styles.descTextStyle, this.props.textStyle, this.props.disabled ? this.props.disabledTextStyle : null]}>{this.props.text}</Text>
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    descTextStyle: {
        color: '#fff',
    },
});