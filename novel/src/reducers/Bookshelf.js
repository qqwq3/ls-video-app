
'use strict';

import Immutable from 'immutable';
import _ from 'loadsh';
import { Action } from "../container/Types";
import { RefreshState,safeError } from "../common/Tool";

const initialState = Immutable.fromJS({});

const bookshelf = (state = initialState, action: Action) => {
    // 请求成功统一处理
    if(action.type.includes('_BOOKSHELF')){
        state = Immutable.fromJS(state.toJS());
        // 移除上一次请求的错误提示
        let errorKey = action.params.stateKeys.concat(['error']);
        // 删除错误
        if (state.hasIn(errorKey)) {
            state = state.deleteIn(errorKey);
        }

        switch (action.type) {
            // 书架 - 刷新数据 - 成功
            case 'RELOAD_BOOKSHELF_LIST_SUCCESS':
                return state.updateIn(action.params.stateKeys, m => {
                    return {
                        updateTime: Date.now(),
                        refreshState: RefreshState.Idle,
                        ...action.response.data,
                        ...action.params,
                        records: action.response.data.records,
                    };
                });

            //  书架 - 加载 - 成功
            case 'LOAD_BOOKSHELF_LIST_SUCCESS':
                return state.updateIn(action.params.stateKeys, m => {
                    if (typeof m === 'undefined' || !m.has('records')) {
                        return {
                            updateTime: Date.now(),
                            refreshState: RefreshState.Idle,
                            ...action.response.data,
                            ...action.params,
                            records: action.response.data.records,
                        };
                    }

                    let records = m.get('records').concat(action.response.data.records);
                    // let newRecords = _.uniqWith(records.toJS(), _.isEqual);

                    return {
                        updateTime: Date.now(),
                        refreshState: RefreshState.Idle,
                        ...action.response.data,
                        ...action.params,
                        records: records.toJS(),
                    };
                });

            // 单个收藏删除 - 成功
            case 'OPERATE_BOOKSHELF_BOOK_SUCCESS':
                return state.setIn(action.params.stateKeys, {
                    updateTime: Date.now(),
                    ...action.response
                });

            // 批量收藏删除 - 成功
            case 'OPERATE_BOOKSHELF_BATCH_BOOKS_SUCCESS':
                return state.setIn(action.params.stateKeys, {
                    updateTime: Date.now(),
                    ...action.response
                });
        }

        // 列表类单独的处理
        if (action.type.endsWith('_REQUEST') || action.type.endsWith('_FAILURE')) {
            let command = action.type.split('_').splice(-1)[0];
            switch (command) {
                case 'FAILURE':
                    let rs = RefreshState.Failure;
                    let error = safeError(action.error);
                    if (error.code === 404) {
                        rs = action.type.startsWith('RELOAD_') ? RefreshState.NoMoreDataHeader : RefreshState.NoMoreDataFooter;
                    }
                    return state.mergeDeepIn(action.params.stateKeys, {
                        refreshState: rs,
                        error,
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

export default bookshelf;






















