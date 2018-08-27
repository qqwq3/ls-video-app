
'use strict';

import React,{PureComponent} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Animated } from 'react-native';
import HeaderBox from '../../common/HeaderBox';
import { pixel, width, height } from '../../common/tool';
import PropTypes from 'prop-types';

class CommonHeader extends PureComponent<{}>{
    static propTypes = {
        tintColor: PropTypes.string
    };
    static defaultProps = {
        tintColor: 'rgb(193,193,193)' // 'rgba(0,117,248,1)'
    };
    constructor(props){
        super(props);
        this.animateds = { SpringAnimated: new Animated.Value(0) };
    }
    componentWillMount() {
        this._animated();
    }
    render(){
        const { tintColor } = this.props;
        const iconTreasurebox: number = require('../imgs/icon_treasurebox_color.png'),
              iconClander: number = require('../imgs/icon_clander_color.png'),
              iconHistoryRecord: number = require('../imgs/icon_history_record.png'),
              iconSearch: number = require('../imgs/icon_search.png');

        return (
            <HeaderBox>
                <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={this._search.bind(this)}
                    style={[styles.headerInnerBox,{paddingLeft:15}]}
                >
                    <Image source={iconSearch} style={styles.headerSearchIcon} resizeMode={'contain'} tintColor={tintColor}/>
                </TouchableOpacity>
                <View style={[styles.headerInnerBox,{justifyContent:'flex-end',marginRight:-8}]}>
                    {/*<TouchableOpacity*/}
                        {/*accessible={true}*/}
                        {/*activeOpacity={1}*/}
                        {/*style={[styles.headerComBox,{width:80,justifyContent:'flex-end'}]}*/}
                        {/*onPress={this._movieTicket.bind(this)}*/}
                    {/*>*/}
                        {/*<Image*/}
                            {/*source={require('../imgs/icon_ticket.png')}*/}
                            {/*style={[styles.otherIcon1,{height:16}]}*/}
                            {/*resizeMode={'contain'}*/}
                            {/*tintColor={tintColor}*/}
                        {/*/>*/}
                    {/*</TouchableOpacity>*/}

                    {
                        this._common(
                            'box',
                            iconTreasurebox,
                            this.animateds.SpringAnimated,
                            _ => this._treasureBox(),
                            _ => this._promptBox()
                        )
                    }
                    {
                        this._common(
                            'sign',
                            iconClander,
                            this.animateds.SpringAnimated,
                            _ => this._signManager(),
                            _ => this._promptSign()
                        )
                    }

                    <View style={{marginRight:35}}/>

                    {/*<TouchableOpacity*/}
                        {/*activeOpacity={1}*/}
                        {/*style={[styles.headerComBox,{width:70,justifyContent:'center'}]}*/}
                        {/*onPress={this._watchHistory.bind(this)}*/}
                    {/*>*/}
                        {/*<Image source={iconHistoryRecord} style={styles.otherIcon2} resizeMode={'contain'} tintColor={tintColor}/>*/}
                    {/*</TouchableOpacity>*/}
                </View>
            </HeaderBox>
        )
    }
    // 宝箱 - 去登录提示
    _promptBox(){

    }
    // 签到 - 去登录
    _promptSign(){

    }
    // 公共 - demo
    _common(type: string, source: number, scale: any, callback: Function => void, prompt: Function => void){
        const { signInit, box } = this.props;
        const singData = signInit && signInit.initSign && parseInt(signInit.initSign.code) === 0 && signInit.initSign.data;
        const singed = singData ? singData.singed : false;
        const boxData = box && box.initTBox &&  parseInt(box.initTBox.code) === 0 && box.initTBox.data;
        const status = boxData ? boxData.status : true;
        const iconClanderGray = require('../imgs/icon_clander_gray.png');
        const iconTreasureBoxGray = require('../imgs/icon_treasurebox_gray.png');

        return (
            <TouchableOpacity
                activeOpacity={1}
                style={[styles.headerComBox,{width:48,justifyContent:'flex-end',paddingRight:2}]}
                onPress={() => (callback && callback())}
            >
                {
                    type === 'sign' && (
                        //singed ?
                        //<Image source={iconClanderGray} resizeMode={'contain'}/> :
                        <Animated.Image source={source} resizeMode={'contain'} style={[{transform:[{scale: scale}]}]}/>
                    )
                }
                {
                    type === 'box' && (
                        //!status ?
                        //<Image source={iconTreasureBoxGray} resizeMode={'contain'}/> :
                        <Animated.Image source={source} resizeMode={'contain'} style={[{transform:[{scale: scale}]}]}/>
                    )
                }
            </TouchableOpacity>
        );
    }
    // 执行动画
    _animated(){
        const { SpringAnimated } = this.animateds;

        SpringAnimated.setValue(0.7);

        Animated.parallel([
            Animated.spring(SpringAnimated,{
                toValue: 1,
                friction: 1,
            }),
        ]).start(() => this._animated());
    }
    _search() {
        const { navigate } = this.props.navigation;
        return navigate('Search');
    }
    _movieTicket(){
        const { navigate } = this.props.navigation;
        return navigate('SpreadPage');
    }
    _watchHistory(){
        const { navigate } = this.props.navigation;
        return navigate('HistoryPage');
    }
    // 开宝箱
    _treasureBox(){
        const { navigate } = this.props.navigation;
        return navigate('TreasureBox');
    }

    // 签到
    _signManager(){
        const { navigate } = this.props.navigation;
        return navigate('Sign');
    }


}

export default CommonHeader;

const styles = StyleSheet.create({
    otherIcon1:{
        height:17,
    },
    otherIcon2:{
        height:17,
    },
    headerStyle: {
        backgroundColor: '#fff',
        height: 44,
        flexDirection: 'row'
    },
    headerTitleStyle: {
        color: '#052D60',
        fontSize: 18,
        alignSelf: 'center',
        fontWeight: 'bold',
    },
    headerBox: {
        height: 44,
        flexDirection: 'row',
        alignItems: 'center',
        width: width / 2
    },
    headerInnerBox:{
        height:44,
        flex:1,
        flexDirection:'row',
        alignItems:'center',
        overflow:'hidden'
    },
    headerComBox:{
        height:44,
        flexDirection:'row',
        alignItems:'center'
    },
    headerSearchIcon: {},
});





























