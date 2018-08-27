// 搜索页面

'use strict';

import React, {Component} from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, TextInput, Keyboard} from 'react-native';
import HeaderBox from '../../common/HeaderBox';
import SearchDefaultPage from './SearchDefaultPage';
import SearchAfterPage from './SearchAfterPage';
import NoData from './NoData';
import { loadSearchHistory, saveSearchHistory } from "../../common/Storage";
import Toast from 'react-native-root-toast';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import { RefreshState } from "../../Constants";
import {searchVideos, reloadSearchVideos} from '../../actions/explore';
import {width,height,pixel} from "../../common/tool";

class Search extends Component<{}> {
    constructor(props){
        super(props);
        this.state = {
            // 搜索前与后的状态管理
            changeFlag: false,
            // 搜索历史记录
            history: [],
            // 是否清除搜索内容
            isClean: false,
            // 是否显示默认界面
            isShowDefault: true,
            // 是否显示搜索按钮以及对应的功能
            isSearchBtn: false,
            // 是否显示搜索对应的列表内容
            isSearchList: false
        };
    }
    componentWillMount(){
        // 移动端键盘监听
        this._keyboardHide = Keyboard.addListener('keyboardDidHide',this._keyboardDidHideHandler.bind(this));
    }
    async componentWillReceiveProps(nextProps) {
        if (nextProps.searchRes.word && nextProps.searchRes.word !== this.props.searchRes.word) {
            // 记录搜索历史
            await saveSearchHistory(nextProps.searchRes.word);
            this.componentDidMount();
        }
    }
    async componentDidMount() {
        this.setState({history: await loadSearchHistory()});
    }
    componentWillUnmount() {
        // 删除移动端键盘的监听
        this._keyboardHide !== null && this._keyboardHide.remove();
    }
    // 移动端键盘关闭后让输入框失去焦点
    _keyboardDidHideHandler(){
        let word = this._textInput._lastNativeText;

        if(word === ''){
            this.setState({isSearchBtn:false});
        }

        return this._textInput && this._textInput.blur();
    }
    _resetWordState = (word) => {
        this.setState({changeFlag: true});

        if(word === ''){
            this.setState({isClean:false,isSearchBtn:false,isSearchList:false});
        }
        else{
            this.setState({isClean:true,isSearchBtn:true,isSearchList:true});
        }
    };
    // 清空搜索内容
    _clearSearchContent(){
        this.setState({isClean:false,isSearchBtn:false,isSearchList:false});
        return this._textInput.clear();
    }
    _returnDefaultSearchPage(){
        this.setState({isShowDefault:true,isClean:false,isSearchList:false,isSearchBtn:false});
        return this._textInput && this._textInput.blur();
    }
    _reloadSearchContent(){
        this.setState({isShowDefault:false,isSearchBtn:true,isClean:true});
    }
    _clearHistory(){
        Toast.show('亲，已全部清空了哦！',{position:Toast.positions.CENTER});
        return this.setState({history: [],isShowDefault:true});
    }
    _onClickSubmitEditing(){
        const {isShowDefault} = this.state;
        let word = isShowDefault ? (this._textInput._lastNativeText) : (this.props.searchRes && this.props.searchRes.word);
        return this._comCommit(word);
    }
    _onSubmitEditing(e){
        const word = e.nativeEvent.text || '';
        return this._comCommit(word);
    }
    _comCommit(word: string){
        const {searchVideos,reloadSearchVideos} = this.props;
        const {changeFlag} = this.state;
        this.setState({changeFlag:true});

        if (word && word !== '') {
            if(changeFlag){
                searchVideos(RefreshState.HeaderRefreshing, word.trim(),0,true);
                this.setState({changeFlag: false});
            }
            else{
                reloadSearchVideos(RefreshState.HeaderRefreshing, word.trim(),0);
            }
            this._textInput && this._textInput.blur();
            this.setState({isShowDefault:false,isSearchList:false});
        }
        else{
            Toast.show('搜索内容不能为空哟',{position: Toast.positions.CENTER});
        }
    }
    _searchCancel(){
        const { goBack } = this.props.navigation;
        return goBack();
    }
    render() {
        const {isClean,isShowDefault,records,history,isSearchBtn,isSearchList} = this.state;
        let _history = Object.keys(history);

        return (
            <View style={styles.content}>
                <HeaderBox>
                    <View style={styles.innerView}>
                        {
                            isShowDefault ?
                                <View style={[styles.headerInnerBox,{paddingLeft:15}]}><Image source={require('../imgs/icon_search.png')} resizeMode={'contain'}/></View> :
                                <TouchableOpacity onPress={this._returnDefaultSearchPage.bind(this)} activeOpacity={0.75} style={[styles.headerInnerBox,{paddingLeft:15}]}>
                                    <Image style={{height:14}} tintColor={'rgb(0,117,248)'} source={require('../imgs/icon_back_arrow_blue.png')} resizeMode={'contain'}/>
                                </TouchableOpacity>
                        }
                        <TextInput
                            style={[styles.textInput]}
                            underlineColorAndroid={'transparent'}
                            placeholder={'请输入影名、剧名、关键字词'}
                            placeholderTextColor={'rgb(175,175,192)'}
                            textAlignVertical={'center'}
                            ref={ref => this._textInput = ref}
                            returnKeyType = "search"
                            onSubmitEditing={this._onSubmitEditing.bind(this)}
                            defaultValue={isShowDefault ? '' : (this.props.searchRes && this.props.searchRes.word)}
                            onChangeText={(text) => this._resetWordState(text)}
                        />
                        {
                            isClean ?
                                <TouchableOpacity onPress={this._clearSearchContent.bind(this)} activeOpacity={1} style={styles.cleanX}>
                                    <Image source={require('../imgs/icon_search_close.png')} tintColor={'rgb(0,117,248)'} resizeMode={'contain'}/>
                                </TouchableOpacity> : null
                        }
                        <View style={styles.searchView}>
                            {/*<TouchableOpacity*/}
                                {/*activeOpacity={0.75}*/}
                                {/*style={styles.searchTouchable}*/}
                                {/*onPress={isSearchBtn ? this._onClickSubmitEditing.bind(this) : this._searchCancel.bind(this)}*/}
                            {/*>*/}
                                {/*{isSearchBtn ? <Text style={[styles.searchText,{color:'rgb(0,117,248)'}]}>搜索</Text> : <Text style={styles.searchText}>关闭</Text>}*/}
                            {/*</TouchableOpacity>*/}
                            <TouchableOpacity activeOpacity={0.75} style={styles.searchTouchable} onPress={ this._searchCancel.bind(this)}>
                                <Text style={[styles.searchText,{color:'rgb(175,175,192)'}]}>关闭</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </HeaderBox>
                {
                    isShowDefault ?
                        (
                            (_history.length !== 0)  ?
                                <SearchDefaultPage
                                    clearHistory={this._clearHistory.bind(this)}
                                    reloadSearchContent={this._reloadSearchContent.bind(this)}
                                    history={this.state.history}
                                    {...this.props}
                                /> :
                                <NoData source={require('../imgs/default/searchDefault.png')} isText={true} text={'暂无搜索记录'}/>
                        ) :
                        <SearchAfterPage
                            currentSearchValue={(this._textInput && this._textInput._lastNativeText) || (this.props.searchRes && this.props.searchRes.word)}
                            {...this.props}
                        />
                }
            </View>
        );
    }
}

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

export default connect(mapStateToProps, {
    searchVideos,
    reloadSearchVideos
})(Search);

const styles = StyleSheet.create({
    rows:{
        marginHorizontal:15,
        height:40,
        borderBottomColor:'#dcdcdc',
        borderBottomWidth:1/pixel,
        alignItems:'center',
        flexDirection:'row'
    },
    cleanX:{
        height:44,
        width:44,
        justifyContent:'center',
        alignItems:'center',
        flexDirection:'row',
        overflow:'hidden'
    },
    searchText:{
        fontSize:14,
        color:'rgb(64,64,64)'
    },
    searchView:{
        height:44,
        width:60,
        overflow:'hidden',
        paddingRight:0
    },
    searchTouchable:{
        height:44,
        flex:1,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'flex-end',
        paddingRight:15
    },
    textInput:{
        height:44,
        lineHeight:44,
        flex:1,
        backgroundColor:'transparent',
    },
    content: {
        backgroundColor: '#ffffff',
        overflow: 'hidden',
        flex: 1
    },
    innerView: {
        flex: 1,
        flexDirection: 'row'
    },
    headerInnerBox:{
        height:44,
        paddingRight:10,
        flexDirection:'row',
        alignItems:'center',
        overflow:'hidden'
    },
});






































