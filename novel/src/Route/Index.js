
/*路由管理*/

import React, { Component } from 'react';
import { Animated, Easing  } from 'react-native';
import { createStackNavigator, createMaterialTopTabNavigator, NavigationActions } from 'react-navigation';
import { moderateScale } from 'react-native-size-matters';
import My from '../pages/my/Index';
import Comments from '../pages/my/Comments';
import Historical from '../pages/my/Historical';
import OpenVip from '../pages/my/OpenVip';
import Setting from '../pages/my/Setting';
import SignIn from '../pages/my/SignIn';
import Login from '../pages/my/Login';
import Charge from  '../pages/my/Charge';
import Bookshelf from '../pages/bookshelf/Index';
import Classification from '../pages/classification/Index';
import Rankings from '../pages/rankings/Index';
import BookCity from '../pages/bookCity/Index';
import Feedback from '../pages/feedback/Index';
import SearchEngines from '../pages/searchEngines/Index';
import Details from '../pages/details/Index';
import MoreComments from '../pages/details/MoreComments';
import Reader from '../pages/reader/Index';
import Binding from '../pages/agent/binding';
import ApplyAgent from '../pages/agent/applyagent';
import ApplySuccess from '../pages/agent/applySuccess'
import SexSelection from '../pages/SexSelection';
import SecondCate from '../pages/classification/SecondCate';
import ChapterDirectory from '../pages/common/ChapterDirectory';
import ShareBookCurrency from '../pages/agent/ShareBookCurrency';
import AgentHtml from "../pages/my/AgentHtml";
import BookComment from '../pages/reader/BookComment';

const TabRouteConfigs = {
    Bookshelf:      { screen: Bookshelf },
    BookCity:       { screen: BookCity },
    Rankings:       { screen: Rankings },
    Classification: { screen: Classification },
    My:             { screen: My },
};

const TabNavigatorConfigs = {
    // 标签位置
    tabBarPosition: 'bottom',
    // 改变标签时是否进行动画制作
    animationEnabled: true,
    // 后退按钮导致标签切换到初始选项卡
    backBehavior: 'initialRoute',
    lazy: true,
    // 是否允许在标签之间滑动
    swipeEnabled: false,
    // 进入后最开始显示的页面
    initialRouteName: 'Bookshelf',
    // 超出屏幕外的会被移除
    removeClippedSubviews: true,
    tabBarOptions: {
        // 是否显示标签图标
        showIcon: true,
        // 活动选项卡的标签和图标颜色（当前字体颜色）
        activeTintColor: '#f3916b',
        // 非活动选项卡的标签和图标颜色（其他字体颜色）
        inactiveTintColor: '#b2b2b2',
        // 点击后显示的纹波的颜色（仅限Android> = 5.0）
        // pressColor:'#f3916b',
        // 标签的样式对象
        labelStyle: {
            fontSize: moderateScale(10.5),
            fontWeight: 'bold',
            margin: 0,
            padding: 0,
        },
        // 选项卡指示符的样式对象（选项卡底部的行）
        indicatorStyle: {
            backgroundColor: "#fff",
            height: 0,
        },
        style: {
            backgroundColor: '#fff'
        },
    },
};

const Tab = createMaterialTopTabNavigator(TabRouteConfigs, TabNavigatorConfigs);

const StackRouteConfigs = {
    SexSelection:      { screen: SexSelection },
    Tab:               { screen: Tab },
    Feedback:          { screen: Feedback },
    SearchEngines:     { screen: SearchEngines },
    Comments:          { screen: Comments },
    Historical:        { screen: Historical },
    Setting:           { screen: Setting },
    Details:           { screen: Details },
    SignIn:            { screen: SignIn },
    Reader:            { screen: Reader },
    OpenVip:           { screen: OpenVip },
    ApplyAgent:        { screen: ApplyAgent },
    Binding:           { screen: Binding },
    ApplySuccess:      { screen: ApplySuccess },
    Login:             { screen: Login },
    SecondCate:        { screen: SecondCate },
    MoreComments:      { screen: MoreComments },
    Charge:            { screen: Charge },
    ChapterDirectory:  { screen: ChapterDirectory },
    ShareBookCurrency: { screen: ShareBookCurrency },
    AgentHtml:         { screen: AgentHtml },
    BookComment:       { screen: BookComment },
};

const StackNavigatorConfigs = {
    mode: 'modal',
    headerMode: 'none',
    navigationOptions: {
        gesturesEnabled: false
    },
    // 全局 - 页面切换 - 动画配置
    transitionConfig: () => ({
        transitionSpec: {
            duration: 500,
            easing: Easing.out(Easing.poly(4)),
            timing: Animated.timing,
        },
        screenInterpolator: sceneProps => {
            const { layout, position, scene } = sceneProps;
            const { index } = scene;
            const height = layout.initHeight;
            const width = layout.initWidth;

            // 动画 - 从下往上拉
            const translateY = position.interpolate({
                inputRange: [index - 1, index, index + 1],
                outputRange: [height, 0, 0],
            });

            // 动画 - 从右往左拉
            const translateX = position.interpolate({
                inputRange: [index - 1, index, index + 1],
                outputRange: [width , 0 , 0],
            });

            // 动画 - 透明度变化
            const opacity = position.interpolate({
                inputRange: [index - 1, index - 0.99, index],
                outputRange: [0, 1, 1],
            });

            return { opacity, transform: [{ translateX }] };
        },
    }),
    // 页面动画过渡完后执行
    // onTransitionEnd: () => {
        // console.log('页面的动画过渡完了哦');
    // }
};

const Navigator = createStackNavigator(StackRouteConfigs, StackNavigatorConfigs);

// 防止速点
const navigateOnce = (getStateForAction) => (action, state) => {
    const {type, routeName} = action;
    return (
        state &&
        type === NavigationActions.NAVIGATE &&
        routeName === state.routes[state.routes.length - 1].routeName
    ) ? null : getStateForAction(action, state);
};

Navigator.router.getStateForAction = navigateOnce(Navigator.router.getStateForAction);
export default Navigator;



