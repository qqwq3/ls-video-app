
/*缓存操作*/

'use strict';

import React,{PureComponent} from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Image,
    FlatList,
    Alert,
    Modal,
    StatusBar
} from 'react-native';
import { loadStreams } from '../../actions/video';
import { EasyLoading } from '../../components/XingrenEasyLoading';
import Toast from 'react-native-root-toast';
import HeaderBox from '../../common/HeaderBox';
import { width, pixel } from "../../common/tool";


const images = {
    episodeDownload: require('../imgs/icon_episode_downloaded.png'),
    episodeDownloading: require('../imgs/icon_episode_downloading.png'),
};

class TVCacheFlatList extends PureComponent<{}>{
    static oldEpisode = 0;
    static propTypes = {

    };
    static defaultProps = {

    };
    constructor(props){
        super(props);
        this.state = {
            selectNode: false,
            clarityArr: null,
            video: false,
            //是否显示清晰读
            visible:false,
            //当前的清晰读
            cacheClarity:0,
            //缓存题目
            cacheTvTitle:'',
            //页面来源 flase 正常下载 true 缓存更多集
            pageSource:false,
            isAll:false
        };
    }
    componentWillMount(){
        let obj = (this.props.navigation && this.props.navigation.state && this.props.navigation.state.params) || false;
        if(obj){
            this.setState({clarityArr: obj.clarityArr, video: obj.video,pageSource:obj.pageSource});
        }
        StatusBar.setBackgroundColor('rgb(255,255,255)',true);
        StatusBar.setBarStyle('dark-content');
    }
    componentWillUnmount(){
        this.setState = () => {return};
        StatusBar.setBackgroundColor('#000000',true);
        StatusBar.setBarStyle('light-content');
    }
    _goBack(){
        const { goBack } = this.props.navigation;
        return goBack();
    }
    _selectSingle(episode){
        if (episode !== this.oldEpisode) {
            this.setState({selectNode: episode});
        }
        this.oldEpisode = episode;

        const {cacheClarity,video} = this.state;
        let clarity = cacheClarity ?cacheClarity :0;
        let season = 0;
        if(video && video.playLink) {
            let D : any = 0;
            let arr = Object.keys(video.playLink);

            if(video.type === 2 || video.type === 1 || video.type === 5){
                D = arr[0];
            }
            else if(video.type === 4){
                D = arr[arr.length-1];
            }
            else{
                D = 0;
            }
            let episodeValue = video.playLink[episode|| D];
            if(episodeValue && episodeValue.season) {
                season = episodeValue.season;
            }
        }

        let id = video.id;
        if(this.state.pageSource){
            id = video.movieId;
        }

        loadStreams(id, season || 0, episode || 1, video.src || 0)
            .then((result) => {
                    if (result.code === 0) {
                        let streams = result.data;
                        this._downloadStream(streams[clarity],episode);
                        //减少服务器的观影劵
                        // downVideo(video.id, code, episode, episodeValue.serialsSrcId);
                    }
                },
                (error) => {
                    Toast.show("下载错误");
                });
    }

