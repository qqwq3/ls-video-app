
'use strict';

import React,{ PureComponent } from 'react';
import { Text, View, Image } from 'react-native';
import { Styles, ScaledSheet, Img, Fonts, Colors } from "../common/Style";
import { def } from "../common/Icons";

type Props = {
    backgroundColor: ?string,
    source: number | Object,
    imageStyle: ?Object | Array<any>,
    showText: ?boolean,
    TextContentStyle: ?Object | Array<any>,
    text: ?string,
    textSize: ?Object,
    textColor?: Object,
};

type State = {};

class DefaultDisplay extends PureComponent<Props, State>{
    static defaultProps = {
        source: def.noData,
        backgroundColor: '#FFFFFF',
        imageStyle: {},
        showText: false,
        TextContentStyle: Styles.container,
        text: '暂无数据',
        textSize: Fonts.fontSize14,
        textColor: Colors.gray_b2b2b2,
    };
    constructor(props){
        super(props);
        this.state = {};
    }
    render(){
        const { backgroundColor, imageStyle,
            source, showText ,
            TextContentStyle, text,
            textSize, textColor
        } = this.props;

        return (
            !showText ?
            <View style={[Styles.container, {backgroundColor: backgroundColor}, styles.box, Styles.flexCenter]}>
                <Image source={source} style={[Img.resizeModeContain, imageStyle, styles.img]} />
            </View> :
            <View style={TextContentStyle}>
                <Text style={[Fonts.fontFamily, textSize, textColor]}>{ text }</Text>
            </View>
        );
    }
}

const styles = ScaledSheet.create({
    box: {
        flex: 1
    },
    img: {
        width: '60@s',
    },
});

export default DefaultDisplay;


