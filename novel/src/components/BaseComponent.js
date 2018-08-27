'use strict';

import React, { Component } from 'react';
import { NavigationActions } from 'react-navigation';
import { infoToast } from "../common/Tool";
import { removeUserSession } from "../common/Storage";

export default class BaseComponent extends Component {
    constructor(props){
        super(props);
        this.errTime = Date.now();
    }
    componentWillReceiveProps(nextProps) {
        let curData = this.getData(this.props);
        let nextData = this.getData(nextProps);

        if (!curData || !nextData) {
            return;
        }

        let showError = false;
        let nextPropsError = nextData.error;

        if (nextPropsError && curData.error) {
            if (nextPropsError.code !== curData.error.code) {
                showError = true;
            }
        }
        else if (nextPropsError) {
            if(nextPropsError.timeUpdated && nextPropsError.timeUpdated > this.errTime) {
                this.errTime = Date.now();
                showError = true;
            }
        }

        if (showError && this.ignoreErrorCodes().indexOf(nextData.error.code) == -1) {
            if (nextData.error.code === 401) {
                if(this.isRedirect401()) {
                    return this.logIn();
                }

                // 清除用户信息 - 本地
                removeUserSession && removeUserSession();

                // 清除redux相关的缓存
                global.persistStore && global.persistStore.purge();

                return infoToast(nextData.error.message);
            }

            // 显示错误
            infoToast(nextData.error.message);
        }

    }
    isAuthorized() {
        return this.props.authorizedKey;
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
        this.props.navigation && this.props.navigation.navigate('logIn');
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
}
