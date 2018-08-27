
'use strict';

import React,{ PureComponent } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Image
} from 'react-native';
import PropTypes from 'prop-types';

class TabBarIcon extends PureComponent<{}>{
    static propTypes = {
        defaultIcon: PropTypes.number.isRequired,
        activeIcon: PropTypes.number.isRequired,
        focused: PropTypes.bool.isRequired
    };
    static defaultProps = {
        focused: false
    };
    render(){
        const { defaultIcon,activeIcon,focused } = this.props;

        return (
            <Image
                source={focused ? activeIcon : defaultIcon}
                style={styles.image}
            />
        );
    }
}

export default TabBarIcon;

const styles = StyleSheet.create({
    image:{
        width: 25,
        height: 25
    }
});




























