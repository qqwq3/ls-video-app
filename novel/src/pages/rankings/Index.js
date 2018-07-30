
'use strict';

import React,{ Component } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, FlatList} from 'react-native';
import Immutable from 'immutable';
import humps from 'humps';
import { connect } from 'react-redux';
import { Styles, ScaledSheet, Img, Fonts, Colors } from "../../common/Style";
import TabBarIcon from '../../components/TabBarIcon';
import { tab, fontImage, rankings } from "../../common/Icons";
import Header from '../../components/Header';
import ImageAndFonts from '../../components/ImageAndFonts';
import {width, pixel, numberConversion, RefreshState} from "../../common/Tool";
import Books from '../../components/Books';
import { loadRandKing } from "../../actions/Rankings";
import NovelFlatList from '../../components/NovelFlatList';
import { loadImage } from "../../common/Tool";
import DefaultDisplay from '../../components/DefaultDisplay';

type Props = {};

class Rankings extends Component<Props>{
    static navigationOptions = {
        tabBarIcon: ({focused}) => (
            <TabBarIcon
                focused={focused}
                defaultIcon={tab.rankings.defaultIcon}
                activeIcon={tab.rankings.activeIcon}
            />
        ),
        tabBarLabel: '排行',
        header: null,
    };
    constructor(props){
        super(props);
        this.state = {
            currentIndex: 0,
            tabNames: ['点击榜', '收藏榜', '新书榜', '完结榜'],
            tabStatusValue: ["total_hits","total_likes","total_present_amount","finish"],
        };
    }
    componentDidMount() {
        const { loadRandKing } = this.props;
        loadRandKing && loadRandKing(this.state.tabStatusValue[0]);
    }
    // 搜索
    _search(){
        const { navigation } = this.props;
        navigation.navigate('SearchEngines');
    }
    // 菜单切换
    _switchMenu(index){
        const { loadRandKing } = this.props;

        loadRandKing && loadRandKing(this.state.tabStatusValue[index]);
        this.setState({currentIndex: index});
        this.scrollViewRef && this.scrollViewRef.scrollTo({x: index * width, y: 0, animated: true});
    }
    // 头部 - demo
    renderHeader(){
        return (
            <Header
                fontImage={fontImage.rankings}
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
    // 菜单切换 - demo
    renderTab(){
        const { currentIndex, tabNames } = this.state;

        return (
            <View style={[styles.tab]}>
                {
                    tabNames.map((item, index) => {
                        const borderBottomColor = currentIndex === index ? '#f3916b' : 'transparent';
                        const color = currentIndex === index ? '#f3916b' : '#404040';

                        return (
                            <TouchableOpacity
                                key={index}
                                activeOpacity={0.5}
                                style={[styles.menu, Styles.flexCenter]}
                                onPress={this._switchMenu.bind(this, index)}
                            >
                                <View style={[styles.innerMenu, Styles.flexCenter, {borderBottomColor}]}>
                                    <Text style={[Fonts.fontFamily, Fonts.fontSize15, {color}]}>{ item }</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })
                }
            </View>
        );
    }
    // 内容 - demo
    renderContent(){
        const { tabStatusValue, currentIndex, tabNames } = this.state;

        return (
            <ScrollView
                ref={ref => this.scrollViewRef = ref}
                pagingEnabled={true}
                scrollEnabled={false}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                style={[styles.content]}
            >
                {
                    tabNames.map((item, index) => {
                        return (
                            <ScrollView
                                key={index}
                                showsVerticalScrollIndicator={false}
                                style={[styles.scrollContent]}
                            >
                                { this.renderBookData(tabStatusValue[index]) }
                            </ScrollView>
                        );
                    })
                }
                {/*<ScrollView*/}
                    {/*key={currentIndex}*/}
                    {/*showsVerticalScrollIndicator={false}*/}
                    {/*style={[styles.scrollContent]}*/}
                {/*>*/}
                    {/*{ this.renderBookData(tabStatusValue[currentIndex]) }*/}
                {/*</ScrollView>*/}
            </ScrollView>
        );
    }
    // 书数据 - demo
    renderBookData(statusValue){
        const { main } = this.props;
        const value = humps.camelize(statusValue);
        const obj = main ? main[value] : false;
        const data = obj && obj.data ? obj.data : [];
        const refreshState = obj && obj.refreshState ? obj.refreshState : RefreshState.Idle;

        return (
            <NovelFlatList
                data={data}
                renderItem={this.renderItem.bind(this)}
                keyExtractor={(item, index) => index + ''}
                onHeaderRefresh={this.onHeaderRefresh.bind(this)}
                onFooterRefresh={this.onFooterRefresh.bind(this)}
                refreshState={refreshState}
                numColumns={1}
            />
        );
    }
    // 头部刷新 - function
    onHeaderRefresh(refreshState){

    }
    // 进入详情 - function
    _openDetails(hexId, bookId) {
        const { navigation } = this.props;
        navigation && navigation.navigate('Details',{ hexId, bookId });
    }
    // 底部加载 - function
    onFooterRefresh(refreshState){
        return null;
    }
    // 数据渲染 - demo
    renderItem({item, index}){
        const uri = loadImage(item.id);
        const iconGateway = index < 3 ? index === 0 && rankings.crown1 || index === 1 && rankings.crown2 || index === 2 && rankings.crown3 : rankings.crown4;
        const description =item ? item.description : false;
        const Description = /<br\s*\/?>/gi.test(description) ? description.replace(/<br\s*\/?>/gi,"\r\n") : description;
        return (
            <TouchableOpacity
                style={[styles.boxBody, Styles.paddingVertical15, Styles.marginHorizontal15]}
                activeOpacity={0.75}
                onPress={() => this._openDetails(item.hexId,item.id)}
            >
                <Books source={{uri: uri}} clickAble={false} />
                <View style={[styles.bookSection]}>
                    <View style={styles.btHeader}>
                        <Text style={[styles.bookSectionTitle, Fonts.fontSize15]}>{ item.title || '' }</Text>
                        <View style={{flexDirection: 'row'}}>
                            <Text style={[styles.rankNumber, index > 8 ? styles.left1 : styles.left2]}>{index + 1}</Text>
                            <Image source={iconGateway} style={[Img.resizeModeContain, styles.crownImage]} />
                        </View>
                    </View>

                    <View style={[styles.bookSectionBase]}>
                        <View style={styles.basic}>
                            <Text numberOfLines={1} style={[{flex:1}, Fonts.fontSize12, Colors.gray_808080]}>{ item.authorName || '' }</Text>
                            <Text numberOfLines={1} style={[{flex:1}, Fonts.fontSize12, Colors.gray_808080]}>{ item.categoryName || '' }</Text>
                        </View>
                        <View style={styles.ready}>
                            <Text numberOfLines={1} style={[Fonts.fontSize12, Colors.gray_808080]}>{ numberConversion(item.totalLikes || 0) }</Text>
                        </View>
                    </View>

                    <View style={[Styles.paddingRight15]}>
                        <Text style={[styles.bookSectionText, Fonts.fontSize12, Colors.gray_808080]} numberOfLines={3}>
                            { item.description === '' ? '暂无描述' : Description }
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
    render(){
        return (
            <View style={[Styles.container]}>
                { this.renderHeader() }
                { this.renderTab() }
                { this.renderContent() }
            </View>
        );
    }
}

const styles = ScaledSheet.create({
    TextContentStyle: {
        height: '60@vs',
        width: width,
    },
    crownImage: {
        width: '18@s',
        marginRight: '1@ms',
    },
    scrollContent: {
        width: width,
        position: 'relative'
    },
    content: {
        flex: 1,
        position: "relative"
    },
    tab: {
        height: '44@vs',
        width: "100%",
        position: 'relative',
        flexDirection: 'row'
    },
    innerMenu: {
        flex: 1,
        height: '42@vs',
        borderBottomWidth: '2@ms',
        paddingHorizontal: '4@ms'
    },
    menu: {
        width: '25%',
        height: '100%'
    },
    fontImageStyles: {
        height: '24@vs'
    },
    demoRightStyles: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    left1: {
        left: '4.2@ms'
    },
    left2: {
        left: '7@ms'
    },
    rankNumber: {
        color: "#FFFFFF",
        fontSize: '9@ms',
        position: 'absolute',
        zIndex: 100,
        left: '7@ms',
        top: '2.5@ms'
    },
    btHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    basic: {
        flex: 2,
        flexDirection: 'row'
    },
    ready: {
        flex: 1,
        justifyContent: 'flex-end',
        flexDirection: 'row',
        overflow: 'hidden'
    },
    RankingListConent: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#FFFFFF'
    },
    boxBody: {
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        borderBottomWidth: 1 / pixel,
        borderStyle: 'solid',
        borderBottomColor: '#E5E5E5',
        overflow:'visible',
    },
    bookSection: {
        paddingLeft: '15@ms',
        paddingRight: 0,
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between'
    },
    bookSectionTitle: {
        color: '#4C4C4C',
        marginBottom: '5@ms'
    },
    bookSectionBase: {
        marginBottom: '5@ms',
        flexDirection: 'row'
    },
    bookSectionText: {
        lineHeight: '18@vs',
        textAlign: 'left'
    },
});

const mapStateToProps = (state, ownProps) => {
    let data = state.getIn(['rankings']);

    if(Immutable.Map.isMap(data)){ data = data.toJS() }
    return { ...ownProps, ...data };
};

export default connect(mapStateToProps,{ loadRandKing })(Rankings);











