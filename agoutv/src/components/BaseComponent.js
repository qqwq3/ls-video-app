'use strict';

import React from 'react';
import { NavigationActions } from 'react-navigation';
import Toast from 'react-native-root-toast';

export default class BaseComponent extends React.Component {
    componentWillReceiveProps(nextProps) {
        let curData = this.getData(this.props);
        let nextData = this.getData(nextProps);

        console.log('BaseComponent',nextProps);

        if (!curData || !nextData) {
            return;
        }

        let showError = false;

        if (nextData.error && curData.error) {
            if (nextData.error.id !== curData.error.id) {
                showError = true;
            }
        } else if (nextData.error) {
            showError = true;
        }

        //if (showError && this.ignoreErrorCodes().indexOf(nextData.error.code) === -1) {
            // 是否跳转到登录
            // if (parseInt(nextData.error.code) === 401) {
            //     // 显示错误
            //     Toast.show("登录超时,请重新登录",{ duration: 2000 });
            //     if(this.isRedirect401()) {
            //         return this.logIn();
            //     }
            // }
            // else{
            //     Toast.show(nextData.error.message,{ duration: 2000 });
            // }
        //}
    }
    isAuthorized() {
        return this.props.user && this.props.user.authorizedKey;
    }
    /***
     * 遇到401时，是否重定向到登录页
     * @returns {boolean}
     */
    isRedirect401() {
        return false;
    }
    ignoreErrorCodes() {
        return [];
    }
    getData(props) {
        return props;
    }
    logIn = () => {
        this.props.navigation && this.props.navigation.navigate('Login');
    };
    backNavigate = (routeName: string, params: Object = undefined) => {
        this.props.navigation && this.props.navigation.dispatch({
            type: 'BACK',
            params: {
                forwardTo: {
                    routeName: routeName,
                    params: params,
                },
            }
        });
    };
    resetNavigate = (routeName: string, params: Object = undefined) => {
        this.props.navigation && this.props.navigation.dispatch(NavigationActions.reset({
            index: 0,
            actions: [
                NavigationActions.navigate({ routeName, params, }),
            ],
        }));
    };
    setParamsAction = (key: string = '', params: Object = {}) => {
        this.props.navigation && this.props.navigation.dispatch(NavigationActions.setParams({
            key: key,
            params: params,
        }));
    };
}