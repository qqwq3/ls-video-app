
// 缓存管理

'use strict';

import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Image,
    Alert,
    SectionList,
    StatusBar
} from 'react-native';
import Toast from 'react-native-root-toast';
import * as Progress from 'react-native-progress';
import Swipeout from 'react-native-swipeout';
import KeepAwake from 'react-native-keep-awake';
import HeaderBox from '../../common/HeaderBox';

const util = require('../../common/Util');

const images = {
    cacheFolder: require('../imgs/icon_cache_folder.png'),
};

class CachingItem extends React.Component {
    _toggleDownload = () => {
        cacheManager
            .toggleMovie(this.props.movieId)
            .then((result) => {
                if (result === true) {
                    Toast.show('启动成功');
                } else if (result === false) {
                    console.log('下载启动失败');
                } else if (typeof result === 'string') {
                    Toast.show(result);
                }
            });
    };

    _deleteCache = () => {
        cacheManager.clearMovieId(this.props.movieId)
            .then((result) => {
                if (result){
                    this.props.checkCallback && this.props.checkCallback();
                    Toast.show('删除成功');
                }
                else
                    Toast.show('删除失败，请稍候重试')
            });
    };

    render() {
        let downloader = cacheManager.getDownloader(this.props.movieId);
        if (!downloader) {
            return null;
        }

        let m = downloader.movie;
        let downStatus = downloader.status;

        let movieType = "";
        let episode = "";
        if(m.type === 1){
            movieType = "电影";
        }
        if(m.type === 2){
            movieType = "电视剧";
            episode = "第"+m.episode+"集";
        }

        if(m.type === 4){
            movieType = "综艺";
            episode = m.subTitle;
        }

        if(m.type === 5){
            movieType = "动漫";
            episode = "第"+m.episode+"集";
        }

        let startState = downloader.isStartDownload;

        return (
            <Swipeout style={styles.itemContainer} autoClose={true} right={[
                { text: '删除', backgroundColor: '#fa4848', onPress: this._deleteCache.bind(this) }
            ]}>
                <TouchableOpacity style={styles.cachingListRow} onPress={this._toggleDownload}>
                    <Image
                        source={{uri: m.cover}}
                        style={styles.movieCover}
                    />
                    <View style={styles.infoContainer}>
                        <Text style={styles.infoTitle} numberOfLines={2}>{m.title}  {movieType}  {episode}</Text>
                        <View style={styles.infoStatsContainer}>
                            <View style={styles.infoStats}>
                                <Text style={styles.infoLeftText}>{downStatus.statusText}</Text>
                                {startState?<Text style={[styles.infoLeftText,{color:'#0076F8'}]}>   vip加速中</Text>:null}
                                {/*{downStatus.progress.total > 0 ? <Text style={styles.infoRightText}>{downStatus.progress.received}/{downStatus.progress.total}</Text> : null}*/}
                            </View>
                            <Progress.Bar
                                color= {startState?"#0076F8":"#e7e7e7"}
                                borderColor="#e7e7e7"
                                progress={downStatus.progress.percent}
                                style={styles.progressBar}
                                width={util.SCREEN_WIDTH - 175}
                            />
                        </View>
                    </View>
                </TouchableOpacity>
                <View style={styles.sectionSeparator}></View>
            </Swipeout>
        );
    }
}

class CachedItem extends React.Component {
    _play = () => {
        let m = cacheManager.getMovie(this.props.movieId);
        if (!m) {
            return Toast.show('视频无效');
        }
        let path = cacheManager.getMoviePath(this.props.movieId);

        this.props.navigation.navigate('PlayLocalScreen', {video: m, source: path && path.playSource});
    };

    _deleteCache = () => {
        cacheManager.clearMovieId(this.props.movieId)
            .then((result) => {
                if (result){
                    this.props.checkCallback && this.props.checkCallback();
                    Toast.show('删除成功');
                }
                else
                    Toast.show('删除失败，请稍候重试')
            });
    };

