
'use strict';

import Immutable from 'immutable';
import { Action } from "../container/Types";
import { RefreshState, safeError } from "../common/Tool";

const initialState = Immutable.fromJS({

});

const details = (state = initialState, action: Action) => {
    // 请求成功统一处理
    if(action.type.includes('_DETAILS')){
        state = Immutable.fromJS(state.toJS());
        // 移除上一次请求的错误提示
        let errorKey = action.params.stateKeys.concat(['error']);

        // 删除错误
        if (state.hasIn(errorKey)) {
            state = state.deleteIn(errorKey);
        }

        switch (action.type) {
            // 加载书详情 - 成功
            case 'LOAD_DETAILS_SUCCESS':
                return state.setIn(action.params.stateKeys, {
                    timeUpdated: Date.now(),
                    ...action.response
                });

            // 猜你喜欢 - 成功
            case 'LOAD_DETAILS_SIMILAR_SUCCESS':
                return state.setIn(action.params.stateKeys, {
                    timeUpdated: Date.now(),
                    ...action.response.data
                });

            // 评论 - 刷新数据 - 成功
            case 'RELOAD_DETAILS_COMMENTS_BOOK_SUCCESS':
                return state.setIn(action.params.stateKeys,{
                    updateTime: Date.now(),
                    refreshState: RefreshState.Idle,
                    ...action.response.data,
                    ...action.params,
                });

            //  评论 - 加载 - 成功
            case 'LOAD_DETAILS_COMMENTS_BOOK_SUCCESS':
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
                        ...action.response.data,
                        ...action.params,
                        records: records.toJS(),
                    };
                });

            // 评论 - 点赞 - 成功
            case 'BOOK_DETAILS_COMMENTS_LIKE_SUCCESS':
                return state.setIn(action.params.stateKeys,{
                    ...action.response,
                    likeTimeUpdated: Date.now()
                });

            // 加入书架 - 成功
            case 'BOOK_DETAILS_ADD_BOOKSHELF_SUCCESS':
                return state.setIn(action.params.stateKeys,{
                    ...action.response,
                    addBookshelfTimeUpdated: Date.now()
                });

            // 取消加入书架 - 成功
            case 'BOOK_DETAILS_CANCEL_ADD_BOOKSHELF_SUCCESS':
                return state.setIn(action.params.stateKeys,{
                    ...action.response,
                    updateTime: Date.now(),
                    status: true,
                });

            // 检测是否加入书架 - 成功
            case 'BOOK_DETAILS_CHECK_IS_ADD_BOOKSHELF_SUCCESS':
                return state.setIn(action.params.stateKeys,{
                    ...action.response,
                    updateTime: Date.now(),
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

export default details;




