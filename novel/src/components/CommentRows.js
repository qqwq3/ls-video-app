
'use strict';

import React,{ Component } from 'react';
import { View, TouchableOpacity, Image, Text } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import ImageLoad from 'react-native-image-placeholder';
import { Styles, ScaledSheet, Img, Fonts, Colors, BackgroundColor } from "../common/Style";
import { pixel } from "../common/Tool";
import { my} from "../common/Icons";

type Props = {
    userName?: string,
    contentText?: string,
    commentTime?: string,
    pointPraise?: string | number,
    pointPraiseOnPress?: () => void,
    ImageSource?: number | Object,
    showFaces: boolean,
    isFabulous: boolean,
};

type State = {

};

class CommentRows extends Component<Props, State>{
    static defaultProps = {
        userName: '这里是用户名',
        contentText: "这里是内容",
        commentTime: '2018-01-01',
        pointPraise: '20' || 20,
        pointPraiseOnPress: () => null,
        ImageSource: my.userDefault,
        showFaces: true,
        isFabulous: true,
    };
    constructor(props){
        super(props);
        this.state = {};
    }
    // 点赞 - function
    _pointPraise(){
        this.props.pointPraiseOnPress && this.props.pointPraiseOnPress();
    }
    render(){
        const {
            userName, contentText,
            commentTime, pointPraise,
            ImageSource, showFaces,
            isFabulous
        } = this.props;

        return (
            <View style={[
                    styles.commentsRow,
                    Styles.paddingHorizontal15,
                    { backgroundColor: BackgroundColor.bg_fff, borderBottomWidth: scale(1/pixel) }
                ]}
            >
                {
                    showFaces ?
                        <View style={[styles.comments_left, Styles.flexCenter, Styles.marginRight15]}>
                            <ImageLoad
                                source={ImageSource}
                                style={[styles.userImage]}
                                customImagePlaceholderDefaultStyle={[styles.userImage]}
                                placeholderSource={my.userDefault}
                                isShowActivity={false}
                            />
                        </View> : null
                }
                <View style={styles.comments_right}>
                    <View style={styles.comments_title}>
                        <Text numberOfLines={1} style={[Fonts.fontFamily, Fonts.fontSize14, Colors.gray_404040]}>{ userName }</Text>
                    </View>
                    <View style={[styles.comments_content, {paddingTop: moderateScale(5)}]}>
                        <Text style={[Fonts.fontFamily, Fonts.fontSize12, Colors.gray_808080, {lineHeight: verticalScale(18)}]}>
                            { contentText }
                        </Text>
                    </View>
                    <View style={[styles.comments_date_dz]}>
                        <View style={styles.comments_date}>
                            <Text style={[Fonts.fontFamily, Fonts.fontSize12, Colors.gray_b2b2b2]}>{ commentTime }</Text>
                        </View>
                        {
                            isFabulous ?
                                <TouchableOpacity
                                    activeOpacity={0.50}
                                    style={styles.comments_dz}
                                    onPress={this._pointPraise.bind(this)}
                                >
                                    <Image source={my.fabulous} style={[Img.resizeModeContain, styles.fabulousImage]} />
                                    <View style={{marginLeft: moderateScale(5), marginBottom: moderateScale(-3)}}>
                                        <Text style={[Fonts.fontFamily, Fonts.fontSize12, Colors.gray_b2b2b2]}>{ pointPraise }</Text>
                                    </View>
                                </TouchableOpacity> :
                                <View style={styles.comments_dz}>
                                    <Image source={my.fabulous} style={[Img.resizeModeContain, styles.fabulousImage]} />
                                    <View style={{marginLeft: moderateScale(5), marginBottom: moderateScale(-3)}}>
                                        <Text style={[Fonts.fontFamily, Fonts.fontSize12, Colors.gray_b2b2b2]}>{ pointPraise }</Text>
                                    </View>
                                </View>
                        }
                    </View>
                </View>
            </View>
        );
    }
}

const styles = ScaledSheet.create({
    userImage: {
        width: '30@s',
        height: '30@vs'
    },
    fabulousImage: {
        width: '15@s',
        height: '15@vs'
    },
    comments_date: {
        alignSelf: 'flex-end',
        paddingBottom: '5@ms',
    },
    comments_left: {
        width: '30@s',
        height: '30@vs',
        borderRadius: '15@ms',
        backgroundColor: '#CBCBCB',
        overflow: 'hidden',
    },
    comments_dz: {
        width: '120@s',
        height: '30@vs',
        position: 'absolute',
        right: 0,
        top: 0,
        zIndex: 1000,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        paddingBottom: '8.5@ms',
    },
    comments_date_dz: {
        flexDirection: 'row',
        height: '30@vs',
        position: 'relative'
    },
    comments_content: {
        flexWrap: 'wrap',
        flexDirection: 'column',
    },
    comments_title: {
        height: '30@vs',
        alignItems: 'center',
        flexDirection: 'row'
    },
    comments_right: {
        flex:1,
        overflow: 'hidden',
    },
    commentsRow: {
        flexDirection: 'row',
        overflow: "hidden",
        // borderBottomWidth: 1 / pixel,
        borderBottomColor: "#E5E5E5",
        borderStyle: 'solid',
        paddingBottom: '10@ms',
        paddingTop: '10@ms',
    },
});

export default CommentRows;
