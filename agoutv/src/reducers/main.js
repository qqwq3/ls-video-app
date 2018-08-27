'use strict';

import type {Action} from "../actions/types";
import { RefreshState } from "../Constants";
import Immutable from 'immutable';

const initialState = Immutable.fromJS({
    // home: {
    //     banners:{},
    //     hots:{}
    // },
});

const homepage = (state = initialState, action: Action) => {
    if (action.type.indexOf('_BANNERS') > 0) {
        state = Immutable.fromJS(state.toJS());
        // 移除上一次请求的错误提示
        let errorKey = action.params.stateKeys.concat(['error']);
        // 删除错误
        if (state.hasIn(errorKey)) {
            state = state.deleteIn(errorKey);
        }

        switch (action.type) {
            case 'LOAD_BANNERS_SUCCESS':
                return state.updateIn(action.params.stateKeys, m => {
                    return {
                        ...m.toJS(),
                        ...action.response.data,
                        updateTime: Date.now(),
                        refreshState: RefreshState.Idle,
                        ...action.params,

                    };
                });
        }
    }

    // 首页活动弹出层状态管理
    if(action.type.indexOf('_STATUS') > 0){
        state = Immutable.fromJS(state.toJS());
        // 移除上一次请求的错误提示
        let errorKey = action.params.stateKeys.concat(['error']);
        // 删除错误
        if (state.hasIn(errorKey)) {
            state.deleteIn(errorKey);
        }

        switch (action.type) {
            case 'LOAD_ACTIVITY_STATUS':
                return state.setIn(action.params.stateKeys, action.params.status);
        }
    }

    if (action.type.indexOf('_HOTS') > 0) {
        state = Immutable.fromJS(state.toJS());
        // 移除上一次请求的错误提示
        let errorKey = action.params.stateKeys.concat(['error']);
        // 删除错误
        if (state.hasIn(errorKey)) {
            state.deleteIn(errorKey);
        }

        switch (action.type) {
            case 'LOAD_HOTS_SUCCESS':
                return state.updateIn(action.params.stateKeys, m => {
                    return {
                        ...m.toJS(),
                        ...action.response.data,
                        updateTime: Date.now(),
                        refreshState: RefreshState.Idle,
                        ...action.params,

                    };
                });
        }
    }

    if (action.type.indexOf('_NAVS') > 0) {
        state = Immutable.fromJS(state.toJS());
        // 移除上一次请求的错误提示
        let errorKey = action.params.stateKeys.concat(['error']);
        // 删除错误
        if (state.hasIn(errorKey)) {
            state.deleteIn(errorKey);
        }

        switch (action.type) {
            case 'LOAD_NAVS_SUCCESS':
                return state.updateIn(action.params.stateKeys, m => {
                    return {
                        ...m.toJS(),
                        ...action.response.data,
                        updateTime: Date.now(),
                        refreshState: RefreshState.Idle,
                        ...action.params,

                    };
                });
        }
    }

    if (action.type.endsWith('_REQUEST') || action.type.endsWith('_FAILURE')) {
        let stateKeys = action.params.stateKeys.concat(['refreshState']);
        let command = action.type.split('_').splice(-1)[0];
        switch (command) {
            case 'FAILURE':
                let rs = RefreshState.Failure;
                if (action.error.code === 404) {
                    rs = action.type.startsWith('RELOAD_') ? RefreshState.NoMoreDataHeader : RefreshState.NoMoreDataFooter;
                }
                return state.setIn(stateKeys, rs);
            case 'REQUEST':
                return state.setIn(stateKeys
                    , action.type.startsWith('RELOAD_') ? RefreshState.HeaderRefreshing : RefreshState.FooterRefreshing);
        }
    }

    return state;
};

module.exports = homepage;