
/*我的零钱*/

import React,{ Component } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ImageBackground, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { connect } from 'react-redux';
import Immutable from 'immutable';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import Toast from 'react-native-root-toast';
import { Grid, XAxis, BarChart } from 'react-native-svg-charts';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import * as SVG from 'react-native-svg';
import HeaderBox from '../../common/HeaderBox';
import { pixel, statusBarSetPublic, money, compare, timestampToTime, ArrValueStatus, isLogout } from "../../common/tool";
import CommonMenu from '../Common/CommonMenu';
import { myWallet, goldExchangeMoney } from '../../actions/user';
import { shareContent } from '../../common/wxShare';

class MyWallet extends Component{
    constructor(props){
        super(props);
        this.state = {
            currentType: 0,
            promptStatus: false,
            exchange: false,
            typeTag: 'gold',
            currentMenuIndex: 0,
        };
        this.params = this.props.navigation.state.params || false;
    }
    componentWillMount() {
        const { myWallet } = this.props;

        this._startBarSet();
        this.setState({promptStatus: true});
        myWallet && myWallet();
    }
    componentDidMount() {
        const params = this.params;
        const value = params ? params.value : 0;

        // 跳入指定内容
        this.scrollableTabViewRef && this.scrollableTabViewRef.goToPage(value);
        // 菜单对应的内容切换
        this._onChangeTab(value);
    }
    componentWillReceiveProps(nextProps) {
        const { myWallet } = this.props;

        if(this.state.promptStatus
            && !isLogout(nextProps)
            && nextProps.error
            && nextProps.error.error
        ){
            let message = nextProps.error.error.message;
            Toast.show(message, { duration: 2000, position: -50 });
            this.setState({promptStatus: false});
        }

        // 兑换信息提示
        if(this.state.exchange
            && !isLogout(nextProps)
            && nextProps.userData
            && nextProps.userData.login
            && nextProps.userData.exchange
        ){
            let code = nextProps.userData.exchange.code;

            if(parseInt(code) === 0){
                myWallet && myWallet();
                Toast.show('兑换成功啦，快去提现吧',{ duration: 2000, position: -55 });
            }

            this.setState({exchange: false});
        }
    }
    // 提现
    _withdrawal(){
        const { navigation } = this.props;
        const { quickDay, quickMoney, currentMoney, isNewUser  } = this.params;

        navigation.navigate('Withdrwal',{
            quickDay: quickDay,
            quickMoney: quickMoney,
            currentMoney: currentMoney,
            isNewUser: isNewUser
        });
    }
    // 排行榜
    _incomeRanking(){
        const { navigation } = this.props;
        navigation.navigate('IncomeRanking');
    }
    // 返回
    _goBack(){
        const { navigation } = this.props;
        navigation.goBack();
    }
    // 状态栏设置
    _startBarSet() {
        statusBarSetPublic && statusBarSetPublic('rgb(0,117,248)','light-content',true);
    }
    // 头部 - demo
    renderHeader(){
        return (
            <HeaderBox
                isEdit={true}
                isText={true}
                text={'我的钱包'}
                isArrow={true}
                backgroundColor={'rgb(0,117,248)'}
                borderBottomColor={'rgb(0,117,248)'}
                titleColor={'#FFF'}
                arrowColor={'#FFF'}
                goBack={this._goBack.bind(this)}
                rightElement={
                     <TouchableOpacity activeOpacity={0.5} onPress={this._withdrawal.bind(this)} style={styles.rightBox}>
                         <Text style={styles.rightBoxText}>提现</Text>
                     </TouchableOpacity>
                 }
            />
        );
    }
    // 卡片 - demo
    renderCard(){
        const iconCardBg: number = require('./selfImg/card_base.png');
        const data = this._walletData();
        const currentGold = data ? data.total.gold : 0;
        const currentMoney = data ? money(data.total.money) : 0.00;
        const totalGold = data ? data.total.totalGold : 0;
        const totalMoney = data ? money(data.total.totalMoney) : 0.00;

        return (
            <ImageBackground source={iconCardBg} imageStyle={{resizeMode:'contain'}} style={[styles.card,{top:15}]}>
                <View style={styles.cardHeader}>
                    <View style={[styles.cardInner,{flex:2}]}>
                        <View style={[styles.cardBox]}>
                            <View style={styles.cardBoxTitle}>
                                <Text style={[styles.cardBoxTitleText,styles.fontFamily]}>当前金币</Text>
                            </View>
                            <View style={styles.cardBoxNumber}>
                                <Text numberOfLines={1} style={[styles.cardBoxNumberText,styles.fontFamily]}>{ currentGold }</Text>
                            </View>
                        </View>
                        <View style={[styles.cardBox]}>
                            <View style={styles.cardBoxTitle}>
                                <Text style={[styles.cardBoxTitleText,styles.fontFamily]}>累计金币</Text>
                            </View>
                            <View style={styles.cardBoxNumber}>
                                <Text numberOfLines={1} style={[styles.cardBoxNumberText,styles.fontFamily]}>{ totalGold }</Text>
                            </View>
                        </View>
                    </View>
                    <View style={[styles.cardInner,{flex:0.5,justifyContent:'center',alignItems:'center'}]}>
                        <Image source={require('./selfImg/icon_exchange_arrow.png')} resizeMode={'contain'}/>
                    </View>
                    <View style={[styles.cardInner,{flex:2}]}>
                        <View style={[styles.cardBox]}>
                            <View style={styles.cardBoxTitle}>
                                <Text style={[styles.cardBoxTitleText,styles.fontFamily]}>当前余额（元）</Text>
                            </View>
                            <View style={styles.cardBoxNumber}>
                                <Text style={[styles.cardBoxNumberText,styles.fontFamily,{fontSize:16}]}>￥</Text>
                                <Text numberOfLines={1} style={[styles.cardBoxNumberText,styles.fontFamily]}>{ currentMoney }</Text>
                            </View>
                        </View>
                        <View style={[styles.cardBox]}>
                            <View style={styles.cardBoxTitle}>
                                <Text style={[styles.cardBoxTitleText,styles.fontFamily]}>累计零钱（元）</Text>
                            </View>
                            <View style={styles.cardBoxNumber}>
                                <Text style={[styles.cardBoxNumberText,styles.fontFamily,{fontSize:16}]}>￥</Text>
                                <Text numberOfLines={1} style={[styles.cardBoxNumberText,styles.fontFamily]}>{ totalMoney }</Text>
                            </View>
                        </View>
                    </View>
                </View>
                <View style={[styles.cardFooter]}>
                    <View style={styles.promptView}><Text style={[styles.promptText,styles.fontFamily]}>已金币最大整数倍兑换有效,1000金币 = 1元</Text></View>
                    <TouchableOpacity
                        activeOpacity={0.5}
                        style={styles.exchangeBtn}
                        onPress={this._exchangeGold.bind(this, currentGold)}
                    >
                        <Text style={[styles.exchangeBtnText,styles.fontFamily]}>兑换</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        );
    }
    // 金币兑换零钱
    _exchangeGold(currentGold){
        const { goldExchangeMoney } = this.props;
        const gold: number = Number(currentGold);

        if(gold < 1000){
            return Toast.show('当前金币数大于1000才能兑换',{ duration: 3000, position: -55 });
        }

        goldExchangeMoney && goldExchangeMoney(gold);
        this.setState({promptStatus: true, exchange: true});
    }
    // 渐变 - demo
    renderLinearGradient(){
        return (<LinearGradient colors={['rgb(0,117,248)', '#5CA7FF']} style={styles.selfHeader}/>);
    }
    // 按钮组 - demo
    renderGroupButton(){
        const iconIncomeTrophy = require('./selfImg/icon_income_trophy.png');

        return (
            <View style={[styles.buttonGroup,{paddingVertical:20}]}>
                <View style={[styles.buttonBox]}>
                    <TouchableOpacity
                        activeOpacity={0.50}
                        style={[styles.btn,styles.blueBorder,{flexDirection:'row'}]}
                        onPress={this._incomeRanking.bind(this)}
                    >
                        <Image source={iconIncomeTrophy} resizeMode={'contain'} style={styles.iconTrophy}/>
                        <Text style={[styles.btnChar,styles.fontFamily,{color:'rgb(0,117,248)'}]}>收入榜</Text>
                    </TouchableOpacity>
                </View>
                {/*<View style={[styles.buttonBox]}>*/}
                    {/*<TouchableOpacity onPress={this._baskIncome.bind(this)} activeOpacity={0.50} style={[styles.btn,styles.blueBorder,{backgroundColor:'rgb(0,117,248)'}]}>*/}
                        {/*<Text style={[styles.btnChar,styles.fontFamily,{color:'#ffffff'}]}>晒收入</Text>*/}
                    {/*</TouchableOpacity>*/}
                {/*</View>*/}
            </View>
        );
    }
    // 我的钱包 - data
    _walletData(){
        const { userData } = this.props;

        const data = userData
            && userData.login
            && userData.wallet
            && parseInt(userData.wallet.code) === 0
            && userData.wallet.data;

        return data;
    }
    // 晒收入 - function
    _baskIncome(){
        const { userData } = this.props;
        const data = this._walletData();
        const totalMoney = data ? money(data.total.totalMoney) : 0.00;
        const inviteCode = (userData && userData.login && userData.inviteCode) || '0';
        const shareBody: string = '超视TV，聚合全网优质资源，一站看遍所有VIP视频。你想要的，这里全有，全免费！';
        const shareTitle: string = `朋友们，我在这里看视频赚了${totalMoney}元现金，快来看视频领现金吧`;
        const shareImageUrl: string = 'http://download.xiyunkai.cn/icon/chaoshiicon.png';
        const channelID = (global.launchSettings && global.launchSettings.channelID) || 'nice01';
        const shareLink: string = `http://www.xiyunkai.cn/agoutv/invite.html?channelId=${channelID}&code=${inviteCode}`;

        shareContent && shareContent('friends',shareTitle,shareBody,shareImageUrl,shareLink);
    }
    // 无收益提示
    renderNoYieldPrompt(text: string){
        const iconTakeCashMoney = require('./selfImg/default_no_income.png');
        const styleObj = { justifyContent: 'center', alignItems: 'center', flexDirection: 'column' };

        return (
            <View style={[styles.rows,styleObj,{marginBottom: 30}]}>
                <Image source={iconTakeCashMoney} resizeMode={'contain'} style={{width:44}}/>
                <Text style={[styles.fontFamily,styles.syText]}>
                    { text }
                </Text>
            </View>
        );
    }
    // 内容 - demo
    renderContent(){
        const data = this._walletData();
        const recodes = data ? data.recodes : [];

        return (
            <View style={[styles.body,{paddingTop: moderateScale(70)}]}>
                { this.renderChart()}
                {
                    recodes.length === 0 ? this.renderNoYieldPrompt('近7天还没有任何收益，去赚钱吧') :
                    recodes.map((item, index) => {
                        return (
                            item.typeTag === this.state.typeTag ?
                            <View key={index} style={styles.rows}>
                                <View style={[styles.innerRows,styles.bottomBorder]}>
                                    <View style={[styles.pbRows]}>
                                        <Text style={[styles.pbTitle,styles.fontFamily]}>{ item.text }</Text>
                                    </View>
                                    <View style={[styles.pbRows,{alignItems:'flex-end'}]}>
                                        <Text style={[styles.fontFamily,styles.yjb]}>
                                            { item.typeTag === 'gold' ? `${Number(item.gold) < 0 ? '' : '+'}${item.gold}金币` : `+${money(item.money)}元` }
                                        </Text>
                                        <Text style={[styles.fontFamily,styles.yjbT,{marginTop:5}]}>{ timestampToTime(item.createdTime,true) }</Text>
                                    </View>
                                </View>
                            </View> : null
                        );
                    })
                }
                <View style={styles.rowsCs}>
                    <Text style={[styles.fontFamily,styles.yjbT]}>*系统只保留最近3天的收入明细</Text>
                </View>
                { this.renderGroupButton() }
            </View>
        );
    }
    // 暂无收益 - demo
    renderNoProfit(label: string, content?: string): Node{
        const defaultData = require('./selfImg/default_data.png');

        return (
            <View tabLabel={label} style={styles.noProfit}>
                <Image source={defaultData} resizeMode={'contain'} style={{marginBottom:10}}/>
                <Text style={[styles.fontFamily,styles.noProfitText]}>{ content }</Text>
            </View>
        );
    }
    // 图表 - demo
    renderChart(){
        const data = this._walletData();
        const goldObj = data ? data.gold : [];
        const goldArrKeys = Object.keys(goldObj);
        const goldArrValues = Object.values(goldObj);
        const moneyObj = data ? data.money : [];
        const moneyArrKeys = Object.keys(moneyObj);
        const moneyArrValues = Object.values(moneyObj);
        const params = this.params;
        const value = params ? params.value : 0;
        let moneyArrValuesDeal = [];

        moneyArrValues.map((item,index) => moneyArrValuesDeal.push(Number(money(item))));

        const StatusGoldArrValues = ArrValueStatus(goldArrValues);
        const StatusMoneyArrValuesDeal = ArrValueStatus(moneyArrValuesDeal);

        return (
            <View style={[styles.chartsContent,{height:240}]}>
                <ScrollableTabView
                    renderTabBar={this.renderTabBar.bind(this)}
                    initialPage={value}
                    tabBarInactiveTextColor={'#4c4c4c'}
                    tabBarActiveTextColor={'#f3916b'}
                    tabBarBackgroundColor={'#ffffff'}
                    locked={true}
                    scrollWithoutAnimation={false}
                    prerenderingSiblingsNumber={3}
                    ref={ref => this.scrollableTabViewRef = ref}
                    onChangeTab={this._onChangeTab.bind(this)}
                >
                    {
                        (goldArrValues.length !== 0 && goldArrValues.length <= 7 && StatusGoldArrValues) ?
                        this.renderChartContent(
                            goldArrValues.sort(compare),
                            '我的金币',
                            5,
                            (value,index) => (goldArrKeys.sort(compare))[index]
                        ) :
                        this.renderNoProfit('我的金币','最近7天暂无收益')
                    }
                    {
                        (moneyArrValuesDeal.length !== 0 && moneyArrValuesDeal.length <= 7 && StatusMoneyArrValuesDeal) ?
                        this.renderChartContent(
                            moneyArrValuesDeal.sort(compare),
                            '我的零钱',
                            0.5,
                            (value,index) => (moneyArrKeys.sort(compare))[index]
                        ) :
                        this.renderNoProfit('我的零钱','最近7天暂无收益')
                    }
                </ScrollableTabView>
            </View>
        );
    }
    // 图标内容 - demo
    renderChartContent(data: Array<any>, tabLabel: string, cutOff: number, formatLabel: Function){
        const axesSvg = { fontSize: 10, fill: '#999' };
        const CUT_OFF = cutOff;
        const Labels = ({ x, y, bandwidth, data }) => (
            data.map((value, index) => (
                <SVG.Text
                    key={ index }
                    x={ x(index) + (bandwidth / 2) }
                    y={ value < CUT_OFF ? y(value) - 10 : y(value) + 15 }
                    fontSize={12}
                    fill={ value >= CUT_OFF ? 'white' : 'rgba(0,117,248,0.8)' }
                    alignmentBaseline={ 'middle' }
                    textAnchor={ 'middle' }
                >
                    {value}
                </SVG.Text>
            ))
        );

        return (
            data.length !== 0 ?
            <View tabLabel={tabLabel} style={[styles.chartView]}>
                <BarChart
                    style={{flex: 1}}
                    data={data}
                    svg={{fill: 'rgba(0,117,248,0.8)'}}
                    contentInset={{ top: 10, bottom: 10}}
                    spacing={0.2}
                    gridMin={0}
                    animated={true}
                    animationDuration={600}
                >
                    <Labels/>
                    <Grid direction={Grid.Direction.HORIZONTAL}/>
                </BarChart>
                <XAxis
                    style={{height: 30,marginHorizontal:0}}
                    data={data}
                    formatLabel={(value, index) => formatLabel && formatLabel(value, index)}
                    contentInset={{ left: 29, right: 29}}
                    svg={axesSvg}
                />
            </View> : null
        );
    }
    // 切换的菜单 - demo
    renderTabBar(){
        const params = this.params;
        const value = params ? params.value : 0;

        return (
            <CommonMenu
                activeTab={value}
                menuNumber={2}
            />
        );
    }
    // 菜单索引监听
    _onChangeTab(event){
        // 金币
        if(parseInt(event.i) === 0){
            this.setState({typeTag: 'gold'});
        }

        // 零钱
        if(parseInt(event.i) === 1){
            this.setState({typeTag: 'money'});
        }
    }
    // 身体 - demo
    renderBody(){
        return (
            <ScrollView
                style={styles.scrollBox}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
            >
                { this.renderLinearGradient() }
                { this.renderCard() }
                { this.renderContent() }
            </ScrollView>
        );
    }
    render(){
        return (
            <View style={styles.content}>
                { this.renderHeader() }
                { this.renderBody() }
            </View>
        );
    }
}

