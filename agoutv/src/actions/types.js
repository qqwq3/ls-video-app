'use strict';

import {CALL_API} from "../Constants";

type APIOptions = Object;

// 视频类型
export type VideoType = 'lastest' | 'newIssue' | 'search' | 0 | 1;
// 视频实体
export type Video = {id: number, mark: string, title: string, cover: string, progress: { received: number, total: number }, type: string};

// 所有action
export type Action =
      { type: 'LOAD_VIDEOS', endpoint: string, options: APIOptions, refreshState: number  }
    | { type: 'RELOAD_VIDEOS', endpoint: string, options: APIOptions, refreshState: number }
    | { type: 'LOAD_ACTRESS', endpoint: string, options: APIOptions, refreshState: number }
    ;

export type ThunkAction = { [CALL_API]: Action, params: Object }
export type Dispatch = (action: Action | ThunkAction) => any;
export type GetState = () => Object;