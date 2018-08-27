
'use strict';

import React,{ PureComponent } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import ImageLoad from 'react-native-image-placeholder';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { Styles, ScaledSheet } from "../common/Style";
import { def, sex } from "../common/Icons";

type Props = {
    clickAble?: boolean,
    size?: string,
    source?: any,
    activeOpacity: ?number
};

type State = {

};

class Books extends PureComponent<Props, State>{
    static defaultProps = {
        clickAble: true, // false
        size: 'large', // small, minimum
        source: def.book, //require('../images/other/cover1.png'),
        activeOpacity: 0.50,
    };
    constructor(props){
        super(props);
        this.state = {};
    }
    commonWh(){
        const { size } = this.props;
        let wh = {};

        if(size === 'large'){
            wh = { width: scale(75), height: verticalScale(95) };
        }

        if(size === 'small'){
            wh = { width: scale(60), height: verticalScale(75) };
        }

        if(size === 'minimum'){
            wh = { width: scale(40), height: verticalScale(50) };
        }

        return wh;
    }
    renderImage(){
        const { source } = this.props;
        const wh = this.commonWh();

        return (
            <ImageLoad
                source={source}
                style={[styles.image, wh]}
                customImagePlaceholderDefaultStyle={styles.customImagePlaceholderDefaultStyle}
                isShowActivity={false}
                placeholderSource={def.book}
            />
        );
    }
    render(){
        const { clickAble, activeOpacity } = this.props;
        const wh = this.commonWh();

        return (
            clickAble ?
            <TouchableOpacity activeOpacity={activeOpacity} style={[styles.bookImage, wh]}>
                { this.renderImage() }
            </TouchableOpacity> :
            <View style={[styles.bookImage, wh]}>
                { this.renderImage() }
            </View>
        );
    }
}

const styles = ScaledSheet.create({
    bookImage: {
        position: 'relative',
        borderRadius: 2,
        overflow: 'hidden'
    },
    image: {

    },
    customImagePlaceholderDefaultStyle: {

    }
});

export default Books;
























