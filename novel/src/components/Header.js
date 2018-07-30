
'use strict';

import React,{ PureComponent } from 'react';
import { View, TouchableOpacity, Image, Text, StatusBar } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import {ScaledSheet, BackgroundColor, Img, Styles, Fonts, Colors} from "../common/Style";
import { height, pixel } from "../common/Tool";
import { arrow } from "../common/Icons";
import StatusBarSet from '../components/StatusBarSet';

type Props = {
    borderBottomColor: ?string,
    isArrow: ?boolean,
    arrowColor?: string,
    goBack: () => void,
    arrowColor: ?string,
    fontImage: number,
    fontImageStyles: Object,
    isFontImage: ?boolean,
    isConfigLeftChildren: ?boolean,
    isConfigRightChildren: ?boolean,
    childrenLeft?: any,
    childrenRight?: any,
    demoLeftStyles?: ?Object,
    demoRightStyles?: ?Object,
    title?: string,
    titleColor?: Object,
    titleRightChildren?: any ,
    isTitleRight?: boolean,
    headerBackgroundColor?: ?string,
    stylesHeaderPosition?: Object,
};

const commonMarginTop = StatusBar.currentHeight;

class Header extends PureComponent<Props>{
    static defaultProps = {
        borderBottomColor: BackgroundColor.bg_e5e5e5,
        isArrow: false,
        isFontImage: true,
        isConfigLeftChildren: false,
        isConfigRightChildren: false,
        arrowColor: '#304758',
        fontImage: 0,
        fontImageStyles: {},
        childrenLeft: {},
        childrenRight: {},
        demoLeftStyles: {
            flex: 1,
            paddingLeft: moderateScale(15)
        },
        demoRightStyles: {
            flex: 1,
            paddingRight: moderateScale(15)
        },
        title: '暂无',
        titleColor: Colors.gray_404040,
        isTitleRight: false,
        headerBackgroundColor: BackgroundColor.bg_fff,
        stylesHeaderPosition: {}
    };
    constructor(props){
        super(props);
        this.state = {};
    }
    renderArrow(){
        const { goBack, arrowColor } = this.props;

        return (
            <TouchableOpacity
                activeOpacity={0.8}
                style={styles.arrow}
                onPress={() => goBack && goBack()}
            >
                <Image source={arrow.left} tintColor={arrowColor} style={[Img.resizeModeContain, styles.arrowImage]}/>
            </TouchableOpacity>
        );
    }
    renderDemoLeft(){
        const { isConfigLeftChildren, childrenLeft, demoLeftStyles } = this.props;

        return (
            <View style={[styles.demo, styles.demoLeft, demoLeftStyles]}>
                { this.renderFontImage() }
                { isConfigLeftChildren ?  childrenLeft : null}
            </View>
        );
    }
    renderFontImage(){
        const { fontImage, fontImageStyles, isFontImage } = this.props;

        return (isFontImage ? <Image source={fontImage} style={[Img.resizeModeContain, fontImageStyles]}/> : null);
    }
    renderDemoRight(){
        const { childrenRight, isConfigRightChildren, demoRightStyles } = this.props;

        return (
            <View style={[styles.demo, styles.demoRight, demoRightStyles]}>
                { isConfigRightChildren ? childrenRight : null }
            </View>
        );
    }
    renderTitle(){
        const { title, titleRightChildren, isTitleRight, titleColor } = this.props;

        return (
            <View style={[styles.titleRows, styles.demo, Styles.flexCenter]}>
                <Text style={[Fonts.fontFamily, Fonts.fontSize16, titleColor]}>{ title }</Text>
                {
                    isTitleRight ?
                    <View style={[styles.titleRight]}>
                        { titleRightChildren }
                    </View> : null
                }
            </View>
        );
    }
    renderStatusBar(){
        return (<StatusBarSet/>);
    }
    render(){
        const { borderBottomColor, isArrow, headerBackgroundColor, stylesHeaderPosition } = this.props;

        return (
            <View style={[
                styles.headerContent,
                stylesHeaderPosition,
                { borderBottomColor, backgroundColor: headerBackgroundColor, marginTop: commonMarginTop }
            ]}>
                { this.renderStatusBar() }
                { !isArrow ? null : this.renderArrow() }
                { !isArrow ? null : this.renderTitle() }
                { !isArrow ? this.renderDemoLeft() : null }
                { !isArrow ? this.renderDemoRight() : null }
            </View>
        );
    }
}

const styles = ScaledSheet.create({
    titleRows: {
        width: '100%',
        left: 0,
        top: 0,
        zIndex: 1,
        position: 'absolute',
    },
    titleRight: {
        height: '44@vs',
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        zIndex: 100
    },
    demo: {
        height: '44@vs',
    },
    demoRight: {
        flexDirection: 'row',
    },
    demoLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    arrow: {
        height: '44@vs',
        width: '100@s',
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: '15@ms',
        position: "relative",
        zIndex: 100,
    },
    arrowImage: {
        height: '18@ms',
    },
    headerContent: {
        height: '44@vs',
        position: 'relative',
        borderBottomWidth: 1 / pixel,
        borderBottomColor: 'transparent',
        width: '100%',
        flexDirection: 'row',
        zIndex: 10,
    },
});

export default Header;
