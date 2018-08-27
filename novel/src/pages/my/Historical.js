
'use strict';

import React, { Component, PureComponent } from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import Immutable from 'immutable';
import { connect } from 'react-redux';
// import Swipeout from 'react-native-swipeout';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { Styles, ScaledSheet, Fonts, Colors, BackgroundColor } from "../../common/Style";
import Header from '../../components/Header';
import Books from '../../components/Books';
import { pixel, loadImage, height, width } from "../../common/Tool";
import { reloadHistorical, loadHistorical } from "../../actions/User";
import NovelFlatList from '../../components/NovelFlatList';
import DefaultDisplay from '../../components/DefaultDisplay';

type Props = {
    records: Array<any>,
    currentOffset: number,
    refreshState: number,
    totalRecords: number
};

class Historical extends Component<Props>{
    static defaultProps = {
        records: [],
        currentOffset: 0,
        refreshState: 0,
        totalRecords: 0,
    };
    constructor(props){
        super(props);
        this.state = {
            currentIndex: 0,
        };
    }
    componentWillMount(refreshState){
        const {  reloadHistorical } = this.props;
        reloadHistorical && reloadHistorical(refreshState, 0);
    }
    // 返回 - function
    _goBack(){
        const { navigation } = this.props;
        navigation.goBack();
    }
    // 头部 - demo
    renderHeader(){
        return (
            <Header
                title={'阅读记录'}
                isArrow={true}
                goBack={this._goBack.bind(this)}
            />
        );
    }
    // 头部刷新 - function
    onHeaderRefresh(refreshState){
        const {  reloadHistorical } = this.props;
        reloadHistorical && reloadHistorical(refreshState,0);
    }
    // 底部加载 - function
    onFooterRefresh(refreshState){
        const { loadHistorical, currentOffset } = this.props;
        const records = this.props.records ? this.props.records : [];
        loadHistorical && loadHistorical(refreshState, currentOffset, records);
    }
    // 内容 - demo
    renderItem({item, index}){
        const textStyles = [ Fonts.fontFamily, Fonts.fontSize12, Colors.gray_808080 ];
        const uri = loadImage(item.bookId);
        const DeleteButton = () => {
            return (
                <View style={[styles.deleteButton, Styles.flexCenter]}>
                    <Text style={[styles.deleteButtonText, Fonts.fontFamily]}>删除</Text>
                </View>
            );
        };

        return (
            <View key={index} style={[{backgroundColor: BackgroundColor.bg_fff}]}>
                {/*<Swipeout*/}
                    {/*style={styles.swipeOut}*/}
                    {/*autoClose={false}*/}
                    {/*right={[{*/}
                        {/*backgroundColor: 'red',*/}
                        {/*component: <DeleteButton/>,*/}
                        {/*onPress: () => this._delete(item.bookIdHex),*/}
                    {/*}]}*/}
                    {/*buttonWidth={scale(75) + moderateScale(15)}*/}
                    {/*sensitivity={10}*/}
                {/*>*/}
                    <View style={[styles.BookMarkBox, styles.menuInnerBottomBorder, {borderBottomWidth: scale(1 / pixel)}]}>
                        <Books source={{uri: uri}} clickAble={false} size={'large'}/>
                        <View style={styles.BookMarkMassage}>
                            <Text style={[styles.BookMarkTitle, Fonts.fontFamily, Fonts.fontSize15]} numberOfLines={1}>{ item.bookTitle }</Text>
                            <View style={[styles.BookMarkNew]}>
                                <Text style={textStyles} numberOfLines={1}>{ item.authorName }</Text>
                            </View>
                            <View style={[styles.BookMarkNew, {alignItems:'flex-end'}]}>
                                <Text style={textStyles} numberOfLines={1}>{ item.chapterTitle }</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            activeOpacity={0.75}
                            style={[styles.continueButs, Styles.paddingRight15]}
                            onPress={this._continueReader.bind(this, item)}
                        >
                            <View style={[styles.buts, {borderColor: BackgroundColor.bg_f3916b}, Styles.flexCenter]}>
                                <Text style={[Fonts.fontFamily, Fonts.fontSize12, Colors.orange_f3916b]}>继续阅读</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                {/*</Swipeout>*/}
            </View>
        );
    }
    // 删除单本书记录 - function
    _delete(bookIdHex){

    }
    // 继续阅读 - function
    _continueReader(item){
        const { navigation } = this.props;
        const hexId = item.bookIdHex;
        const bookId = item.bookId;
        const bookHexId = item.bookIdHex;
        const chapterHexId = `book_id${hexId}`;

        //const sourceSiteIndex = item.sourceSiteIndex;
        //const vipChapterIndex = item.vipChapterIndex;
        //const value = parseInt(sourceSiteIndex) >= parseInt(vipChapterIndex) ? '1' : '0';

        // navigation && navigation.navigate('Reader',{ hexId, bookId, bookHexId, direct: true});

        navigation && navigation.navigate('Reader',{
            chapterHexId,
            bookHexId,
            bookId
        });
    }
    renderContent(){
        const { currentOffset, refreshState, totalRecords, records } = this.props;
        const _height =  height - (StatusBar.currentHeight + verticalScale(44));

        return (
            <NovelFlatList
                showArrow={true}
                data={records}
                ListEmptyComponent={
                    <View style={[{height: _height, width: width}]}>
                        <DefaultDisplay />
                    </View>
                }
                renderItem={this.renderItem.bind(this)}
                keyExtractor={(item,index) => index + ''}
                onHeaderRefresh={this.onHeaderRefresh.bind(this)}
                onFooterRefresh={this.onFooterRefresh.bind(this)}
                refreshState={refreshState}
                totalRecords={totalRecords}
                offset={currentOffset}
            />
        );
    }
    render(){
        return (
            <View style={[Styles.container, {backgroundColor: BackgroundColor.bg_fff}]}>
                { this.renderHeader() }
                { this.renderContent() }
            </View>
        );
    }
}

const styles = ScaledSheet.create({
    swipeOut:{
        backgroundColor: BackgroundColor.bg_fff,
    },
    deleteButton:{
        backgroundColor: 'red',
        flex: 1,
    },
    deleteButtonText: {
        fontSize: '15@ms',
        color: BackgroundColor.bg_fff,
    },
    continueButs: {
        zIndex: 1,
        backgroundColor: 'transparent',
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    buts: {
        height: "25@vs",
        width: '80@s',
        borderWidth: 1,
        borderRadius: '50@ms',
    },
    BookMarkNew: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'nowrap',
        marginRight: '15@ms',
        height: '25@vs',
        alignItems: 'center',
        overflow: 'hidden',
    },
    BookMarkTitle: {
        color: '#4C4C4C',
        flex: 2
    },
    BookMarkMassage: {
        flex: 1,
        marginLeft: '15@ms',
        flexDirection: 'column',
        justifyContent: 'space-between'
    },
    BookMarkBox: {
        marginLeft: '15@ms',
        paddingTop: '15@ms',
        paddingBottom: '15@ms',
        flexDirection: 'row',
        position: 'relative',
    },
    menuInnerBottomBorder: {
        borderBottomColor: '#E5E5E5',
        borderStyle: 'solid',
    },
});

const mapStateToProps = (state, ownProps) => {
    let userData = state.getIn(['user', 'userData','historicalData']);

    if(Immutable.Map.isMap(userData)){ userData = userData.toJS() }
    return { ...ownProps, ...userData };
};
export default connect(mapStateToProps,{ reloadHistorical, loadHistorical })(Historical);






































