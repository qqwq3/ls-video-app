
// 书写评论

'use strict';

import React,{ Component } from 'react';
import { View, TouchableOpacity, Text, TextInput } from 'react-native';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import { Styles, ScaledSheet, BackgroundColor, Fonts, Colors } from "../../common/Style";
import Header from '../../components/Header';
import { addComments } from "../../actions/Reader";
import { infoToast, setStatusBar } from "../../common/Tool";
import Toast from "react-native-root-toast";

type Props = {};

type State = {};

class BookComment extends Component<Props, State>{
    constructor(props){
        super(props);
        this.state = {
            focusStatus: false,
        };
        this.commentsText = '';
        this.commentsTime = Date.now();
        this.toastConfig = { duration: 2000, position: Toast.positions.CENTER };
    }
    componentDidMount(){
        setStatusBar && setStatusBar(BackgroundColor.bg_fff, true, 'dark-content');
    }
    componentWillReceiveProps(nextProps){
        // 评论提示
        if(nextProps.commentsTimeUpdated > this.commentsTime && nextProps.comments){
            const code = nextProps.comments.code;

            this.commentsTime = nextProps.commentsTimeUpdated;

            if(parseInt(code) === 0){
                infoToast && infoToast('评论成功', this.toastConfig);
                this._goBack();
                return;
            }

            const error = nextProps.comments.error;

            if(error){
                infoToast && infoToast('评论失败' + error.message, this.toastConfig);
            }
        }
    }
    componentWillUnmount(){
        this.setState = () => { return };
    }
    // 返回 - function
    _goBack() {
        const { navigation } = this.props;
        navigation && navigation.goBack();
    }
    // 头部 - demo
    renderHeader() {
        return (
            <Header
                title={'书写评论'}
                isArrow={true}
                goBack={this._goBack.bind(this)}
            />
        );
    }
    // 输入文字 - function
    _changeText(commentsText){
        this.commentsText = commentsText;
    }
    // 输入框 - demo
    renderInputBox(){
        return (
            <View style={styles.commentsContent}>
                <TextInput
                    style={[styles.commentsTextInput, Fonts.fontFamily, Fonts.fontSize14]}
                    multiline={true}
                    editable={true}
                    autoFocus={this.state.focusStatus}
                    autoCapitalize={'none'}
                    placeholder={'写出战胜作者的评论吧~'}
                    placeholderTextColor={'#cccccc'}
                    underlineColorAndroid={'transparent'}
                    onChangeText={this._changeText.bind(this)}
                    keyboardType={'default'}
                    selectionColor={'#f3916b'}
                />
            </View>
        );
    }
    // 提交评论 - function
    _sendComments(){
        const { addComments, navigation } = this.props;
        const bookId = navigation.getParam('bookId');
        const bookHexId = navigation.getParam('bookHexId');
        const chapterId = navigation.getParam('chapterId');
        let content = this.commentsText;

        if(content === ''){
            return infoToast && infoToast('请输入有效的评论', this.toastConfig);
        }

        addComments && addComments(bookHexId, bookId, chapterId, content);
    }
    // 提交评论 - demo
    renderButton(){
        return (
            <View style={[Styles.row, styles.butBox]}>
                <TouchableOpacity
                    activeOpacity={0.5}
                    style={[styles.but, Styles.flexCenter]}
                    onPress={this._sendComments.bind(this)}
                >
                    <Text style={[Fonts.fontFamily, Fonts.fontSize15, Colors.white_FFF]}>提交评论</Text>
                </TouchableOpacity>
            </View>
        );
    }
    render(){
        return (
            <View style={[Styles.container, {backgroundColor: BackgroundColor.bg_fff}]}>
                { this.renderHeader() }
                { this.renderInputBox() }
                { this.renderButton() }
            </View>
        );
    }
}

const styles = ScaledSheet.create({
    butBox: {
        paddingTop: '40@ms',
        flex: 1,
        backgroundColor: BackgroundColor.bg_f1f1f1,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    but: {
        width: '80%',
        height: '44@vs',
        backgroundColor: BackgroundColor.bg_f3916b,
        borderRadius: '44@ms',
        overflow: 'hidden',
    },
    commentsContent: {
        width: '100%',
    },
    commentsTextInput:{
        width: '100%',
        height: '200@vs',
        padding: '15@ms',
        textAlign: 'left',
        textAlignVertical: 'top', // 只支持Android
        lineHeight: '20@vs',
        color: '#333333',
    },
});

const mapStateToProps = (state, ownProps) => {
    let bookHexId = ownProps.navigation.getParam('bookHexId');
    let data = state.getIn(['reader','chapter', bookHexId]);

    if(Immutable.Map.isMap(data)){ data = data.toJS() }
    return { ...ownProps, ...data };
};

export default connect(mapStateToProps,{ addComments })(BookComment);