const styles = StyleSheet.create({
    noProfit:{
        flex:1,
        justifyContent:'center',
        alignItems:'center'
    },
    noProfitText:{
        fontSize:18,
        fontWeight:'bold',
        color:'#ccc'
    },
    fontFamily: {
        fontFamily: 'PingFangSC-Medium'
    },
    chartView:{
        flex:1,
        position:'relative',
    },
    scrollBox:{
        flex:1,
        position:'relative'
    },
    iconTrophy:{
        height:16,
        marginRight:6
    },
    yjb:{
        color:'#ffb33e',
        fontSize:14
    },
    syText:{
        fontSize:12,
        color:'#d0d0d0',
        marginTop: 10
    },
    blueBorder:{
        borderWidth: 0.5,
        borderColor:'rgb(0,117,248)'
    },
    btn:{
        height:40,
        width: 140,
        borderRadius:40,
        overflow:'hidden',
        justifyContent:'center',
        alignItems:'center'
    },
    btnChar:{
        fontSize:16,
    },
    buttonBox:{
        flex:1,
        justifyContent:'center',
        alignItems:'center'
    },
    yjbT:{
        color:'#afafc0',
        fontSize:12
    },
    pbRows:{
        flex:1,
        paddingVertical:4,
    },
    pbTitle:{
        fontSize:14,
        color:'#404040'
    },
    rows:{
        height:50,
        position:'relative',
        flexDirection:'row'
    },
    rowsCs:{
        position:'relative',
        height:30,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'flex-end',
        paddingRight:10
    },
    innerRows:{
        flex:1,
        marginHorizontal:10,
        flexDirection:'row'
    },
    bottomBorder:{
        borderBottomWidth: 1 / pixel,
        borderBottomColor:'#d0d0d0'
    },
    navBottomBorder:{
        borderBottomWidth:2.5,
        borderBottomColor:'rgb(0,117,248)'
    },
    chartsContent:{
        position:'relative',
        overflow:'hidden'
    },
    buttonGroup:{
        flex:1,
        flexDirection:'row'
    },
    body:{
        flex:1,
        position:'relative',
        overflow:'hidden'
    },
    cartsMenuBtnText:{
        color:'#afafc0',
        fontSize:14,
    },
    cartsMenuBtn:{
        height: 40,
        width:60,
        overflow:'hidden',
        justifyContent:'center',
        alignItems:'center',
        position:'relative'
    },
    cartsMenuBottomLine:{
        position:'absolute',
        bottom:0,
        left:0,
        height:2.5,
        width:60,
        backgroundColor:'rgb(0,117,248)',
        borderRadius:5
    },
    chartsBox:{
        height:50,
        justifyContent:'center'
    },
    chartsMenu:{
        flex:1,
        justifyContent:'center',
        alignItems:'center',
        position:'relative'
    },
    verticalLine:{
        height:26,
        width:0.5,
        backgroundColor:'#d0d0d0',
        position:'absolute',
        top:14,
        right:0,
        zIndex:1
    },
    chartsNav:{
        flexDirection:'row',
        overflow:'hidden',
        alignItems:'center'
    },
    exchangeBtn:{
        width:60,
        height:25,
        borderRadius:25,
        backgroundColor:'rgb(0,117,248)',
        justifyContent:'center',
        alignItems:'center',
        marginRight:15,
        marginTop:6
    },
    promptView:{
        paddingTop:10,
        overflow:'hidden',
        paddingRight:15
    },
    exchangeBtnText:{
        fontSize:12,
        color:'#fff'
    },
    promptText:{
        fontSize:12,
        color:'#fff'
    },
    cardHeader:{
        flex:1,
        flexDirection:'row'
    },
    cardFooter:{
        height:60,
        width:'100%',
        flexDirection:'row',
        justifyContent:'flex-end'
    },
    cardInner:{
        overflow:'hidden',
    },
    cardBox:{
        flex:1,
        justifyContent:'center',
        paddingTop:20
    },
    cardBoxTitle:{
        flexDirection:'row',
        justifyContent:'center'
    },
    cardBoxNumber:{
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center'
    },
    cardBoxNumberText:{
        fontSize:20,
        color:'#fff',
        overflow:'hidden',
        maxWidth:120,
    },
    cardBoxTitleText:{
        fontSize:12,
        color:'#fff'
    },
    card:{
        zIndex:100,
        position:'absolute',
        left:10,
        right:10,
        height: verticalScale(200),
    },
    content:{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        backgroundColor:'#FFFFFF'
    },
    rightBox:{
        width:100,
        height:44,
        justifyContent:'flex-end',
        alignItems:'center',
        position:'absolute',
        top:0,
        right:0,
        zIndex:100,
        flexDirection:'row',
        paddingRight:15
    },
    rightBoxText:{
        color:'#fff',
        fontSize:14,
    },
    selfHeader: {
        height: verticalScale(136),
        backgroundColor: 'rgb(0,117,248)',
        position: "relative"
    },
});

const mapStateToProps = (state, ownProps) => {
    let userData = state.getIn(['user']);

    if (Immutable.Map.isMap(userData)) { userData = userData.toJS() }
    return { ...ownProps, ...userData };
};

export default connect(mapStateToProps,{ myWallet, goldExchangeMoney })(MyWallet);

