    render() {
        let m = cacheManager.getMovie(this.props.movieId);
        if (!m) {
            return null;
        }
        let movieType = "";
        let episode = "";
        if(m.type === 1){
            movieType = "电影";
        }
        if(m.type === 2){
            movieType = "电视剧";
            episode = "第"+m.episode+"集";
        }

        if(m.type === 4){
            movieType = "综艺";
            episode = m.subTitle;
        }

        if(m.type === 5){
            movieType = "动漫";
            episode = "第"+m.episode+"集";
        }

        let playedTime = m.playedTime || 0;

        return (
            <Swipeout style={styles.itemContainer} autoClose={true} right={[
                { text: '删除', backgroundColor: '#fa4848', onPress: this._deleteCache.bind(this) }
            ]}>
                <TouchableOpacity style={styles.cachingListRow} onPress={this._play}>
                    <Image
                        source={{uri: m.cover}}
                        style={styles.movieCover}
                    />
                    <View style={styles.infoContainer}>
                        <Text style={styles.infoTitle} numberOfLines={2}>{m.title}  {movieType} {episode}</Text>
                        <View style={styles.infoStatsContainer}>
                            <View style={styles.infoStats}>
                                <Text style={styles.infoLeftText}>{playedTime === 0?"未播放":"上次播放至:"+playedTime}</Text>
                            </View>
                        </View>
                        {/*<Image source={require('../imgs/icon_right_arrow2.png')} style={styles.iconPlayArrow} />*/}
                    </View>
                </TouchableOpacity>
                <View style={styles.sectionSeparator}></View>
            </Swipeout>
        );
    }
}

