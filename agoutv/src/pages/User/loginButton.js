'use strict';

import React from 'react';
import {
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Text,
    StyleSheet,
    View,
    ViewPropTypes,
} from 'react-native';
import PropTypes from 'prop-types';


export default class LoginButton extends React.Component {
    static propTypes = {
        onPress: PropTypes.func,
        text: PropTypes.string.isRequired,
        indicatorStyle: (ViewPropTypes || View.propTypes).style,
        indicatorColor: PropTypes.string,
        textStyle: Text.propTypes.style,
        disabledStyle: (ViewPropTypes || View.propTypes).style,
        style: (ViewPropTypes || View.propTypes).style,
        loading: PropTypes.bool,
        disabled: PropTypes.bool,
    };

    static defaultProps = {
        text: 'Button',
        indicatorColor: '#fff',
        loading: false,
        disabled: false,
    };

    _onPress = (e) => {
        this.props.onPress && this.props.onPress(e);
    };

    render() {
        return (
            <TouchableOpacity  onPress={this._onPress} disabled={this.props.disabled}>
                {this.props.loading ? <ActivityIndicator style={[styles.indicator, this.props.indicatorStyle]} color={this.props.indicatorColor} /> : null}
                <Image
                    source={require('./loginImg/icon_login_wechat.png')}
                    style={styles.wxIconStyle}
                />
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
    },
    indicator: {
        marginRight: 10,
    },
    disabled: {
        backgroundColor: '#ccc',
    },
    descTextStyle: {
        color: '#fff',
    },
    wxIconStyle: {
        width:80,
        height:80
    },
});