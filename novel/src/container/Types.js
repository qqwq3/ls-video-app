'use strict';

import { CALL_API } from "../common/Keys";

type APIOptions = Object;

// 所有action
export type Action =
      { type: 'LOAD_NOVEL',   endpoint: string, options: APIOptions, refreshState: number }
    | { type: 'RELOAD_NOVEL', endpoint: string, options: APIOptions, refreshState: number }
    | { type: 'LOAD_ACTRESS', endpoint: string, options: APIOptions, refreshState: number };

export type ThunkAction = { [CALL_API]: Action, params: Object }
export type Dispatch = (action: Action | ThunkAction) => any;
export type GetState = () => Object;

