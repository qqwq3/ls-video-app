
/*答题中心*/

import React,{ PureComponent } from 'react';
import { ScrollView, StyleSheet, StatusBar, View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import Toast from 'react-native-root-toast';
import HeaderBox from '../../common/HeaderBox';
import { loadAnswerQuestions,sumbitAnswer } from '../../actions/task';
import NoData from '../Common/NoData';

const styles = StyleSheet.create({
    questions:{

    },
    tjBtn:{
        width:200,
        height:44,
        backgroundColor:'#0076f8',
        borderRadius:50,
        alignItems:'center',
        justifyContent:'center',
        elevation:2.5
    },
    line:{
        height:'100%',
        position:'absolute',
        top:0,
        width:2,
        left:'50%',
        marginLeft:-1,
        backgroundColor:'rgb(0,117,248)',
        zIndex:10
    },
    selectRadio:{
        width:14,
        height:14,
        borderWidth: 0.6,
        borderRadius:14,
        borderColor:'#dcdcdc',
        marginRight:2
    },
    selectRadioImage:{
        width:14,
        height:14,
        marginRight:2
    },
    selectText:{
        fontSize:12,
        color:'#dcdcdc',
    },
    selectSingle:{
        flexDirection:'row',
        justifyContent:'flex-start',
        alignItems:'center'
    },
    selectBox:{
        flexDirection:'row',
        overflow:'hidden',
        alignItems:'center',
        height:60
    },
    questionsText:{
        fontSize:16,
        color:'#404040'
    },
    aroundText:{
        fontSize:14,
        color:'#fff'
    },
    around:{
        width:24,
        height:24,
        backgroundColor:'rgb(0,117,248)',
        justifyContent:"center",
        alignItems:'center',
        borderRadius:25,
        position:'relative',
        zIndex:20
    },
    rows:{
        flexDirection:'row'
    },
    cellLeft:{
        position:'relative',
        width:24,
    },
    cellRight:{
        flex:1,
        paddingHorizontal:15
    },
    fontFamily: {
        fontFamily: 'PingFangSC-Medium',
    },
    content:{
        flex:1,
        position:'relative',
        backgroundColor:'#fff'
    },
    body:{
        padding:15,
        position:'relative',
    },
});

class AnswerQuestions extends PureComponent{
    constructor(props){
        super(props);
        this.statusTime = Date.now();
        this.state = {
            currentSelectIndex: 0,
            currentRowsIndex: 0,
            map: new Map()
        };
    }
    componentWillMount() {
        const { loadAnswerQuestions } = this.props;
        loadAnswerQuestions && loadAnswerQuestions();
        this._statusBarSet();
    }
    componentWillUnmount() {
        this._statusBarReduction();
    }
    componentWillReceiveProps(nextProps) {
        if(nextProps.submitAnswer && nextProps.submitAnswer.code === 0 && nextProps.submitAnswer.timeUpdated) {
            if(nextProps.submitAnswer.timeUpdated > this.statusTime){
                this._goBack();
            }
        }
    }
    // 设备状态栏设置
    _statusBarSet(){
        StatusBar.setBarStyle('dark-content',true);
        StatusBar.setBackgroundColor('#FFFFFF',true);
    }
    // 设备状态栏还原
    _statusBarReduction(){
        StatusBar.setBarStyle('light-content',true);
        StatusBar.setBackgroundColor('#A0B4CA',true);
    }
    // 返回 - 方法
    _goBack(){
        const { navigation } = this.props;
        navigation.goBack();
    }
    // 头部 - demo
    renderHeader(){
        return (
            <HeaderBox
                isText={true}
                text={'新手答题奖励'}
                isArrow={true}
                goBack={this._goBack.bind(this)}
            />
        );
    }
    // 渲染 - demo
    renderItem(item, index, data){
        const { map } = this.state;
        const line = index < data.length - 1 ? <View style={[styles.line]}/> : null;
        const questionsSelectArr = Object.entries(JSON.parse(item.content));
        const iconEpisodeDownload = require('../imgs/icon_episode_downloaded.png');

        return (
            <View key={index} style={styles.rows}>
                <View style={[styles.cellLeft]}>
                    <View style={[styles.around,{}]}>
                        <Text style={[styles.fontFamily,styles.aroundText]}>{ index + 1 }</Text>
                    </View>
                    { line }
                </View>
                <View style={[styles.cellRight]}>
                    <View style={styles.questions}>
                        <Text style={[styles.fontFamily,styles.questionsText]}>{ item.title } ？</Text>
                    </View>
                    <View style={styles.selectBox}>
                        {
                            questionsSelectArr.map((obj,i) => {
                                let selectAnswer = map.get(item.id);

                                const around = selectAnswer === obj[0] ?
                                    <Image source={iconEpisodeDownload} resizeMode={'contain'} style={[styles.selectRadioImage]}/> :
                                    <View style={[styles.selectRadio]}/>;

                                return (
                                    i < 3 &&
                                    <TouchableOpacity
                                        activeOpacity={0.5}
                                        key={i}
                                        style={[styles.selectSingle,questionsSelectArr.length === 2 ? {flex:1} : {marginRight:5}]}
                                        onPress={this._select.bind(this,{obj, i},item.id)}
                                    >
                                        { around }
                                        <Text numberOfLines={1} style={[styles.fontFamily,styles.selectText]}>{ obj[1] }</Text>
                                    </TouchableOpacity>
                                );
                            })
                        }
                    </View>
                </View>
            </View>
        );
    }
    // 身体 - demo
    renderContent(){
        const { answerQuestions } = this.props;
        const data: Array<any> = (answerQuestions && answerQuestions.code === 0 &&  answerQuestions.data) || [];
        const iconQuestions = require('../imgs/default/like.png');

        return (
            data.length !== 0 ?
            <ScrollView showsVerticalScrollIndicator={false} style={{flex:1}}>
                <View style={[styles.body]}>
                    { data.map((item,index) => this.renderItem(item,index,data)) }
                    { this.sumbitBtn() }
                </View>
            </ScrollView> :
            <NoData source={iconQuestions} isText={true} text={'暂无答题相关内容'}/>
        );
    }
    sumbitBtn(){
        return(
            <View style={{alignItems:'center',marginTop:15,marginBottom:35}}>
                <TouchableOpacity
                    style={styles.tjBtn}
                    onPress={()=> this._sumbit()}
                >
                    <Text style={{color:'#fff',fontSize:16}}>提交答案</Text>
                </TouchableOpacity>
            </View>
        );
    }
    //提交答案
    _sumbit(){
        const { map } = this.state;
        const { answerQuestions } = this.props;
        const data: Array<any> = (answerQuestions && answerQuestions.code === 0 &&  answerQuestions.data) || [];

        for(let i in data){
            let index = parseInt(i)+1;
            let item = data[i];
            if(map.has(item.id)){
                let answer = map.get(item.id);
                if(answer !== item.answer){
                    Toast.show('第 '+index+' 题答案选择错误,请重选',{ duration: 2000, position: -55 });
                    return;
                }
            }else{
                Toast.show('第 '+index+' 题没有选择答案', { duration: 2000, position: -55 });
                return;
            }

        }

        let obj = Object.create(null);

        for (let [k,v] of map) {
            obj[k] = v;
        }

        //全部选对
        const { sumbitAnswer } = this.props;
        sumbitAnswer && sumbitAnswer(JSON.stringify(obj));
    }
    // 选择题
    _select({obj, i},index){
        let { map } = this.state;

        map.set(index,obj[0]);
        this.setState({map: map});
        this.setState({currentSelectIndex: i, currentRowsIndex: index});
    }
    render(){
        return (
            <View style={styles.content}>
                { this.renderHeader() }
                { this.renderContent() }
            </View>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    let data = state.getIn(['task']);

    if (Immutable.Map.isMap(data)) {
        data = data.toJS();
    }

    return { ...ownProps, ...data };
};

export default connect(mapStateToProps,{loadAnswerQuestions,sumbitAnswer})(AnswerQuestions);






























