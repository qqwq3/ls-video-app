
'use strict';

import React,{ PureComponent } from 'react';
import { View, Image, TouchableOpacity, Text } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { ScaledSheet, Img, Fonts, Colors } from "../common/Style";
import { mix } from "../common/Icons";

type Props = {
    number?: number,
    isSearch?: boolean,
    source: ?number,
    eventOne: () => void,
    eventTwo: () => void,
    isText?: boolean,
    text?: ?string,
    secondTextShow: ?boolean,
    secondText?: string,
};

type State = {};

class ImageAndFonts extends PureComponent<Props, State>{
    static defaultProps = {
        number: 1,
        isSearch: true,
        source: 0,
        isText: false,
        text: "",
        secondTextShow: false,
        secondText: '签到',
    };
    constructor(props){
        super(props);
        this.state = {};
    }
    onPressOne(){
        const { eventOne }  = this.props;
        return eventOne && eventOne();
    }
    onPressTwo(){
        const { eventTwo }  = this.props;
        return eventTwo && eventTwo();
    }
    render(){
        const { number, isSearch, source, isText, text, secondTextShow, secondText } = this.props;

        return (
            <View style={[styles.headerRight, number === 2 ? {paddingRight: moderateScale(2)} : {}]}>
                <TouchableOpacity
                    activeOpacity={.5}
                    style={[styles.headerRightBox, number === 2 ? styles.boxA : styles.boxB]}
                    onPress={this.onPressOne.bind(this)}
                >
                    {
                        isText ?
                        <Text style={[Fonts.fontFamily, Fonts.fontSize15, Colors.gray_404040]}>{ text }</Text> :
                        <Image
                            source={isSearch ? mix.search : source}
                            style={[Img.resizeModeContain, styles.searchImage]}
                        />
                    }
                </TouchableOpacity>
                {
                    number === 2 ?
                    <TouchableOpacity
                        activeOpacity={.5}
                        style={[styles.headerRightBox, number === 2 ? styles.boxA : styles.boxB]}
                        onPress={this.onPressTwo.bind(this)}
                    >
                        {
                            secondTextShow ?
                            <Text style={[Fonts.fontFamily, Fonts.fontSize15, Colors.orange_f3916b]}>{ secondText }</Text> :
                            <Image source={mix.signIn} style={[Img.resizeModeContain, styles.signInImage]}/>
                        }
                    </TouchableOpacity> : null
                }
            </View>
        );
    }
}

const styles = ScaledSheet.create({
    boxA: {
        height:'100%',
        width:'44@s',
        justifyContent: 'flex-start'
    },
    boxB: {
        flex:1,
        paddingRight: '15@ms',
        justifyContent: 'flex-end'
    },
    headerRight: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end'
    },
    headerRightBox: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchImage: {
        width: '18@s',
        height: '18@vs',
    },
    signInImage:{
        width: '20@s',
        height: '20@vs',
    }
});

export default ImageAndFonts;



















