
import React, { Component } from 'react';
import { View, Text, Image,  TouchableOpacity, FlatList } from 'react-native';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import {moderateScale, scale} from 'react-native-size-matters';
import Carousel from 'react-native-banner-carousel';
import { Styles, ScaledSheet, Img, Fonts, Colors, BackgroundColor } from "../../common/Style";
import TabBarIcon from '../../components/TabBarIcon';
import { tab, mix, fontImage, bookCity } from "../../common/Icons";
import Header from '../../components/Header';
import ImageAndFonts from '../../components/ImageAndFonts';
import Books from '../../components/Books';
import { pixel, width, numberConversion } from "../../common/Tool";
import { loadBookCity } from '../../actions/BookCity';
import NovelFlatList from '../../components/NovelFlatList';
import { loadImage } from "../../common/Tool";
import Chrysanthemum from '../../components/Chrysanthemum';

type Props = {};

class BookCity extends Component<Props>{
    static navigationOptions = {
        tabBarIcon: ({focused}) => (
            <TabBarIcon
                focused={focused}
                defaultIcon={tab.bookCity.defaultIcon}
                activeIcon={tab.bookCity.activeIcon}
            />
        ),
        tabBarLabel: '书城',
        header: null
    };
    constructor(props){
        super(props);
        this.state={
        	currentIndex: 0
        };
        this.bannerArr = [
            {
                cover: require('../../images/banner/banner3.png'),
                title: 'banner3'
            },

        ];
    }
    componentDidMount() {
        this.props.loadBookCity && this.props.loadBookCity();
    }
    _search(){
        const { navigation } = this.props;
        navigation.navigate('SearchEngines');
    }
    // 头部 - demo
    renderHeader(){
        return (
            <Header
                fontImage={fontImage.bookCity}
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
    // 打开详情 - function
    _openDetails(hexId, bookId){
        const { navigation } = this.props;
        navigation && navigation.navigate('Details',{ hexId: hexId, bookId: bookId});
    }
    // 头部刷新 - function
    onHeaderRefresh(refreshState){

    }
    // 底部加载 - function
    onFooterRefresh(refreshState){
        return null;
    }
    // banner - demo
    renderBanner(){
        return (
            <View style={[styles.bannerBox]}>
                {
                    (this.bannerArr).length !== 0 ?
                    <Carousel
                        autoplay={true}
                        autoplayTimeout={3000}
                        loop={true}
                        index={0}
                        pageSize={width}
                        pageIndicatorOffset={moderateScale(16)}
                        pageIndicatorStyle={styles.pageIndicatorStyle}
                        activePageIndicatorStyle={styles.activePageIndicatorStyle}
                        pageIndicatorContainerStyle={styles.pageIndicatorContainerStyle}
                    >
                        { this.bannerArr.map((item, index) => this.renderImageRow(item, index)) }
                    </Carousel> :
                    <View style={[styles.bannerBox, Styles.flexCenter]}>
                        <Chrysanthemum/>
                    </View>
                }
            </View>
        );
    }
    renderImageRow(item, index){
        return (
            <TouchableOpacity
                activeOpacity={1}
                key={index}
                style={[styles.bannerBox]}
                onPress={this._ApplyAgent.bind(this,index)}
            >
                <Image source={item.cover} style={[styles.bannerImage]}/>
            </TouchableOpacity>
        )
    }
    // 申请代理 - router
    _ApplyAgent(index){
        const { navigation } = this.props;

        // if(index === 0){
        //     navigation && navigation.navigate('ApplyAgent');
        // }

        if(index === 1){
            navigation && navigation.navigate('ShareBookCurrency');
        }
    }
     _bookWholeRow(item: Object, x: number, callback?: Function, key?: number | string){
         const img = loadImage(item.bookIds);
         const description =item.books[0] ? item.books[0].description : false;
         const Description = /<br\s*\/?>/gi.test(description) ? description.replace(/<br\s*\/?>/gi,"\r\n") : description;

         return (
             <TouchableOpacity
                 key={key ? key : 0}
                 onPress={this._openDetails.bind(this, item.books[x].hexId, item.books[x].id)}
                 activeOpacity={0.75}
                 style={[styles.boxBody, Styles.paddingVertical15, Styles.marginLeft15, callback ? callback() : {}]}
             >
                 <Books source={{uri: img[x]}} clickAble={false}/>
                 <View style={[styles.bookSection, Styles.paddingHorizontal15]}>
                     <Text
                         numberOfLines={1}
                         style={[styles.bookSectionTitle, Fonts.fontFamily, Fonts.fontSize15, Colors.gray_404040]}
                     >
                         { item.books[x].title }
                     </Text>
                     <View style={[styles.authorView]}>
                         <Text
                             numberOfLines={1}
                             style={[styles.bookSectionAuthor, Fonts.fontFamily, Fonts.fontSize12, Colors.gray_808080]}
                         >
                             { item.books[x].authorName }
                         </Text>
                         <Text
                             numberOfLines={1}
                             style={[styles.bookSectionAuthor, Fonts.fontFamily, Fonts.fontSize12, Colors.gray_808080]}
                         >
                             { numberConversion(item.books[x].totalWords || 0) }
                         </Text>
                     </View>
                     <Text
                         numberOfLines={3}
                         style={[styles.bookSectionText, Fonts.fontFamily, Fonts.fontSize12, Colors.gray_808080]}
                     >
                         { item.books[x].description ? Description : '本书暂无描述' }
                     </Text>
                 </View>
             </TouchableOpacity>
         );
    }
    _bookSmallSingle(item: Object, index: number){
        let  innerData = [];
        const img = loadImage(item.bookIds);

        item.books.length !== 0 && item.books.map((innerObj, innerIndex) => {
            if(index !== 1 && index !== 5 && index !== 7 && index !== 2 && index !== 4 && index !== 6){
                innerIndex > 0 && innerData.push({key: innerIndex, subObjs: innerObj, imgArr: img[innerIndex]});
            }
            else{
                innerData.push({key: innerIndex, subObjs: innerObj, imgArr: img[innerIndex]});
            }
        });

        return (
            <View style={[Styles.paddingBottom15, {
                backgroundColor: BackgroundColor.bg_fff,
                flexDirection: 'row',
                flexWrap: (index !== 0 && index !== 3) ? 'wrap' : 'nowrap'
            }]}>
                {
                    innerData.length !== 0 && innerData.map((i, key) => {
                        const obj = i.subObjs, img = i.imgArr;

                        return (
                            <TouchableOpacity
                                key={key}
                                activeOpacity={0.75}
                                style={[styles.boxFooterLump, Styles.paddingTop15, Styles.flexCenter]}
                                onPress={this._openDetails.bind(this, obj.hexId, obj.id)}
                            >
                                <Books source={{uri: img}} clickAble={false} size={'small'}/>
                                <View style={[Styles.marginTop15]}>
                                    <Text
                                        style={[Fonts.fontFamily, Fonts.fontSize12, Colors.gray_404040, {maxWidth: scale(60)}]}
                                        numberOfLines={1}
                                    >
                                        { obj.title }
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })
                }
            </View>
        );
    }
    // 数据渲染 - demo
    renderItem({item, index}){
        return (
            <View style={[styles.box, index === 0 && {marginTop: 0}]}>
                <View style={[styles.boxHeader]}>
                    <View style={[styles.boxBoldDot,{backgroundColor: BackgroundColor.bg_f3916b}]}/>
                    <View style={[styles.bigTitle, Styles.paddingLeft15]}>
                        <Text style={[Fonts.fontFamily, Fonts.fontSize15, Colors.gray_404040]}>{ item.title }</Text>
                    </View>
                    {/*<TouchableOpacity*/}
                    {/*activeOpacity={1}*/}
                    {/*style={[styles.moreTextBox, Styles.paddingRight15]}*/}
                    {/*>*/}
                    {/*<Text style={[Fonts.fontFamily, Fonts.fontSize12, Colors.gray_b2b2b2, styles.moreText]}>更多</Text>*/}
                    {/*</TouchableOpacity>*/}
                </View>
                {
                    (index !== 0 && index !== 3 && index !== 2 && index !== 4 && index !== 6) &&
                    [0,1,2,3].map((x, y) => this._bookWholeRow(item, x, _ => {return x === 3 && {borderBottomWidth: 0}}, y))
                }
                {
                    (index !== 1 && index !== 5 && index !== 7 && index !== 2 && index !== 4 && index !== 6) &&
                    this._bookWholeRow(item, 0)
                }
                {
                    (index !== 1 && index !== 5 && index !== 7) &&
                    this._bookSmallSingle(item, index)
                }
            </View>
        );
    }
    // 内容 - demo
    renderContent(){
        const { bookCity } = this.props;
        const home = bookCity && bookCity.home;
        const data = home ? home.data : false;
        const promotions = data ? Object.values(data.promotions) : [];

        return (
            <NovelFlatList
                horizontal={false}
                data={promotions}
                ListHeaderComponent={this.renderBanner.bind(this)}
                renderItem={this.renderItem.bind(this)}
                keyExtractor={(item, index) => index + ''}
                onHeaderRefresh={this.onHeaderRefresh.bind(this)}
                onFooterRefresh={this.onFooterRefresh.bind(this)}
                refreshState={this.props.refreshState}
                numColumns={1}
            />
        );
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
    authorView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    bannerImage: {
        width: '100%',
        height: '140@vs',
    },
    pageIndicatorStyle: {
        width: '8@s',
        height: '8@vs',
        borderRadius: '8@ms',
        marginHorizontal: '4@ms',
        backgroundColor: 'rgba(255,255,255,0.4)'
    },
    activePageIndicatorStyle: {
        position: 'absolute',
        backgroundColor: '#f3916b',
    },
    pageIndicatorContainerStyle: {
        position: 'absolute',
        alignSelf: 'center',
        flexDirection: 'row',
        bottom: '10@ms'
    },
    boxFooterLump: {
        width: width / 4,
    },
    bigTitle: {
        position: 'relative',
        justifyContent: 'center',
    },
    fontImageStyles: {
        height: '24@vs'
    },
    demoRightStyles: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    box: {
        backgroundColor: '#FFFFFF',
        flexDirection: 'column',
        marginTop: '10@ms'
    },
    boxHeader: {
        height: '35@vs',
        overflow: 'hidden',
        flexDirection: 'row'
    },
    boxBoldDot: {
        height: '15@vs',
        width: '2@s',
        alignSelf: 'center',
        position: "absolute",
        left: 0,
        top: '10@vs',
    },
    moreTextBox: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end'
    },
    moreText: {
        alignSelf: 'center'
    },
    boxBody: {
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        borderBottomWidth: 1 / pixel,
        borderStyle: 'solid',
        borderBottomColor: '#E5E5E5'
    },
    bookSection: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    bookSectionTitle: {
        marginBottom: '5@ms',
    },
    bookSectionAuthor: {
        marginBottom: '5@ms'
    },
    bookSectionText: {
        lineHeight: '18@ms'
    },
    bannerBox: {
        height: '140@vs',
        width: '100%',
    },
});

const mapStateToProps = (state, ownProps) => {
    let data = state.getIn(['bookCity']);

    if(Immutable.Map.isMap(data)){ data = data.toJS() }
    return { ...ownProps, ...data };
};

export default connect(mapStateToProps, {loadBookCity})(BookCity);











