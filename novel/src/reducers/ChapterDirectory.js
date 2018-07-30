
'use strict';

import Immutable from 'immutable';
import { Action } from "../container/Types";
import { RefreshState, safeError } from "../common/Tool";

const initialState = Immutable.fromJS({});

const chapterDirectory = (state = initialState, action: Action) => {
    // 请求成功统一处理
    if(action.type.includes('_CATALOG')){
        state = Immutable.fromJS(state.toJS());
        // 移除上一次请求的错误提示
        let errorKey = action.params.stateKeys.concat(['error']);
        // 删除错误
        if (state.hasIn(errorKey)) {
            state = state.deleteIn(errorKey);
        }

        switch (action.type) {
            // 目录 - 刷新 - 成功
            case 'RELOAD_CATALOG_DIRECTORY_LIST_SUCCESS':
                return state.updateIn(action.params.stateKeys, m => {
                    return {
                        updateTime: Date.now(),
                        refreshState: RefreshState.Idle,
                        ...action.params,
                        ...action.response.data,
                    };
                });

            // 书签 - 刷新 - 成功
            case 'RELOAD_CATALOG_BOOK_MARK_LIST_SUCCESS':
                return state.updateIn(action.params.stateKeys, m => {
                    return {
                        updateTime: Date.now(),
                        refreshState: RefreshState.Idle,
                        ...action.params,
                        ...action.response.data,
                    };
                });

            //  目录 - 加载 - 成功
            case 'LOAD_CATALOG_DIRECTORY_LIST_SUCCESS':
                return state.updateIn(action.params.stateKeys, m => {
                    if (typeof m === 'undefined' || !m.has('chapters')) {
                        return {
                            updateTime: Date.now(),
                            refreshState: RefreshState.Idle,
                            ...action.params,
                            ...action.response.data,
                        };
                    }

                    let chapters = m.get('chapters').concat(action.response.data.chapters);

                    return {
                        updateTime: Date.now(),
                        refreshState: RefreshState.Idle,
                        ...action.params,
                        ...action.response.data,
                        chapters: chapters.toJS(),
                    };
                });

            //  书签 - 加载 - 成功
            case 'LOAD_CATALOG_BOOK_MARK_LIST_SUCCESS':
                return state.updateIn(action.params.stateKeys, m => {
                    if (typeof m === 'undefined' || !m.has('records')) {
                        return {
                            updateTime: Date.now(),
                            refreshState: RefreshState.Idle,
                            ...action.params,
                            ...action.response.data,
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

            switch (command) {
                case 'FAILURE':
                    let rs = RefreshState.Failure;
                    let error = safeError(action.error);

                    if (error.code === 404) {
                        rs = action.type.startsWith('RELOAD_') ? RefreshState.NoMoreDataHeader : RefreshState.NoMoreDataFooter;
                    }

                    return state.setIn(action.params.stateKeys, {
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

export default chapterDirectory;



















