
'use strict';

import Immutable from 'immutable';
import { Action } from "../container/Types";

const initialState = Immutable.fromJS({});

const local = (state = initialState, action: Action) => {
    // 请求成功统一处理
    if(action.type.indexOf('_LOCAL') > 0){
        state = Immutable.fromJS(state.toJS());
        // 移除上一次请求的错误提示
        let errorKey = action.params.stateKeys.concat(['error']);
        // 删除错误
        if (state.hasIn(errorKey)) {
            state = state.deleteIn(errorKey);
        }

        switch (action.type) {
            // 更新书架状态
            case 'UPDATE_BOOKSHELF_LOCAL':
                return state.setIn(action.params.stateKeys, {
                    timeUpdated: Date.now(),
                    status: action.params.status,
                });

            // 更新章节
            case 'UPDATE_CHAPTER_LOCAL':
                return state.setIn(action.params.stateKeys, {
                    chapterChange: {
                        timeUpdated: Date.now(),
                        status: action.params.status,
                    }
                });

            // 更新章节
            case 'UPDATE_VIP_LOCAL':
                return state.setIn(action.params.stateKeys, {
                    vipObj: {
                        timeUpdated: Date.now(),
                        ...action.params.status,
                    }
                });

            // 改变阅读的偏移位置
            case 'CHANGE_READER_POSITION_LOCAL':
                return state.setIn(action.params.stateKeys, {
                    reader: {
                        timeUpdated: Date.now(),
                        value: action.params.value,
                    }
                });

            // 点亮章节标题
            case 'CHAPTER_NAME_LIGHT_LOCAL':
                return state.setIn(action.params.stateKeys, {
                    chapter: {
                        timeUpdated: Date.now(),
                        content: action.params.content,
                        index: action.params.index,
                    }
                });
        }

        // 请求失败统一处理
        if (action.type.endsWith('_FAILURE')) {
            let stateKeys = action.params.stateKeys.concat(['error']);
            let command = action.type.split('_').splice(-1)[0];

            switch (command) {
                case 'FAILURE':
                    return state.setIn(stateKeys,{
                        timeUpdated: Date.now(),
                        ...action.error
                    });
            }
        }
    }

    return state;
};

export default local;













