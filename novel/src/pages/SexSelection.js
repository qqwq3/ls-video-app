
'use strict';

import React from 'react';
import { ActivityIndicator, View, Text, Image, TouchableHighlight, TouchableOpacity } from 'react-native';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import { Styles, ScaledSheet, Fonts, Colors, Img, BackgroundColor } from "../common/Style";
import { sex } from "../common/Icons";
import { submitSex } from '../actions/SexSelection';
import { commonLoad } from "../common/Storage";
import BaseComponent from "../components/BaseComponent";
import { setStatusBar } from "../common/Tool";
import StatusBarSet from '../components/StatusBarSet';

type Props = {};

type State = {};

class SexSelection extends BaseComponent<Props, State>{
    constructor(props){
        super(props);
        this.state = {
            serverRet: false
        };
        this.sexArr = [
            {
                image: sex.boy,
                name: '男生小说'
            },
            {
                image: sex.girl,
                name: '女生小说'
            }
        ];
        this.updateTime = Date.now();
    }
    async componentWillMount() {
        // 获取储存的性别状态
        let sex = await commonLoad('sex');
        //进入性别选择界面
        if(sex) {
            this.jump();
        }
        else {
            this.setState({serverRet: true});
        }

        // 状态栏设置
        setStatusBar && setStatusBar('#FFFFFF',true);
    }
    componentWillReceiveProps(nextProps){
        super.componentWillReceiveProps(nextProps);
        // 成功提示
        if(nextProps && nextProps.timeUpdated > this.updateTime){
            this.updateTime = Date.now();
            this.jump()
        }
    }
    // 调转 - function
    jump(){
        this.goPage();
    }
    // 调转至页面 - function
    goPage(params: string = 'Tab'){
        const { navigation } = this.props;
        navigation.replace('Tab');
    }
    // 性别选择 - demo
    sexSelect(index){
        this.props.submitSex && this.props.submitSex(index + 1);
    }
    noSelect() {
        this.props.submitSex && this.props.submitSex(0);
    }
    render(){
        const { serverRet } = this.state;

        if(!serverRet) {
            return (
                <View style={styles.background}>
                    <StatusBarSet/>
                    <ActivityIndicator color={BackgroundColor.bg_f3916b} style={styles.loading} />
                    <Text style={styles.tip}>内容载入中...</Text>
                </View>
            )
        }

        return (
            <View style={[Styles.container]}>
                <StatusBarSet/>

                <TouchableHighlight
                    onPress={this.noSelect.bind(this)}
                    activeOpacity={1.0}
                    style={styles.jumpBox}
                    underlayColor={'#FFFFFF'}
                >
                    <Text style={[Fonts.fontFamily, Fonts.fontSize15, Colors.gray_404040]}>跳过</Text>
                </TouchableHighlight>

                <View style={[styles.selectTitle, Styles.flexCenter]}>
                    <Text style={[Fonts.fontFamily, Fonts.fontSize24, Colors.orange_f3916b]}>请选择您的</Text>
                    <Text style={[Fonts.fontFamily, Fonts.fontSize24, Colors.orange_f3916b]}>阅读偏好</Text>
                </View>

                <View style={styles.jumpRow}>
                    {
                        this.sexArr.map((item, index) => {
                            return (
                                <TouchableOpacity
                                    key={index}
                                    activeOpacity={0.5}
                                    style={[Styles.flexCenter]}
                                    onPress={this.sexSelect.bind(this, index)}
                                >
                                    <Image source={item.image} style={[styles.image, Img.resizeModeContain]}/>
                                    <Text style={[Fonts.fontFamily, Fonts.fontSize15,Colors.gray_808080]}>{ item.name }</Text>
                                </TouchableOpacity>
                            );
                        })
                    }
                </View>
            </View>
        );
    }
}

const styles = ScaledSheet.create({
    background: {
        backgroundColor: '#fff',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    tip: {
        color: 'rgb(64,64,64)',
        fontSize: 14,
        position:'absolute',
        bottom: 40
    },
    loading: {
        position: 'absolute',
        bottom: 100,
    },
    image: {
        width: '120@s',
        height: '120@vs',
        marginBottom: '20@ms',
    },
    jumpRow: {
        position: 'relative',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: '40@ms',
    },
    jumpBox: {
        height: '50@vs',
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingRight: '15@ms',
        marginTop: '10@vs',
    },
    selectTitle: {
        marginVertical: '60@ms',
    }
});

const mapStateToProps = (state, ownProps) => {
    let data = state.getIn(['sexSelection','select']);

    if(Immutable.Map.isMap(data)){ data = data.toJS() }
    return { ...ownProps, ...data };
};

export default connect(mapStateToProps,{ submitSex })(SexSelection);