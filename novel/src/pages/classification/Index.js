
'use strict';

import React,{ Component } from 'react';
import { View, Text, TouchableOpacity, ScrollView,Image } from 'react-native';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import LinearGradient from 'react-native-linear-gradient';
import { Styles, ScaledSheet, Fonts, Colors, BackgroundColor } from "../../common/Style";
import {tab, fontImage, arrow} from "../../common/Icons";
import TabBarIcon from '../../components/TabBarIcon';
import Header from '../../components/Header';
import ImageAndFonts from '../../components/ImageAndFonts';
import { width, pixel } from "../../common/Tool";
import Books from '../../components/Books';
import { loadCategory } from "../../actions/Classification";

type Props = {
    loadCategory?: () => void
};

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
            currentNewIndex: 0,
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
        navigation && navigation.navigate('SearchEngines');
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


            case 'female': k = '女生';
                break;

            case 'male' : k = '男生';
                break;

            case 'press' : k = '出版';
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
                                onPress={this.navSwitch.bind(this, {index})}
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
                                                            {/*<Books source={{uri: menu.cover}} size={'minimum'} clickAble={false}/>*/}
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
    // 进入二级分类 - function
    cateMenu(item, index){
        const { navigation } = this.props;
        navigation && navigation.navigate('SecondCate',{ item, index });
    }
    // 新内容 - demo
    renderNewContent(){
        return (
            <View style={[styles.newContent]}>
                { this.renderNewNav() }
                { this.renderNewBody() }
            </View>
        );
    }
    // 新内容 - 导航 - demo
    renderNewNav(){
        const propRecords = this.props.records ? this.props.records : {};
        const records = Object.keys(propRecords);
        return (
            <View style={[styles.newNav, Styles.paddingHorizontal15]}>
                <View style={[styles.newInner]}>
                    {
                        records.map((item, index) => {
                            const fontColor = this.state.currentNewIndex === index ? Colors.orange_f3916b : Colors.gray_808080;
                            const bgLineColor = this.state.currentNewIndex === index ? BackgroundColor.bg_f3916b : 'transparent';

                            return (
                                <TouchableOpacity
                                    key={index}
                                    activeOpacity={0.75}
                                    style={[styles.newNavOnPress, Styles.flexCenter]}
                                    onPress={this.newNavSwitch.bind(this, index)}
                                >
                                    <Text style={[Fonts.fontFamily, Fonts.fontSize15, fontColor]}>{ this.textControl(item) }</Text>
                                    <View style={[styles.newNavLine, {backgroundColor: bgLineColor}]}/>
                                </TouchableOpacity>
                            );
                        })
                    }
                </View>
            </View>
        );
    }
    // 切换 - function
    newNavSwitch(index){
        this.setState({currentNewIndex: index});
        this.scrollView && this.scrollView.scrollTo({x: (index * width), y: 0, animated: true});
    }
    // 新内容 - 身体 - demo
    renderNewBody(){
        const propRecords = this.props.records ? this.props.records : {};
        const records = Object.values(propRecords);
        const boy=['东方玄幻 、异界大陆','西方玄幻 、亡灵异族','传统武侠 、新派武侠','古典仙侠 、幻想修仙','都市生活 、异术超能','娱乐明星 、官场沉浮','穿越历史 、架空历史','军事战争 、战争幻想','游戏生涯 、电子竞技','体育竞技 、篮球运动','星际战争 、时空穿梭','推理侦探 、恐怖惊悚','武侠同人 、动漫同人','清新小说 、纯洁恋爱',]
        const girl=['穿越时空 、古代历史',' 豪门总裁 、都市生活','青春小说 、校园恋爱',' 古代纯爱 、现代纯爱','玄幻异世 、奇幻魔法','新旧武侠 、幻想修仙','异界超能 、幻想世界','游戏生涯 、电子竞技','悬疑破案 、灵异事件','影视同人 、游戏同人','京城贵妇 、豪门世家','傲娇腐女 、呆萌甜心',]
        const press=['经典著作 、古代历史','人物传记 、历史枭雄','励志拼搏 、复制成功','人文著作 、天干地支','金融科学 、理财绝学','时尚风向 、生活技巧','幼儿健康 、养生保养','青春校园 、古代言情','经典外文 、名人著作','政治时事 、历史战争',]

        return (
            <View onLayout={this.contentLayout.bind(this)} style={[styles.bookContent]}>
                <ScrollView
                    ref={ref => this.scrollView = ref}
                    pagingEnabled={true}
                    scrollEnabled={false}
                    horizontal={true}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    style={[styles.bookContent]}
                >
                    {
                        records.length !== 0 ?
                            records.map((item, index) => {
                                return (
                                    <ScrollView
                                        key={index}
                                        showsVerticalScrollIndicator={false}
                                        showsHorizontalScrollIndicator={false}
                                        style={[styles.scrollContent, {height: this.state.contentHeight, width: width}]}
                                    >
                                        <View style={[{flexWrap: 'wrap', flexDirection:'row'}]}>
                                            {
                                                (item || []).map((menu, j) => {
                                                    return (
                                                        <TouchableOpacity
                                                            activeOpacity={0.75}
                                                            key={j}
                                                            style={[styles.bookBox, Styles.flexCenter,{width: width / 2}]}
                                                            onPress={this.cateMenu.bind(this, item, j)}
                                                        >

                                                            <LinearGradient colors={['#FFFFFF','#F7F6FC']} start={{x:0,y:0.5}}>
                                                            <View style={[styles.bookText]}>
                                                                <Text style={[Fonts.fontFamily, Fonts.fontSize14, Colors.gray_404040]}>{ menu.categoryName }</Text>
                                                                <View style={[styles.pic]}>
                                                                    <Image source={{uri: menu.cover}} resizeMode={'contain'} style={[styles.pic]}/>
                                                                </View>
                                                            </View>
                                                            </LinearGradient>
                                                            <View>
                                                                <Text style={[Fonts.fontFamily, Fonts.fontSize12, Colors.gray_c0c0c0,{textAlign:'center',width:scale(150),borderColor:'#F2F2F2',borderWidth:scale(1),borderTopWidth:0}]}>{index === 0 ? press[j] :''}{index === 1 ? boy[j] :''}{index === 2 ? girl[j] :''}</Text>
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
    render(){
        return (
            <View style={[Styles.container]}>
                { this.renderHeader() }
                {/*{ this.renderContent() }*/}
                { this.renderNewContent() }
            </View>
        );
    }
}

const styles = ScaledSheet.create({
    newNavOnPress: {
        marginRight: '30@ms',
    },
    newNavLine: {
        width: '100%',
        height: '2@s',
        position: 'absolute',
        bottom: 0,
        left: 0,
        zIndex: 0,
    },
    newNav: {
        height: '44@vs',
        width: width,
    },
    newInner: {
        flex: 1,
        borderBottomColor: BackgroundColor.bg_e5e5e5,
        borderBottomWidth: moderateScale(1 / pixel),
        flexDirection: 'row',
    },
    newContent: {
        flex: 1,
        position: 'relative',
    },
    fontImageStyles: {
        height: '24@vs'
    },
    bookText: {
        height:'90@vs',
        width:'150@s',
        paddingLeft: '10@ms',
        paddingTop: '10@ms',
        borderWidth:'1@s',
        borderColor:'#F2F2F2',
    },
    bookBox: {
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
    pic:{
        height:'60@vs',
        width:'86@s',
        marginLeft:'20@ms'
    }
});

const mapStateToProps = (state, ownProps) => {
    let data = state.getIn(['classification', 'category']);

    if(Immutable.Map.isMap(data)){ data = data.toJS() }
    return { ...ownProps, ...data };
};

export default connect(mapStateToProps,{ loadCategory })(Classification);











