
'use strict';

import React,{ Component } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { Styles, ScaledSheet, Fonts, Colors, BackgroundColor } from "../../common/Style";
import { tab, fontImage } from "../../common/Icons";
import TabBarIcon from '../../components/TabBarIcon';
import Header from '../../components/Header';
import { pixel, width } from "../../common/Tool";
import NovelFlatList from '../../components/NovelFlatList';
import Books from '../../components/Books';
import { reloadClassification, loadClassification } from "../../actions/Classification";
import { RefreshState, loadImage, numberConversion } from "../../common/Tool";

type Props = {};

const ITEM_HEIGHT = verticalScale(125);

class SecondCate extends Component<Props>{
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
            currentIndex: this.props.navigation.getParam('index'),
        };
    }
    componentDidMount() {
        this.onHeaderRefresh && this.onHeaderRefresh(RefreshState.HeaderRefreshing);
    }
    componentWillReceiveProps(nextProps) {
        console.log('secondCate', nextProps);
    }
    // 返回 - function
    _goBack(){
        const { navigation } = this.props;
        navigation && navigation.goBack();
    }
    // 头部 - demo
    renderHeader(){
        const { navigation } = this.props;
        const item = navigation.getParam('item');
        const m = this.textControl(item[0].maleFemale);

        return (
            <Header
                isTitleRight={true}
                title={m || ''}
                isArrow={true}
                goBack={this._goBack.bind(this)}
            />
        );
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
    // 导航切换 - function
    cateSwitchMenu(index){
        const { reloadClassification, navigation } = this.props;
        const item = navigation.getParam('item');

        this.setState({currentIndex: index});
        navigation && navigation.setParams({index: index});
        reloadClassification && reloadClassification(item[index].id, RefreshState.HeaderRefreshing, 0);
    }
    // 头部内容 - demo
    listHeaderComponent(){
        const { navigation } = this.props;
        const item = navigation.getParam('item') || [];

        return (
            <View style={[styles.navView]}>
                <View style={styles.menuRow}>
                    <View style={[styles.menuInner, Styles.marginHorizontal15]}>
                        {
                            item.map((item,index) => {
                                const color = this.state.currentIndex === index ? Colors.orange_f3916b : Colors.gray_808080;

                                return (
                                    <TouchableOpacity
                                        activeOpacity={0.75}
                                        key={index}
                                        onPress={this.cateSwitchMenu.bind(this, index)}
                                    >
                                        <View style={[styles.menuBox, Styles.flexCenter, {width: scale((width - 30) / 4)}]}>
                                            <Text style={[Fonts.fontFamily, Fonts.fontSize12, color]}>{ item.categoryName || '' }</Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })
                        }
                    </View>
                </View>
            </View>
        );
    }
    // 内容 - demo
    renderContent(){
        const { currentOffset, refreshState, totalRecords } = this.props;
        const records = this.props.records ? this.props.records : [];

        return (
            <NovelFlatList
                //getItemLayout={(data, index) => ({length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index})}
                data={records}
                ListHeaderComponent={this.listHeaderComponent.bind(this)}
                renderItem={this.renderItemBooks.bind(this)}
                keyExtractor={(item, index) => index + ''}
                onHeaderRefresh={this.onHeaderRefresh.bind(this)}
                onFooterRefresh={this.onFooterRefresh.bind(this)}
                refreshState={refreshState}
                numColumns={1}
                totalRecords={totalRecords}
                offset={currentOffset}
                contentContainerStyle={styles.contentContainerStyle}
            />
        );
    }
    // 数据渲染 - demo
    renderItemBooks({item, index}) {
        const comFontStyles = [Fonts.fontFamily, Fonts.fontSize12, Colors.gray_808080];
        const uri = loadImage && loadImage(item.id);

        return (
            <TouchableOpacity
                activeOpacity={0.75}
                onPress={this.openDetails.bind(this, item.hexId, item.id)}
            >
                <View style={[{backgroundColor: BackgroundColor.bg_fff}]}>
                    <View style={[styles.BookMarkBox, Styles.paddingVertical15, styles.menuInnerBottomBorder]}>
                        <Books source={{uri: uri}} size={'large'} clickAble={false}/>
                        <View style={[styles.BookMarkMassage, Styles.marginLeft15]}>
                            <Text style={[styles.BookMarkTitle, Fonts.fontFamily, Fonts.fontSize15, Colors.gray_404040]} numberOfLines={1}>
                                { item.title }
                            </Text>
                            <View style={[styles.BookMarkNew, Styles.marginRight15]}>
                                <View style={{marginRight: moderateScale(5)}}>
                                    <Text style={comFontStyles}>最新章节</Text>
                                </View>
                                <View style={{maxWidth:193}}>
                                    <Text style={comFontStyles} numberOfLines={1}>
                                        { item.latestChapter ? item.latestChapter.title : ''}
                                    </Text>
                                </View>
                            </View>
                            <View style={[styles.BookMarkNew, Styles.marginRight15]}>
                                <View style={{marginRight: 5}}>
                                    <Text style={comFontStyles}>{ item.author ? item.author.name : '' }</Text>
                                </View>
                                <View>
                                    <Text style={comFontStyles}>{ numberConversion(item.totalLikes) || 0 }人在阅读</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
    // 进入详情
    openDetails(hexId, bookId){
        const { navigation } = this.props;
        navigation && navigation.navigate('Details',{ hexId: hexId, bookId: bookId});
    }
    // 头部刷新 - function
    onHeaderRefresh(refreshState){
        const { navigation, reloadClassification } = this.props;
        const index = navigation.getParam('index');
        const item = navigation.getParam('item');

        reloadClassification && reloadClassification(item[index].id, refreshState, 0);
    }
    // 底部加载 - function
    onFooterRefresh(refreshState){
        const { loadClassification, navigation, currentOffset } = this.props;
        const index = navigation.getParam('index');
        const item = navigation.getParam('item');
        const records = this.props.records ? this.props.records : [];

        loadClassification && loadClassification(item[index].id, refreshState, currentOffset, records);
    }
    render(){
        return (
            <View style={[Styles.container, {backgroundColor: BackgroundColor.bg_f1f1f1}]}>
                { this.renderHeader() }
                { this.renderContent() }
            </View>
        );
    }
}

const styles = ScaledSheet.create({
    BookMarkNew: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'nowrap',
        height: '25@vs',
        alignItems: 'center',
        overflow: 'hidden',
    },
    BookMarkTitle: {
        flex: 2
    },
    BookMarkMassage: {
        flex: 1,
        flexDirection: 'column'
    },
    BookMarkBox: {
        marginLeft: '15@ms',
        flexDirection: 'row',
    },
    navView: {
        marginBottom: '10@ms',
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
    contentContainerStyle: {
        paddingBottom: 0,
    },
    menuInner: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingBottom: '20@ms'
    },
    menuInnerBottomBorder: {
        borderBottomColor: '#E5E5E5',
        borderStyle: 'solid',
        borderBottomWidth: 1 / pixel
    },
    menuRow: {
        backgroundColor: '#FFFFFF',
        flexDirection:'row'
    },
    menuBox: {
        paddingTop: '20@vs'
    },
});

const mapStateToProps = (state, ownProps) => {
    let data = state.getIn(['classification','secondCategory']);

    if(Immutable.Map.isMap(data)){ data = data.toJS() }
    return { ...ownProps, ...data };
};

export default connect(mapStateToProps,{ reloadClassification, loadClassification })(SecondCate);











