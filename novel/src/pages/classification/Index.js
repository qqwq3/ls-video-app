
'use strict';

import React,{ Component } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import {Styles, ScaledSheet, Fonts, Colors, BackgroundColor} from "../../common/Style";
import { tab, fontImage } from "../../common/Icons";
import TabBarIcon from '../../components/TabBarIcon';
import Header from '../../components/Header';
import ImageAndFonts from '../../components/ImageAndFonts';
import { width } from "../../common/Tool";
import Books from '../../components/Books';
import { loadCategory } from "../../actions/Classification";

type Props = {};

class Classification extends Component<Props>{
    static navigationOptions = {
        tabBarIcon: ({focused}) => (
            <TabBarIcon
                focused={focused}
                defaultIcon={tab.classification.defaultIcon}
                activeIcon={tab.classification.activeIcon}
            />
        ),
        tabBarLabel: '分类',
        header: null
    };
    constructor(props){
        super(props);
        this.state = {
            currentIndex: 0,
            contentHeight: 0,
        };
    }
    componentDidMount() {
        const { loadCategory } = this.props;
        loadCategory && loadCategory();
    }
    // 搜索
    _search(){
        const { navigation } = this.props;
        navigation.navigate('SearchEngines');
    }
    // 头部 - demo
    renderHeader(){
        return (
            <Header
                fontImage={fontImage.classification}
                fontImageStyles={styles.fontImageStyles}
                isConfigRightChildren={true}
                demoRightStyles={styles.demoRightStyles}
                childrenRight={
                    <ImageAndFonts
                        number={1}
                        eventOne={this._search.bind(this)}
                    />
                }
            />
        );
    }
    // 内容 - demo
    renderContent(){
        return (
            <View style={[styles.content]}>
                { this.renderNav() }
                { this.renderBookContent() }
            </View>
        );
    }
    // 菜单切换 - function
    navSwitch({index}){
        this.setState({currentIndex: index});
        this.scrollViewRef && this.scrollViewRef.scrollTo({x: 0, y: index * this.state.contentHeight, animated: true});
    }
    textControl(text: string){
        let k = '';

        switch (text){
            case 'female': k = '女频';
                break;

            case 'male' : k = '男频';
                break;
        }

        return k;
    }
    // 导航 - demo
    renderNav(){
        const propRecords = this.props.records ? this.props.records : {};
        const records = Object.keys(propRecords);

        return (
            <View style={[styles.navContent, {backgroundColor: BackgroundColor.bg_f1f1f1}]}>
                {
                    records.map((item, index) => {
                        const bgLineColor = this.state.currentIndex === index ? BackgroundColor.bg_f3916b : 'transparent';
                        const bgClickColor = this.state.currentIndex === index ? BackgroundColor.bg_fff : 'transparent';
                        const fontColor = this.state.currentIndex === index ? Colors.orange_f3916b : Colors.gray_808080;

                        return (
                            <TouchableOpacity
                                key={index}
                                activeOpacity={1}
                                style={[styles.menu, Styles.flexCenter, {backgroundColor: bgClickColor}]}
                                onPress={this.navSwitch.bind(this,{index})}
                            >
                                <Text style={[Fonts.fontFamily, Fonts.fontSize15, fontColor]}>{ this.textControl(item) }</Text>
                                <View style={[styles.navLine,{backgroundColor: bgLineColor}]}/>
                            </TouchableOpacity>
                        );
                    })
                }
            </View>
        );
    }
    // 获取内容的信息 - function
    contentLayout(events){
        const { height } = events.nativeEvent.layout;
        this.setState({contentHeight: height});
    }
    // 书内容 - demo
    renderBookContent(){
        const propRecords = this.props.records ? this.props.records : {};
        const records = Object.values(propRecords);

        return (
            <View onLayout={this.contentLayout.bind(this)} style={[styles.bookContent]}>
                <ScrollView
                    ref={ref => this.scrollViewRef = ref}
                    pagingEnabled={true}
                    scrollEnabled={false}
                    horizontal={false}
                    showsVerticalScrollIndicator={false}
                    style={[styles.bookContent]}
                >
                    {
                        records.length !== 0 ?
                            records.map((item, index) => {

                                return (
                                    <ScrollView
                                        key={index}
                                        showsVerticalScrollIndicator={false}
                                        style={[styles.scrollContent,{height: this.state.contentHeight}]}
                                    >
                                        <View style={[{flexWrap: 'wrap', flexDirection:'row'}]}>
                                            {
                                                (item || []).map((menu, j) => {
                                                    return (
                                                        <TouchableOpacity
                                                            activeOpacity={0.75}
                                                            key={j}
                                                            style={[styles.bookBox, Styles.flexCenter,{width: (width - scale(90)) / 2}]}
                                                            onPress={this.cateMenu.bind(this, item, j)}
                                                        >
                                                            <Books source={{uri: menu.cover}} size={'minimum'} clickAble={false}/>
                                                            <View style={styles.bookText}>
                                                                <Text style={[Fonts.fontFamily, Fonts.fontSize12, Colors.gray_808080]}>{ menu.categoryName }</Text>
                                                            </View>
                                                        </TouchableOpacity>
                                                    )
                                                })
                                            }
                                        </View>
                                    </ScrollView>
                                );
                            }) : null
                    }
                </ScrollView>
            </View>
        );
    }
    cateMenu(item, index){
        const { navigation } = this.props;
        navigation && navigation.navigate('SecondCate',{ item, index });
    }
    render(){
        return (
            <View style={[Styles.container]}>
                { this.renderHeader() }
                { this.renderContent()  }
            </View>
        );
    }
}

const styles = ScaledSheet.create({
    fontImageStyles: {
        height: '24@vs'
    },
    bookText: {
        paddingLeft: '10@ms',
    },
    bookBox: {
        flexDirection: 'row',
        paddingTop: '30@ms',
    },
    scrollContent: {
        width: '100%',
        position: 'relative'
    },
    navLine: {
        width: '2@s',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 0,
    },
    menu: {
        height: '44@vs',
        position: 'relative'
    },
    navContent: {
        width: '90@s',
        height: "100%",
        overflow: 'hidden'
    },
    bookContent: {
        flex: 1,
        overflow: 'hidden'
    },
    demoRightStyles: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    content: {
        flex: 1,
        position: 'relative',
        flexDirection: 'row'
    },
});

const mapStateToProps = (state, ownProps) => {
    let data = state.getIn(['classification', 'category']);

    if(Immutable.Map.isMap(data)){ data = data.toJS() }
    return { ...ownProps, ...data };
};

export default connect(mapStateToProps,{ loadCategory })(Classification);











