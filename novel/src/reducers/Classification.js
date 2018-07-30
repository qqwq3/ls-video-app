
'use strict';

import Immutable from 'immutable';
import { Action } from "../container/Types";
import { RefreshState, safeError } from "../common/Tool";

const initialState = Immutable.fromJS({});

const classification = (state = initialState, action: Action) => {
    // 请求成功统一处理
    if(action.type.includes('_CATEGORY')){
        state = Immutable.fromJS(state.toJS());
        // 移除上一次请求的错误提示
        //let errorKey = ['error'];
        let errorKey = action.params.stateKeys.concat(['error']);
        // 删除错误
        if (state.hasIn(errorKey)) {
            state = state.deleteIn(errorKey);
        }

        switch (action.type) {
            // 分类首页 - 成功
            case 'LOAD_CATEGORY_MENU_SUCCESS':
                return state.setIn(action.params.stateKeys, {
                    timeUpdated:Date.now(),
                    ...action.response.data,
                });

            // 分类二级 - 刷新 - 成功
            case 'RELOAD_CATEGORY_LIST_SUCCESS':
                return state.setIn(action.params.stateKeys,{
                    updateTime: Date.now(),
                    refreshState: RefreshState.Idle,
                    ...action.params,
                    ...action.response.data,
                });

            //  分类二级 - 加载 - 成功
            case 'LOAD_CATEGORY_LIST_SUCCESS':
                return state.updateIn(action.params.stateKeys, m => {
                    if (typeof m === 'undefined' || !m.has('records')) {
                        return {
                            ...action.response.data,
                            updateTime: Date.now(),
                            refreshState: RefreshState.Idle,
                            ...action.params,
                        };
                    }

                    let records = m.get('records').concat(action.response.data.records);

                    return {
                        updateTime: Date.now(),
                        refreshState: RefreshState.Idle,
                        ...action.params,
                        ...action.response.data,
                        records: records.toJS(),
                    };
                });

            // 搜索 - 刷新 - 成功
            case 'RELOAD_CATEGORY_SEARCH_LIST_SUCCESS':
                return state.setIn(action.params.stateKeys,{
                    updateTime: Date.now(),
                    refreshState: RefreshState.Idle,
                    ...action.params,
                    ...action.response.data,
                });

            //  搜索 - 加载 - 成功
            case 'LOAD_CATEGORY_SEARCH_LIST_SUCCESS':
                return state.updateIn(action.params.stateKeys, m => {
                    if (typeof m === 'undefined' || !m.has('records')) {
                        return {
                            ...action.response.data,
                            updateTime: Date.now(),
                            refreshState: RefreshState.Idle,
                            ...action.params,
                        };
                    }

                    let records = m.get('records').concat(action.response.data.records);

                    return {
                        updateTime: Date.now(),
                        refreshState: RefreshState.Idle,
                        ...action.params,
                        ...action.response.data,
                        records: records.toJS(),
                    };
                });
        }

        // 列表类单独的处理
        if (action.type.endsWith('_REQUEST') || action.type.endsWith('_FAILURE')) {
            let command = action.type.split('_').splice(-1)[0];
            let stateKeys = action.params.stateKeys.concat(['error']);

            switch (command) {
                case 'FAILURE':
                    let rs = RefreshState.Failure;
                    let error = safeError(action.error);
                    if (error.code === 404) {
                        rs = action.type.startsWith('RELOAD_') ? RefreshState.NoMoreDataHeader : RefreshState.NoMoreDataFooter;
                    }
                    return state.mergeDeepIn(stateKeys, {
                        refreshState: rs,
                        ...error,
                    });
                case 'REQUEST':
                    if(action.type.startsWith('RELOAD_')) {
                        return state.setIn(action.params.stateKeys.concat(['refreshState']), RefreshState.HeaderRefreshing);
                    }
                    else if (action.type.startsWith('LOAD_')) {
                        return state.setIn(action.params.stateKeys.concat(['refreshState']), RefreshState.FooterRefreshing);
                    }
            }
        }
    }

    return state;
};

export default classification;



















