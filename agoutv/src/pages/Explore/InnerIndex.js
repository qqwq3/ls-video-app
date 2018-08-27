
import React from 'react';
import { StyleSheet, Image, View, TouchableOpacity, Text, ScrollView, ActivityIndicator } from 'react-native';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import XingrenFlatList from '../../components/XingrenFlatList';
import { MovieCellInList } from '../Movie/movieCellInList'
import PropTypes from 'prop-types';
import { RefreshState } from "../../Constants";
import { FilterPanel } from "./filterPanel";
import HeaderBox from '../../common/HeaderBox';
import { loadCategoryList, reLoadWithFilters, loadWithFilters, showOrNotFilterPanel } from '../../actions/explore';
import { width, pixel } from "../../common/tool";

const ITEM_HEIGHT = 180;

class InnerIndex extends React.Component {
    constructor(props) {
        super(props);
        this.params = this.props.navigation.state.params;
        this.state = {
            navStartValue: 1000,
            // 数据记录
            records: [],
        };
        // 导航栏的总宽度
        this.menuWidthSum = 0;
        // 导航栏的宽数组
        this.menuWidthArr = [];
    };
    static propTypes = {
        categoryObj: PropTypes.object,
        dataRet: PropTypes.object,
        filterStatus: PropTypes.object,
        records: PropTypes.arrayOf(PropTypes.object),
        refreshState: PropTypes.number.isRequired,
        offset: PropTypes.number.isRequired,
    };
    static defaultProps = {
        dataRet: {},
        filterStatus: {},
        records: [],
        refreshState: RefreshState.Idle,
        offset: 0,
    };
    shouldComponentUpdate(nextProps, nextState) {
        return !this.props.updateTime || (nextProps.updateTime !== this.props.updateTime);
    }
    componentWillReceiveProps(nextProps) {
        if(nextProps.dataRet.records !== this.props.dataRet.records){
            this.setState({records: nextProps.dataRet.records});
        }
    }
    onHeaderRefresh = (refreshState) => {
        let selectObj = Immutable.Map(this.props.dataRet.selectedObj);
        let ret = selectObj;
        if (selectObj.isEmpty()) {
            ret = selectObj.setIn(['type'], 1);
        }
        this.props.reLoadWithFilters(refreshState, ret.toJS());
    };
    onFooterRefresh = (refreshState) => {
        let currentOffset = this.props.dataRet.offset;
        let ret = Immutable.Map(this.props.dataRet.selectedObj);
        this.props.loadWithFilters(refreshState, ret.toJS(), currentOffset);
    };
    play = (item) => {
        const {navigate} = this.props.navigation;
        return navigate('MoviePlayScreen', {code: item.hexId});
    };
    _headerSearch() {
        const {navigate} = this.props.navigation;
        return navigate('Search');
    }
    _goBack(){
        const {goBack} = this.props.navigation;
        return goBack();
    }
    _headerElement() {
        let categoryObj = this.props.categoryObj;
        let name = '';
        const iconSearch = require('../imgs/icon_search.png');

        if (!categoryObj || !categoryObj.type) {
            return <View/>;
        }

        if(this.params && this.params !== undefined){
            name = this.params.name;
        }

        return (
            <HeaderBox
                isText={true}
                text={name}
                isArrow={true}
                goBack={this._goBack.bind(this)}
                isEdit={true}
                rightElement={
                    <TouchableOpacity
                        style={styles.headerSearchBox}
                        activeOpacity={0.75}
                        onPress={this._headerSearch.bind(this)}
                    >
                        <Image source={iconSearch} resizeMode={'contain'} tintColor={'rgb(0,117,248)'} />
                    </TouchableOpacity>
                }
            />
        );
    }
    _cateMenu({item,index}){
        this.setState({navStartValue:item.id});

        // 取到菜单数组
        let menuWidthArr = this.menuWidthArr;
        // 滚动的距离-初始值设置为0
        let scrollDistance = 0;
        // 获得屏幕宽度
        let screenWidth = width;
        // 获取导航栏的总宽度
        let navAllWidth = this.menuWidthSum;
        // 获取的当前被选中菜单的宽度
        let menuWidth = menuWidthArr[index];
        // 对比的差值
        let difference = (screenWidth - menuWidth) / 2;
        // 当前菜单的左位移
        let curMenuLetPosition = this._curMenuLetPosition(menuWidthArr,index);

        if(curMenuLetPosition <= difference){
            scrollDistance = 0;
        }
        else if(difference - curMenuLetPosition <= screenWidth - navAllWidth){
            scrollDistance = screenWidth - navAllWidth;
        }
        else{
            scrollDistance = difference - curMenuLetPosition;
        }

        // 执行滚动
        this.scrollViewRef.scrollTo({x:(-scrollDistance),y:0,animated:true});
        this._selectZoneCallBack(item);
    }
    _curMenuLetPosition(arr,value){
        let sums = 0;

        arr.reduce((prev,cur,i) => {
            if(i === 0){sums = 0}
            if(i < value){sums += cur}
        },0);

        return sums;
    }
    _onMenuLayout(e,item){
        let menuWidth = e.nativeEvent.layout.width;

        this.menuWidthSum += menuWidth;
        this.menuWidthArr.push(menuWidth);
    }
    _selectZoneCallBack (option) {
        const { dataRet, reLoadWithFilters } = this.props;
        let selectObj = dataRet && Immutable.Map(dataRet.selectedObj);
        let ret = selectObj.setIn(['genre'], option.id);

        return reLoadWithFilters(RefreshState.HeaderRefreshing, ret.toJS());
    }
    _headerMenu(){
        const { categoryObj } = this.props;
        const { navStartValue } = this.state;
        let genre = categoryObj !== undefined && categoryObj.genre;
        let id = this.params && this.params.id;

        return (
            <View style={[styles.cateNav,]}>
                <ScrollView
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    style={{flex:1,position:'relative'}}
                    ref={ref => this.scrollViewRef = ref}
                >
                    {
                        (genre[id] || []).map((item,index) => {
                            let color = navStartValue === item.id ? 'rgb(0,117,248)' : 'rgb(172,172,192)';
                            let borderBottomColor = navStartValue === item.id ? 'rgb(0,117,248)' : 'transparent';

                            return (
                                <TouchableOpacity key={index} onPress={this._cateMenu.bind(this,{item,index})} activeOpacity={0.50}>
                                    <View onLayout={(e) => this._onMenuLayout(e,item)} style={[styles.cateNavItem,{borderBottomColor:borderBottomColor}]}>
                                        <Text style={[styles.cateNavItemText,{color:color}]}>{item.name}</Text>
                                    </View>
                                </TouchableOpacity>
                            )
                        })
                    }
                </ScrollView>
            </View>
        );
    }
    _getItemLayout(item, index){
        return {length: ITEM_HEIGHT , offset: ITEM_HEIGHT * index, index};
    }
    _renderItem({item,index}){
        return (<MovieCellInList key={index} item={item} {...this.props} onPress={this.play}/>);
    }
    render() {
        const { dataRet } = this.props;
        const { navStartValue } = this.state;
        let offset = dataRet && dataRet.offset;
        let totalRecords = dataRet && dataRet.totalRecords;
        let refreshState = dataRet && dataRet.refreshState;
        const { records } = this.state;
        const catType = (this.params && this.params.id) || 0;

        return (
            <View style={styles.container}>
                { this._headerElement() }
                { this._headerMenu() }
                {
                    records ?
                    <XingrenFlatList
                        ListHeaderComponent={(navStartValue === -1 && <FilterPanel {...this.props}/>)}
                        data={records}
                        renderItem={this._renderItem.bind(this)}
                        keyExtractor={(item,index) => index}
                        //getItemLayout={this._getItemLayout.bind(this)}
                        columnWrapperStyle={styles.cloumnWrapperStyle}
                        onHeaderRefresh={this.onHeaderRefresh}
                        onFooterRefresh={this.onFooterRefresh}
                        refreshState={refreshState}
                        //numColumns={catType === 4 ? 2 : 3}
                        numColumns={3}
                        totalRecords={totalRecords}
                        offset={offset}
                        contentContainerStyle={{paddingTop: 6}}
                        showReturnTop={true}
                    /> :
                    <View style={styles.loadingContent}>
                       <ActivityIndicator size={'small'} color={'rgb(0,117,248)'}/>
                    </View>
                }
            </View>
        );
    }
}