class CacheManagement extends Component<{}> {
    componentWillMount(){
        StatusBar.setBackgroundColor('rgb(255,255,255)',true);
        StatusBar.setBarStyle('dark-content');
    }
    constructor(props) {
        super(props);
        this.state = {
            cachePageTitle:'我的缓存',
            currentPage:0,
            //当前选择缓存数组
            currentCacheArr:[],
        };
    }
    componentDidMount() {
        // heartbeat.resetCache();
        this._timer = setInterval(() => this._check(), 3000);
        this._check();
    }
    componentWillUnmount() {
        // heartbeat.resetNormal();
        if (this._timer) {
            clearInterval(this._timer);
        }
        // StatusBar.setBackgroundColor('#000000',true);
        // StatusBar.setBarStyle('light-content');
    }
    _hasData() {
        return (this.state.caching && this.state.caching.length > 0) || (this.state.cached && this.state.cached.length > 0);
    }
    _check = async () => {
        // 检查空间
        let df = await cacheManager.getSpace();
        // 获取缓存中
        this.setState({...this.state, ...df, caching: cacheManager.props.caching, cached: cacheManager.props.cached});
    };
    _renderSpace() {
        return (
            <View style={styles.spaceContainer}>
                <Text style={styles.spaceText}>已使用</Text>
                <Text style={styles.spaceValue}>{util.sizeHuman(this.state.internal_total - this.state.internal_free)}</Text>
                <Text style={styles.spaceText}>, 可用空间</Text>
                <Text style={styles.spaceValue}>{util.sizeHuman(this.state.internal_free)}</Text>
            </View>
        );
    }
    _renderEmpty() {
        return (
            <View style={styles.emptyContainer}>
                <Image
                    source={require('../imgs/cache_default.png')}
                    // style={styles.imgEmpty}
                />
                <Text style={styles.textEmpty}>去首页找一些你喜欢的片子吧</Text>
            </View>
        );
    }
    //跳转到缓存界面
    _selectMore(section){
        let id = section.section.data[0];
        let m =  cacheManager.getMovie(id);
        this.props.navigation.navigate('TVCacheFlatList', {video: m, clarityArr: m.clarityArr,pageSource:true});
    }
    _selectCachedMore(section) {
        return (
            <TouchableOpacity
                style={{height:50}}
                onPress={() => this._selectMore(section)}
                activeOpacity={0.75}
            >
                <View style={styles.moreBtnView}>
                    <Text style={styles.moreBtn}>缓存更多集</Text>
                </View>
            </TouchableOpacity>
        );
    }
    _selectCacheing(){
        this.setState({currentPage:1,cachePageTitle:'正在缓存'});
    }
    _cachingFile(){
        let running = cacheManager.getRunning();
        let downStatus = null;
        let title = '缓存未开始';
        let cover = '';
        if(running.length > 0){
            let downloader = running[0];
            downStatus = downloader.status;

            let m = downloader.movie;
            title = '正在缓存  '+m.title +"  第"+m.episode+"集";
            cover = m.cover;
        }

        return(
            <TouchableOpacity
                style={styles.cachingListRow}
                onPress={() => this._selectCacheing()}
                activeOpacity={0.75}
            >
                <Image
                    source={ cover === ''?images.cacheFolder:{uri: cover}}
                    style={styles.movieCover}
                />
                <View style={styles.infoContainer}>
                    <Text style={styles.infoTitle} numberOfLines={2}>{title}</Text>
                    <View style={styles.infoStatsContainer}>
                        <View style={styles.infoStats}>
                            <Text style={styles.infoLeftText}>{downStatus !== null?downStatus.statusText:''}</Text>
                            {/*{downStatus.progress.total > 0 ? <Text style={styles.infoRightText}>{downStatus.progress.received}/{downStatus.progress.total}</Text> : null}*/}
                        </View>
                        <Progress.Bar
                            color="#0076F8"
                            borderColor="#e7e7e7"
                            progress={downStatus !== null?downStatus.progress.percent:0}
                            style={styles.progressBar}
                            width={util.SCREEN_WIDTH - 175}
                        />
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
    _selectCached(tvTitle,idArr){
        this.setState({currentCacheArr:idArr,currentPage:2,cachePageTitle:tvTitle,});
    }
    _cachedFile(item){
        let movieId = item[0];
        let idArr = item[1];
        let oneArr = idArr[0];
        let arrLength = idArr.length;
        let m =  cacheManager.getMovie(oneArr);
        let allLength = Object.keys(m.playLink).length;
        let tvTitle =m.title;

        if(m.type === 1){
            return(<CachedItem checkCallback={this._checkCallback.bind(this)} movieId={oneArr} navigation={this.props.navigation} />);
        }
        else{
            return(
                <View>
                    <TouchableOpacity
                        style={styles.cachingListRow}
                        onPress={() => this._selectCached(tvTitle,idArr)}
                        activeOpacity={0.75}
                    >
                        <View  style={styles.movieCoverView}>
                            <Image
                                source={{uri: m.cover}}
                                style={styles.movieCover}
                            />
                        </View >
                        <View>
                            <View style={styles.infoContainer}>
                                <Text style={styles.infoTitle} numberOfLines={2}>{m.title}</Text>
                                <View style={styles.infoStatsContainer}>
                                    <View style={styles.infoStats}>
                                        <Text style={styles.infoLeftText} numberOfLines={1}>共{allLength}集 |</Text>
                                        <Text style={styles.infoLeftText} numberOfLines={1}> 已缓存{ arrLength }集</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.sectionSeparator}></View>
                </View>
            );
        }
    }
    _renderList() {
        if ((!this.state.caching || this.state.caching.length <= 0) && (!this.state.cached || this.state.cached.length <= 0)) {
            return null;
        }
        let cached = this.state.cached;
        let map = new Map();
        let mapArr = [];

        if(cached && cached.length > 0){
            for(let id of cached){
                let m = cacheManager.getMovie(id);
                let movieId = m.movieId;
                if(map.has(movieId)){
                    let arr = map.get(movieId);
                    arr.push(id);
                    map.set(movieId,arr);
                }else{
                    let arr = [];
                    arr.push(id);
                    map.set(movieId,arr);
                }
            }
            mapArr = [...map];
        }

        let cachingArr = [];

        if(this.state.caching && this.state.caching.length > 0){
            cachingArr.push(1);
        }

        return (
            <View style={styles.dataContainer}>
                <SectionList
                    keyExtractor={(item, index) => item + ':' + index}
                    renderSectionHeader={({section}) => section.data && section.data.length > 0 ? <View style={[styles.listTitleContainer, section.headerStyle]}><Text style={styles.listTitle}>{section.key}</Text></View> : null}
                    // ItemSeparatorComponent={() => <View style={styles.sectionSeparator}></View>}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    sections={[
                        { renderItem: ({item}) => this._cachingFile(item), key: '正在缓存', data: cachingArr },
                        { renderItem: ({item}) => this._cachedFile(item), key: '已缓存', headerStyle: this.state.caching.length > 0 ? styles.listTitleSep : null, data:mapArr },
                        // { renderItem: ({item}) => <CachedItem movieId={item} navigation={this.props.navigation} />, key: '已缓存', headerStyle: this.state.caching.length > 0 ? styles.listTitleSep : null, data: this.state.cached },
                    ]}
                    getItemLayout={(data, index) => (
                        {length: 70, offset: 70 * index, index}
                    )}
                />
            </View>
        );
    }
    _checkCallback(){
        this._check();
    }
    _renderCaching() {
        if (this.state.caching && this.state.caching.length <= 0) {
            return null;
        }

        return (
            <View style={styles.dataContainer}>
                <SectionList
                    keyExtractor={(item, index) => item + ':' + index}
                    // renderSectionHeader={({section}) => section.data && section.data.length > 0 ? <View style={[styles.listTitleContainer, section.headerStyle]}><Text style={styles.listTitle}>{section.key}</Text></View> : null}
                    // ItemSeparatorComponent={() => <View style={styles.sectionSeparator}></View>}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    sections={[
                        { renderItem: ({item}) => <CachingItem checkCallback={this._checkCallback.bind(this)} movieId={item} navigation={this.props.navigation} />, key: '正在缓存', data: this.state.caching },
                    ]}
                    getItemLayout={(data, index) => (
                        {length: 70, offset: 70 * index, index}
                    )}
                />
            </View>
        );
    }
    _renderCached() {
        const {currentCacheArr} = this.state;

        if (currentCacheArr && currentCacheArr.length <= 0) {
            return null;
        }

        return (
            <View style={styles.dataContainer}>
                <SectionList
                    keyExtractor={(item, index) => item + ':' + index}
                    renderSectionHeader={(section) => this._selectCachedMore(section)}
                    // ItemSeparatorComponent={() => <View style={styles.sectionSeparator}></View>}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    sections={[
                        { renderItem: ({item}) => <CachedItem checkCallback={this._checkCallback.bind(this)} movieId={item} navigation={this.props.navigation} />,  data: currentCacheArr },
                    ]}
                    getItemLayout={(data, index) => (
                        {length: 70, offset: 70 * index, index}
                    )}
                />
            </View>
        );
    }
    _render() {
        const {currentPage} = this.state;

        if(currentPage === 1){
            return(
                this._renderCaching()
            );
        }
        else if(currentPage === 2){
            return(
               this._renderCached()
            );
        }
        else{
            return(
                this._renderList()
            );
        }
    }
    render() {
        const {cachePageTitle} = this.state;
        return (
            <View style={styles.content}>
                <HeaderBox
                    isText={true}
                    text={cachePageTitle}
                    isArrow={true}
                    goBack={this._goBack.bind(this)}
                    //isEdit={true}
                    //rightElement={<RightElement editFunc={this._editFunc.bind(this)}/>}
                />
                {/*<NoData source={require('../imgs/history.png')} isText={true} text={'暂无缓存内容'}/>*/}
                <View style={styles.container}>
                    {this._hasData() ? this._render() : this._renderEmpty()}
                    {this._renderSpace()}
                    <KeepAwake />
                </View>
            </View>
        )
    }
    _editFunc(){
        Alert.alert('缓存列表里的编辑');
    }
    _goBack(){
        if(this.state.currentPage === 0){
            const { goBack } = this.props.navigation;

            return goBack();
        }
        else{
            this.setState({currentPage:0,cachePageTitle:'我的缓存'});
        }
    }
}

