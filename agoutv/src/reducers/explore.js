'use strict';

import type {Action} from "../actions/types";
import { RefreshState } from "../Constants";
import Immutable from 'immutable';

const initialState = Immutable.fromJS({

});


const explorePage = (state = initialState, action: Action) => {
    if (action.type.indexOf('_EXPLORE') > 0) {
        state = Immutable.fromJS(state.toJS());
        // 移除上一次请求的错误提示
        let errorKey = action.params.stateKeys.concat(['error']);

        // 删除错误
        if (state.hasIn(errorKey)) {
            state = state.deleteIn(errorKey);
        }

        switch (action.type) {
            case 'RELOAD_EXPLORE_WITH_FILTER_SUCCESS':
                return state.updateIn(action.params.stateKeys, m => {
                    return {
                        ...action.response.data,
                        updateTime: Date.now(),
                        refreshState: RefreshState.Idle,
                        ...action.params,
                    };
                });

            case 'LOAD_EXPLORE_WITH_FILTER_SUCCESS':
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
                        ...action.response.data,
                        updateTime: Date.now(),
                        refreshState: RefreshState.Idle,
                        records: records.toJS(),
                        ...action.params,
                    };
                });

            case 'SHOW_EXPLORE_FILTERS_PANEL':
                let filterShow = !action.params.filterShow;
                return state.mergeDeepIn(action.params.stateKeys, {
                    filterShow: filterShow,
                    updateTime: Date.now(),
                });

            case 'LOAD_EXPLORE_CATEGORY_LIST_SUCCESS':
                return state.mergeDeepIn(action.params.stateKeys, {
                    ...action.response.data,
                    refreshState: RefreshState.Idle,
                    updateTime: Date.now(),
                });

            case 'LOAD_EXPLORE_SEARCH_SUCCESS':
                let changeFlag = action.params.changeFlag;
                return state.updateIn(action.params.stateKeys,m => {
                    if (changeFlag || typeof m === 'undefined' || !m.has('records')) {
                        return {
                            ...action.response.data,
                            updateTime: Date.now(),
                            refreshState: RefreshState.Idle,
                            ...action.params,

                        };
                    }

                    let records = m.get('records').concat(action.response.data.records);

                    return {
                        ...action.response.data,
                        updateTime: Date.now(),
                        refreshState: RefreshState.Idle,
                        records: records.toJS(),
                        ...action.params,
                    };
                });

            case 'RELOAD_EXPLORE_SEARCH_SUCCESS':
                return state.updateIn(action.params.stateKeys, m => {
                    return {
                        ...action.response.data,
                        updateTime: Date.now(),
                        refreshState: RefreshState.Idle,
                        ...action.params,
                    };
                });

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
                    return state.setIn(stateKeys, action.type.startsWith('RELOAD_') ? RefreshState.HeaderRefreshing : RefreshState.FooterRefreshing);
            }
        }
    }
    return state;
};

module.exports = explorePage;