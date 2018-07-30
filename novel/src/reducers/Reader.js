
'use strict';

import Immutable from 'immutable';
import { Action } from "../container/Types";
import { RefreshState, safeError } from "../common/Tool";

const initialState = Immutable.fromJS({});

const reader = (state = initialState, action: Action) => {
    // 请求成功统一处理
    if(action.type.includes('_READER')){
        state = Immutable.fromJS(state.toJS());
        // 移除上一次请求的错误提示
        let errorKey = action.params.stateKeys.concat(['error']);
        // 删除错误
        if (state.hasIn(errorKey)) {
            state = state.deleteIn(errorKey);
        }

        switch (action.type) {
            // 获取章节 - 成功
            case 'GET_READER_CHAPTER_SUCCESS':
                return state.setIn(action.params.stateKeys, {
                    article: {
                        ...action.response.data,
                        content: action.response.data.chapter.content
                    },
                    articleTimeUpdated: Date.now()
                });

            // 章节评论 - 成功
            case 'POST_READER_COMMENTS_SUCCESS':
                return state.setIn(action.params.stateKeys, {
                    comments: {
                        ...action.response,
                    },
                    commentsTimeUpdated: Date.now(),
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
            }
        }
    }

    return state;
};

export default reader;






