    //下载视频
    _downloadStream(item,episode) {
        const { video,clarityArr,pageSource } = this.state;
        let downVideo = new Object();
        downVideo.id = video.playLink[episode].serialsSrcId;
        // console.log(" 添加 video :",item,downVideo.id,episode,video);
        downVideo.item = item;
        downVideo.title = video.title;
        downVideo.cover = video.cover;
        downVideo.hexId = video.hexId;
        downVideo.type = video.type;
        let id = video.id;
        if(pageSource){
            id = video.movieId;
        }
        downVideo.movieId = id;
        downVideo.playLink = video.playLink;
        downVideo.clarityArr = clarityArr;
        //综艺添加二级题目
        let subTitle = "";
        if(video.type === 4){
            subTitle = video.playLink[episode].subTitle;
        }
        downVideo.subTitle = subTitle;
        downVideo.episode = episode;
        let _reDownalod = async () => {
            await cacheManager.clearMovieId(downVideo.id);
            cacheManager.add(downVideo, item)
                .then((ok) => {
                    if (ok) {
                        Toast.show('视频已加入缓存队列');
                    }
                }, (err) => {
                    Toast.show(err);
                });
        };
        let _download = () => {
            EasyLoading.show(null);
            _reDownalod();
        };

        if (cacheManager.existsMovie(downVideo.id)) {
            return Alert.alert('提示', '视频已在缓存队列中，是否删除重新缓存？', [
                { text: '取消' },
                { text: '删除重下', onPress: () => _download() }
            ]);
        }
        _download();
    }
    _renderItem({item,index}){
        const {video,selectNode,isAll} = this.state;
        let playLink = video.playLink;
        let movieType = video.type;
        let serialsSrcId = playLink[item].serialsSrcId;
        let subTitle = playLink[item].subTitle;

        let number_item = Number(item);
        // let color = (number_item === (selectNode)) ? 'rgb(255,255,255)' : 'rgb(64,64,64)';
        let color = (number_item === (selectNode)) ? 'rgb(0,117,248)' : 'rgb(64,64,64)';
        // let bgColor = (number_item === (selectNode)) ? 'rgb(0,117,248)' : 'rgb(239,239,239)';
        let bgColor = (number_item === (selectNode)) ? true : false;
        let type = 'horizontal';
        let isDownOverImg = false;
        let cachingArr = cacheManager.getCaching();
        if(cachingArr.includes(serialsSrcId)){
            color = 'rgb(0,117,248)';
            bgColor = true;
        }

        let cachedArr = cacheManager.getCached();
        if(cachedArr.includes(serialsSrcId)){
            color = 'rgb(0,117,248)';
            bgColor = true;
            isDownOverImg = true;
        }


        if(isAll){
            color = 'rgb(0,117,248)';
            bgColor = true;
        }

        return (
            (movieType === 4)?
                <TouchableOpacity activeOpacity={0.75}
                      onPress={() => this._selectSingle(number_item)}
                      style={[styles.zyBox,{marginLeft:20,marginTop:20,},bgColor?{backgroundColor:'rgb(229,241,254)'}:{backgroundColor:'rgb(239,239,239)'}]}
                >
                    <Text numberOfLines={2} style={[styles.zyBoxText,{color:color}]}>{subTitle}</Text>
                    {
                        bgColor?(<View style={{position:'absolute',right:0,bottom:0,}}>{isDownOverImg?<Image  source={images.episodeDownload} />:<Image  source={images.episodeDownloading} />}</View>):null
                    }
                </TouchableOpacity>
                :
                <View key={index} style={[styles.rows,type === 'horizontal' ? {height:'auto',paddingBottom:0} : {}]}>
                    <TouchableOpacity
                        style={[styles.rowsBox,bgColor?{backgroundColor:'rgb(229,241,254)',}:{backgroundColor:'rgb(239,239,239)'},type === 'horizontal' ? {width:45,height:45} : {}]}
                        onPress={() => this._selectSingle(number_item)}
                        activeOpacity={0.75}
                    >
                        <Text style={[styles.rowsBoxText,{color:color}]} numberOfLines={1}>{index+1}</Text>
                        {
                            bgColor?(<View style={{position:'absolute',right:0,bottom:0,}}>{isDownOverImg?<Image  source={images.episodeDownload} />:<Image  source={images.episodeDownloading} />}</View>):null
                        }
                    </TouchableOpacity>
                </View>
        );
    }
    // 缓存电视剧清晰度选择
    _cacheTvClaritySelect(){
        StatusBar.setBackgroundColor('#000000',true);
        StatusBar.setBarStyle('light-content');
        this.setState({visible:true});
    }
    // 电视剧全部缓存
    _cacheTVAll(){
        // Alert.alert('电视剧全部缓存');
        const {video} = this.state;
        let length = Object.keys(video.playLink).length;
        let i = 1;

        while(i<=length){
            this._selectSingle(i);
            i++;
        }
        this.setState({isAll:true});
    }
    // 查看缓存视频
    _checkCacheVide(){
        const { navigate } = this.props.navigation;
        // this.props.changedPlayer();
        return navigate('CacheManagement');
    }
    _onRequestClose(){
        StatusBar.setBackgroundColor('rgb(255,255,255)',true);
        StatusBar.setBarStyle('dark-content');
        return this.setState({visible:false});
    }
    _changeClarity(cacheClarity){
        this.setState({
            cacheClarity:cacheClarity,
        });
        this._onRequestClose();
    }
    // 电视剧缓存选择清晰度page
    _cacheTvClaritySelectPage(){
        const {visible} = this.state;
        let clarityArr = this.state.clarityArr;
        return (
            <Modal
                visible={visible}
                transparent={true}
                onRequestClose={this._onRequestClose.bind(this)}
                animationType={'fade'}
            >
                <TouchableOpacity activeOpacity={1} onPress={this._onRequestClose.bind(this)} style={styles.modalContent}>
                    <View style={{backgroundColor:'#ffffff', paddingHorizontal:10}}>
                        {
                            clarityArr.map((item,index) => {
                                return (
                                    <TouchableOpacity key={index} activeOpacity={0.50} onPress={this._changeClarity.bind(this,index)} >
                                        <View style={[styles.modalRow,{borderBottomWidth:1/pixel}]}>
                                            <Text style={styles.modalRowText}>{ item.videoProfile }</Text>
                                        </View>
                                    </TouchableOpacity>
                                )
                            })
                        }
                    </View>
                </TouchableOpacity>
            </Modal>
        );
    }
    _renderFlatlist(){
        const { video } = this.state;
        let episodeRecords = Object.keys(video.playLink);
        let movieType = video.type;
        return(
            (movieType !==4)?
                <FlatList
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    data={episodeRecords}
                    keyExtractor={(item,index) => index}
                    renderItem={this._renderItem.bind(this)}
                    columnWrapperStyle={styles.cloumnWrapperStyle}
                    horizontal={false}
                    numColumns={5}
                    initialNumToRender={20}
                    scrollEnabled={true}
                    contentContainerStyle={{paddingHorizontal:10,paddingTop:10,paddingBottom:45,}}
                /> :
                <FlatList
                    data={episodeRecords}
                    renderItem={this._renderItem.bind(this)}
                    numColumns={2}
                    keyExtractor={(item,index) => index}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{paddingBottom:45}}
                />
        );
    }
    render(){
        const {cacheClarity,clarityArr,video} = this.state;
        let cacheTvTitle = video.title;
        let clarityText = '';
        if(clarityArr !== null && clarityArr.length !=0){
            clarityText =clarityArr[cacheClarity].videoProfile;
        }

        return (
            <View style={{flex:1,backgroundColor:'#fff'}}>
                <HeaderBox
                    isText={true}
                    text={cacheTvTitle}
                    isArrow={true}
                    goBack={this._goBack.bind(this)}
                    //isEdit={true}
                    //rightElement={(recordsArr.length === 0) ? null : <RightElement cancelFunc={this._cancelFunc.bind(this)} editFunc={this._editFunc.bind(this)}/>}
                />
                <TouchableOpacity  activeOpacity={1} onPress={this._cacheTvClaritySelect.bind(this)} style={[styles.comStyle,{justifyContent:'flex-start'}]}>
                    <Text style={{fontSize:16,fontWeight:'bold', color:'#404040',}}>缓存选择</Text>
                    <Text style={styles.selectQXD} >{clarityText}</Text>
                    <Image style={{position:'absolute',right:20,}}  source={require('../imgs/arrow_player_down.png')} />
                </TouchableOpacity>
                {this._renderFlatlist()}
                <View style={[styles.cacheButs,{flexDirection:'row',justifyContent:'center',alignItems:'center'}]}>
                    <TouchableOpacity
                    style={styles.cacheInnerButs}
                    accessible={true}
                    activeOpacity={0.50}
                    onPress={this._cacheTVAll.bind(this)}
                    >
                    <View style={[styles.cacheCs,{borderRightWidth:1/pixel}]}><Text style={styles.cacheButsText}>全部缓存</Text></View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.cacheInnerButs}
                        accessible={true}
                        activeOpacity={0.50}
                        onPress={this._checkCacheVide.bind(this)}
                    >
                        <View style={[styles.cacheCs]}><Text style={styles.cacheButsText}>查看缓存视频</Text></View>
                    </TouchableOpacity>
                    {this._cacheTvClaritySelectPage()}
                </View>
            </View>
        );
    }
}

