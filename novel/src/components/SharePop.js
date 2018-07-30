
'use strict';

import React, { Component } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { other } from "../common/Icons";
import { BackgroundColor, Colors, Fonts, Img, ScaledSheet, Styles } from "../common/Style";
import { pixel } from "../common/Tool";

type Props = {
    shareFriends: () => void,
    shareFriendsText: ?string,
    shareFriendsCircle: () => void,
    shareFriendsCircleText: ?string,
    sharePanelCancel: () => void,
    sharePanelCancelText: ?string,
};

type State = {};

class SharePop extends Component<Props, State>{
    static defaultProps = {
        shareFriendsText: '发送给朋友',
        shareFriendsCircleText: '分享到朋友圈',
        sharePanelCancelText: '关闭',
    };
    render(){
        const {
            shareFriends, shareFriendsCircle,
            shareFriendsText, shareFriendsCircleText,
            sharePanelCancel, sharePanelCancelText
        } = this.props;

        return (
            <View style={styles.shareContent}>
                <View style={[styles.caBorderBottom, styles.caBox]}>
                    <TouchableOpacity
                        activeOpacity={0.5}
                        onPress={() => shareFriends ? shareFriends() : null}
                        style={[Styles.flexCenter]}
                    >
                        <Image source={other.friends} style={[Img.resizeModeContain, styles.shareImg]}/>
                        <Text style={[Fonts.fontFamily, Fonts.fontSize12, Colors.gray_404040]}>
                            { shareFriendsText }
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.5}
                        onPress={() => shareFriendsCircle ? shareFriendsCircle() : null}
                        style={[Styles.flexCenter]}
                    >
                        <Image source={other.friendsCircle} style={[Img.resizeModeContain, styles.shareImg]}/>
                        <Text style={[Fonts.fontFamily, Fonts.fontSize12, Colors.gray_404040]}>
                            { shareFriendsCircleText }
                        </Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity
                    activeOpacity={0.5}
                    style={[Styles.flexCenter, Styles.flex1]}
                    onPress={() => sharePanelCancel ? sharePanelCancel() : null}
                >
                    <Text style={[Fonts.fontFamily, Fonts.fontSize15, {color:'red'}]}>
                        { sharePanelCancelText }
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = ScaledSheet.create({
    shareContent: {
        flex: 1,
        backgroundColor: BackgroundColor.bg_fff
    },
    caBorderBottom: {
        borderBottomWidth: 1 / pixel,
        borderBottomColor: BackgroundColor.bg_e5e5e5,
    },
    caBox: {
        flex: 2,
        justifyContent: 'space-around',
        alignItems: 'center',
        flexDirection: 'row'
    },
    shareImg: {
        marginBottom: '4@ms',
    }
});

export default SharePop;



