const styles = StyleSheet.create({
    loadingContent:{
        flex:1,
        justifyContent:'center',
        alignItems:'center'
    },
    cateNavLine:{
        position:'absolute',
        bottom:0,
        height:2,
        zIndex:1,
        backgroundColor:'rgb(0,117,248)'
    },
    cateNavItem:{
        height:44,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        paddingHorizontal:15,
        borderBottomWidth:3,
    },
    cateNavItemText:{
        fontSize:14,
        color:'rgb(172,172,192)'
    },
    cateNav:{
        borderBottomWidth:1/pixel,
        borderBottomColor:'#dcdcdc',
        height:44,
        flexDirection:'row',
        position:'relative'
    },
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#fff'
    },
    cloumnWrapperStyle: {
        justifyContent: 'space-between',
        paddingLeft: 6,
        paddingRight: 6
    },
    searchHeader: {
        height: 40,
        backgroundColor: '#ffffff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchInput: {
        height: 28,
        flex: 1,
        backgroundColor: '#e5e5e5',
        borderRadius: 2,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 0,
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 10,
    },
    searchIcon: {
        width: 15,
        height: 16,
        marginLeft: 10,
        marginRight: 10,
    },
    searchBox: {
        flex: 1,
        fontSize: 12,
        padding: 0,
    },
    filterIconStyle: {
        width: 20,
        height: 20,
    },
    filterIconContainerStyle: {
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        width: 60,
    },
    headerMenuBox: {
        flex: 3,
        height: 44,
        flexDirection: 'row',
        alignItems: 'center'
    },
    headerSearchBox: {
        flex: 1,
        height: 44,
        justifyContent: 'center',
        alignItems: 'flex-end',
        overflow: 'hidden',
        marginRight:15,
    },
    cateMenu: {
        height: 44,
        borderBottomWidth: 3,
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
    },
    cateMenuText: {
        fontSize: 14,
        fontWeight: 'bold'
    }
});

const mapStateToProps = (state, ownProps) => {
    let data = state.getIn(['explore', 'root']);
    if (Immutable.Map.isMap(data)) {
        data = data.toJS();
    }
    return {
        ...ownProps,
        ...data,
    };
};

export default connect(
    mapStateToProps, {
        showOrNotFilterPanel,
        reLoadWithFilters,
        loadWithFilters,
        loadCategoryList,
    })(InnerIndex);
