import React from 'react';
import { StackNavigator, TabNavigator, NavigationActions } from 'react-navigation';
import HomePage from '../pages/Home/index';
import ExplorePage from '../pages/Explore/index';
import SubscribePage from '../pages/Subscribe/index';
import SelfPage from '../pages/Self/index';
import CardStackStyleInterpolator from 'react-navigation/src/views/CardStack/CardStackStyleInterpolator';
import MoviePlayScreen from '../pages/Movie/play';
import CollectionPage from '../pages/Self/collection'
import HistoryPage from '../pages/Self/history'
import SpreadPage from '../pages/Self/spread';
import Search from '../pages/Common/Search';
import CacheManagement from '../pages/Self/CacheManagement';
import InnerIndex from '../pages/Explore/InnerIndex';
import FoundIndex from '../pages/found/index';
import Setting from '../pages/Self/Setting';
import FoundDetail from '../pages/found/FoundDetail';
import PlayLocalScreen from '../pages/Movie/localPlay';
import TVCacheFlatList from '../pages/Movie/TVCacheFlatList';
import BindInviteCode from '../pages/Self/setting/BindInviteCode'
import BindPhone from '../pages/Self/setting/BindPhone'
import YouKuPlayer from '../pages/Movie/YouKuPlayer';
import IncomeRanking from '../pages/Self/IncomeRanking';
import TreasureBox from '../pages/Home/TreasureBox';
import Withdrwal from '../pages/Self/Withdrwal';
import MyWallet from '../pages/Self/MyWallet';
import Login from '../pages/Self/Login';
import Sign from '../pages/Self/Sign';
import TaskCenter from '../pages/Task/index';
import LevelPrivileges from '../pages/Task/LevelPrivileges';
import InviteFriends from '../pages/Self/InviteFriends';
import AnswerQuestions from '../pages/Task/AnswerQuestions';

let HomeNav = StackNavigator({
    HomePage: {
        screen: HomePage,
    }
});

let ExploreNav = StackNavigator({
    ExplorePage: {
        screen: ExplorePage,
    },
});

let SubscribeNav = StackNavigator({
    SubscribePage: {
        screen: SubscribePage,
    }
});

let SelfNav = StackNavigator({
    SelfPage: {
        screen: SelfPage,
        gesturesEnabled: false
    },
}, {
    headerMode: 'screen',
});

const MainTab = TabNavigator({
    Home: {
        screen: HomeNav,
    },
    FoundIndex:{
        screen: FoundIndex,
    },
    TaskCenter: {
        screen: TaskCenter,
    },
    Explore: {
        screen: ExploreNav,
    },
    Self: {
        screen: SelfNav,
    },
}, {
    tabBarPosition: 'bottom',
    animationEnabled: true,
    backBehavior: 'initailRoute',
    lazy: true,
    swipeEnabled: false,
    initialRouteName:'Home',
    tabBarOptions: {
        showIcon: true,
        activeTintColor: '#0076F8',
        inactiveTintColor: '#c0c0c0',
        labelStyle: {
            fontSize: 10,
            fontWeight:'bold',
            margin: 0,
            padding: 0,
        },
        indicatorStyle: {
            backgroundColor: "#fff",
            height: 0,
        },
        style: {
            backgroundColor: '#fff'
        },
    },
    // navigationOptions: ({ navigation }) => ({
    //     tabBarOnPress: ({scene, jumpToIndex}) => {
    //         let key = scene.route.key;
    //
    //         if(key === 'FoundIndex'){
    //             navigation.setParams({isFound: true});
    //         }
    //         else{
    //             navigation.setParams({isFound: false});
    //         }
    //         jumpToIndex(scene.index);
    //     }
    // })
});

let MyApp = StackNavigator({
    MainTab: {
        path: 'MainTab',
        screen: MainTab,
        gesturesEnabled: false
    },
    MoviePlayScreen: {
        path: 'MoviePlayScreen',
        screen: MoviePlayScreen,
        gesturesEnabled: false
    },
    PlayLocalScreen: {
        path: 'PlayLocalScreen',
        screen: PlayLocalScreen,
        gesturesEnabled: false
    },
    SpreadPage: {
        path: 'SpreadPage',
        screen: SpreadPage,
        gesturesEnabled: false
    },
    Search: {
        path: 'Search',
        screen: Search,
        gesturesEnabled: false
    },
    CacheManagement: {
        path: 'CacheManagement',
        screen: CacheManagement,
        gesturesEnabled: false
    },
    CollectionPage: {
        path: 'CollectionPage',
        screen: CollectionPage,
        gesturesEnabled: false
    },
    HistoryPage: {
        path: 'HistoryPage',
        screen: HistoryPage,
        gesturesEnabled: false
    },
    InnerIndex:{
        path: 'InnerIndex',
        screen: InnerIndex,
        gesturesEnabled: false
    },
    Subscribe: {
        path: 'Subscribe',
        screen: SubscribePage,
        gesturesEnabled: false
    },
    Setting:{
        path:'Setting',
        screen: Setting,
        gesturesEnabled: false
    },
    FoundDetail:{
        path: 'FoundDetail',
        screen: FoundDetail,
        gesturesEnabled: false
    },
    TVCacheFlatList:{
        path: 'TVCacheFlatList',
        screen: TVCacheFlatList,
        gesturesEnabled: false
    },
    BindPhone:{
        path: 'BindPhone',
        screen: BindPhone,
        gesturesEnabled: false
    },
    YouKuPlayer:{
        path:'YouKuPlayer',
        screen:YouKuPlayer,
        gesturesEnabled: false
    },
    IncomeRanking:{
        path:'IncomeRanking',
        screen:IncomeRanking,
        gesturesEnabled: false
    },
    TreasureBox: {
        path: 'TreasureBox',
        screen: TreasureBox,
        gesturesEnabled: false
    },
    Withdrwal:{
        path:'Withdrwal',
        screen:Withdrwal,
        gesturesEnabled: false
    },
    MyWallet:{
        path:'MyWallet',
        screen:MyWallet,
        gesturesEnabled: false
    },
    Login: {
        path:'Login',
        screen:Login,
        gesturesEnabled: false
    },
    Sign: {
        path:'Sign',
        screen:Sign,
        gesturesEnabled: false
    },
    LevelPrivileges: {
        path:'LevelPrivileges',
        screen: LevelPrivileges,
        gesturesEnabled: false
    },
    InviteFriends: {
        path:'InviteFriends',
        screen:InviteFriends,
        gesturesEnabled: false
    },
    AnswerQuestions:{
        path:'AnswerQuestions',
        screen:AnswerQuestions,
        gesturesEnabled: false
    },
    BindInviteCode:{
        path:'BindInviteCode',
        screen:BindInviteCode,
        gesturesEnabled: false
    }
}, {
    mode: 'card',
    headerMode: 'none',
    transitionConfig: () => ({screenInterpolator: CardStackStyleInterpolator.forHorizontal})
});

// 防止速点
const navigateOnce = (getStateForAction) => (action, state) => {
    const {type, routeName} = action;
    return (
        state &&
        type === NavigationActions.NAVIGATE &&
        routeName === state.routes[state.routes.length - 1].routeName
    ) ? null : getStateForAction(action, state);
};

MyApp.router.getStateForAction = navigateOnce(MyApp.router.getStateForAction);
export default MyApp;