export default TVCacheFlatList;

const styles = StyleSheet.create({
    modalContent:{
        flex:1,
        position:'absolute',
        top:0,
        left:0,
        bottom:0,
        right:0,
        backgroundColor:'rgba(0,0,0,0.5)',
        zIndex:999,
        flexDirection:'column',
        justifyContent:'flex-end'
    },
    modalRowText:{
        fontSize:15,
        color:'rgb(0,117,248)'
    },
    modalRow:{
        height:50,
        justifyContent:'center',
        alignItems:'center',
        borderBottomColor:'#dcdcdc'
    },
    cacheButs:{
        borderTopWidth:1/pixel,
        borderTopColor:'#dcdcdc',
        height:50,
        // marginHorizontal:10,
        position:'absolute',
        left:0,
        bottom:0,
        overflow:'hidden',
        zIndex:666,
        width:width,
        backgroundColor:"#fff"
    },
    cacheInnerButs:{
        flex:1,
        flexDirection:'row',
        alignItems:'center',
        height:50
    },
    cacheButsText:{
        fontSize:15,
        color:'#404040'
    },
    cacheCs:{
        flex:1,
        flexDirection:'row',
        justifyContent:'center',
        height:30,
        alignItems:'center',
        borderRightColor:'#dcdcdc'
    },
    selectQXD:{
        fontSize:14,
        color:'rgb(0,117,248)',
        marginLeft:30
    },
    comStyle: {
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        paddingHorizontal: 20,
        paddingTop:10,
        paddingBottom:10,
        borderBottomWidth:1/pixel,
        borderBottomColor:'#dcdcdc',
        // borderWidth:1,
        // borderColor:'red',
    },
    zyBox:{
        backgroundColor:'rgb(239,239,239)',
        overflow:'hidden',
        borderRadius:4,
        width:(width - 60) / 2,
        justifyContent:'center',
        alignItems:"center",
        padding:8,
    },
    zyBoxText:{
        color:'rgb(64,64,64)',
        fontSize:12,
        lineHeight:18,
    },
    flatList:{
        marginTop:6
    },
    zyRows: {
        backgroundColor:'#ffffff',
        overflow:'hidden',
        width: width/2 - 7.5,
        justifyContent:'center',
        paddingTop: 15,
        flexDirection:'row',
        paddingLeft:15
    },
    rows: {
        width: (width-20) / 5,
        height: (width-20) / 5,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10
    },
    rowsBox:{
        borderRadius: 4,
        height:'100%',
        width:'100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor:'rgb(239,239,239)'
    },
    rowsBoxText:{
        fontSize: 15,
        alignContent: 'center',
    },
    cloumnWrapperStyle: {
        justifyContent: 'flex-start',
        flexWrap: 'wrap',
    },
    FlatListContent:{
        paddingTop:6,
        paddingBottom:6
    },
    content:{
        flex:1,
        marginBottom: 35,
        overflow:'hidden'
    },
    itemBox:{
        width:width/5,
        height:60,
        justifyContent:'center',
        alignItems:'center'
    },
    itemView:{
        width:40,
        height:40,
        borderRadius:50,
        borderWidth:0.5,
        borderColor: '#c0c0c0',
        overflow:'hidden',
        justifyContent:'center',
        alignItems:'center'
    },
    itemText:{
        fontSize: 15,
        color: '#c0c0c0',
        alignContent: 'center',
    }
});














































