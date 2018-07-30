
'use strict';

import React,{ PureComponent } from 'react';
import { Image } from 'react-native';
import { ScaledSheet } from "../common/Style";

type Props = {
    defaultIcon: number,
    activeIcon: number,
    focused: boolean
};

class TabBarIcon extends PureComponent<Props>{
    static defaultProps = {
        focused: false
    };
    render(){
        const { defaultIcon, activeIcon, focused } = this.props;

        return (
            <Image source={focused ? activeIcon : defaultIcon} style={styles.image}/>
        );
    }
}

export default TabBarIcon;

const styles = ScaledSheet.create({
    image:{
        width: '22@s',
        height: '22@vs',
        resizeMode: 'contain'//显示整张图 等比缩小
    }
});




























