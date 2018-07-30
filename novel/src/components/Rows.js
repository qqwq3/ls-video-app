
'use strict';

import React, { PureComponent } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { Styles, ScaledSheet, Fonts, Colors, BackgroundColor, Img } from "../common/Style";
import { pixel } from "../common/Tool";
import { arrow } from "../common/Icons";

type Props = {
    activeOpacity?: number,
    isClick?: boolean,
    callBack: () => void,
    showLeftTitle?: boolean,
    leftTitle?: ?string,
    showBottomBorder?: ?boolean,
    isLeftConfigure?: boolean,
    leftComponents?: any,
    isRightConfigure?: boolean,
    rightComponents?: any,
    nonConfigRightComponents?: any,
    showRightArrow?: boolean
};

type State = {

};

class Rows extends PureComponent<Props, State>{
    static defaultProps = {
        activeOpacity: 0.50,
        isClick: true,
        showLeftTitle: true,
        leftTitle: '',
        showBottomBorder: true,
        isLeftConfigure: false,
        leftComponents: null,
        isRightConfigure: false,
        rightComponents: null,
        nonConfigRightComponents: null,
        showRightArrow: false
    };
    constructor(props){
        super(props);
        this.state = {};
    }
    onPress(){
        const { isClick, callBack } = this.props;

        if(!isClick){
            return null;
        }

        return callBack && typeof callBack === 'function' && callBack();
    }
    render(){
        const {
            activeOpacity, showLeftTitle,
            leftTitle, showBottomBorder,
            isLeftConfigure, leftComponents,
            isRightConfigure, rightComponents,
            nonConfigRightComponents, showRightArrow,
            isClick
        } = this.props;

        return (
            <TouchableOpacity
                activeOpacity={isClick ? activeOpacity : 1.0}
                style={[
                    styles.rows,
                    Styles.row,
                    Styles.paddingHorizontal15,
                    { borderBottomWidth: verticalScale(1 / pixel) },
                    showBottomBorder ? styles.rowsBottomBorder : {borderBottomColor:'transparent'}
                ]}
                onPress={this.onPress.bind(this)}
            >
                {
                    isLeftConfigure ? leftComponents :
                    <View style={[styles.cellLeft]}>
                        { showLeftTitle ? <Text style={[Fonts.fontFamily, Fonts.fontSize15, Colors.gray_808080]}>{ leftTitle }</Text> : null }
                    </View>

                }
                {
                    isRightConfigure ? rightComponents :
                    <View style={[styles.cellRight]}>
                        { nonConfigRightComponents }
                        {
                            showRightArrow ?
                            <Image source={arrow.right} style={[Img.resizeModeContain, styles.arrow]}/> : null
                        }
                    </View>
                }
            </TouchableOpacity>
        );
    }
}

const styles = ScaledSheet.create({
    arrow: {
        tintColor: '#b2b2b2',
        height: '15@vs'
    },
    rowsBottomBorder: {
        borderBottomColor: BackgroundColor.bg_e5e5e5,
    },
    rows: {
        height: '44@vs',
        backgroundColor: '#FFFFFF',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    cellLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    },
    cellRight: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "flex-end"
    },
});

export default Rows;




















