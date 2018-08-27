'use strict';

import React from 'react';
import {
    Text,
    TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';
import DrawPassword from './DrawPassword';

export default class LaunchPasswordValidator extends React.Component {
    static propTypes = {
        password: PropTypes.string.isRequired,
        onValidated: PropTypes.func,
    };

    constructor(props) {
        super(props);

        this.state = this.getInitialState();
    }

    getInitialState() {
        return {
            status: 'normal',
            message: '请输入启动密码',
        };
    }

    _onStart = () => {
        return this.setState(this.getInitialState());
    };

    _onEnd = (password) => {
        if (password !== this.props.password) {
            this.setState({
                status: 'wrong',
                message: '启动密码输入错误，请重试',
            });
        } else {
            this.props.onValidated && this.props.onValidated();
        }
    };

    render() {
        return (
            <DrawPassword
                status={this.state.status}
                message={this.state.message}
                onStart={this._onStart}
                onEnd={this._onEnd}
                style={{backgroundColor: '#242424'}}
                normalColor="#eb832e"
                rightColor="#46d1b2"
                normalTextColor='#fff'
                textStyle={{fontSize: 15}} />
        );
    }
}