export default CacheManagement;

const styles = StyleSheet.create({
    moreBtnView:{
        borderWidth:1,
        borderColor:'#0076f8',
        width:80,
        height:30,
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
        borderRadius:30,
    },
    moreBtn:{
        // borderWidth:1,
        // borderColor:'#0076f8',
        fontSize:12,
        color:'#0076f8',
    },
    rightElementText:{
        color: 'rgb(0,118,248)',
        fontSize: 14
    },
    rightElemnet:{
        flex:1,
        overflow:'hidden',
        flexDirection:'row',
        justifyContent:'flex-end',
        alignItems:'center',
        paddingRight:15
    },
    content:{
        flex:1,
        backgroundColor:'#ffffff',
        flexDirection:'column'
    },
    cacheContent:{
        flex:1,
    },
    icon: {
        width: 31,
        height: 28,
    },
    container: {
        flex: 1,
    },
    dataContainer: {
        flex: 1,
        paddingLeft: 15,
        paddingRight: 15,
        paddingTop: 15,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    imgEmpty: {
        width: 200,
        height: 140,
    },
    textEmpty: {
        color:'#cccccc',
        fontSize:18,
        fontWeight:'bold',
        marginTop:25
    },
    spaceContainer: {
        width: util.SCREEN_WIDTH,
        height: 25,
        backgroundColor: '#2e2e2e',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        position:'absolute',
        bottom:0,
    },
    spaceText: {
        fontSize: 10,
        color: '#ffffff',
    },
    spaceValue: {
        fontSize: 10,
        color: '#eb832e',
    },
    listCaching: {
        paddingLeft: 15,
        paddingRight: 15,
        paddingTop: 15,
        borderBottomColor: '#3d3d3d',
        borderBottomWidth: 1,
    },
    listTitleContainer: {
    },
    listTitleSep: {
        borderTopWidth: 1,
        borderTopColor: '#e7e7e7',
        paddingTop: 15,
        marginTop: 8,
    },
    listTitle: {
        fontSize: 16,
        height: 40,
        color: '#646464',
        fontWeight: '100',
        justifyContent: 'center',
    },
    cachingListRow: {
        flexDirection: 'row',
        height: 70,
        marginTop:8,
    },
    cachingList: {

    },
    movieCoverView:{
        width: 120,
        height: 70,
    },
    movieCover: {
        width: 120,
        height: 70,
    },
    infoContainer: {
        flex: 1,
        marginLeft: 10,
        marginRight: 15,
        justifyContent: 'center',
    },
    infoTitle: {
        color: '#646464',
        fontSize: 12,
        fontWeight: '100',
        flex: 1,
    },
    infoStatsContainer: {
        flex: 1,
        position: 'absolute',
        bottom: 0,
        left: 0,
    },
    infoStats: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    infoLeftText: {
        fontSize: 10,
        color: '#646464',
        textAlign: 'left',
    },
    infoRightText: {
        flex: 1,
        fontSize: 10,
        color: '#646464',
        textAlign: 'right',
    },
    progressBar: {
        height:5,
    },
    listCached: {
        borderBottomWidth: 0,
    },
    sectionSeparator: {
        height: 1,
        borderBottomColor:"#e7e7e7",
        borderBottomWidth:1,
        width: util.SCREEN_WIDTH,
        backgroundColor: '#3D3D3D',
        marginTop: 8,
        // marginBottom: 8,
    },
    iconPlayArrow: {
        position: 'absolute',
        right: 0,
    },
    itemContainer: {
        backgroundColor: 'transparent'
    },
});





































