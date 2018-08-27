
'use strict';

import { USER_SESSION, SEX } from "./Keys";

/*-----公共方法 - 保存 - 读取 - 删除-----*/

// 保存
export const commonSave = async (ID: string, Value: any) => {
    try {
        return await storage.save({key: ID, data: Value});
    }
    catch (err) {
        return null;
    }
};

// 读取
export const commonLoad = async (ID: string) => {
    try{
        return await storage.load({key: ID});
    }
    catch (err) {
        return null;
    }
};

// 删除
export const commonRemove = async (ID: string) => {
    try {
        return await storage.remove({key: ID});
    }
    catch (err) {
        return null;
    }
};


/*-----公共方法 - 保存 - 读取 - 删除-----*/ /*--- 包含id ---*/

// 保存
export const fineCommonSave = async (key: string, id: string, data: any) => {
    try {
        return await storage.save({key: key, id: id, data: data});
    }
    catch (err) {
        return null;
    }
}

// 读取
export const fineCommonLoad = async (key: string, id: string) => {
    try {
        return await storage.load({key: key, id: id});
    }
    catch (err) {
        return null;
    }
};

// 删除所有
export const fineCommonRemove = async (key: string) => {
    try {
        return await storage.clearMapForKey(key);
    }
    catch (err) {
        return null;
    }
};

// 删除单个
export const fineCommonRemoveSingle = async (key: string, id: string | number) => {
    try {
        return await storage.remove({key: key, id: id});
    }
    catch (err) {
        return null;
    }
};


/**
 * 读取用户会话
 * @returns {Promise.<{authorizedKey: boolean, email: boolean, id: number, name: boolean}>}
 */
export const loadUserSession = async () => {
    try {
        return await storage.load({ key: USER_SESSION });
    }
    catch (err) {
        return {
            authorizedKey: false,
            id: 0,
            name: null,
            hashId: null,
            avatar: null,
        };
    }
};

/**
 * 保存用户会话
 * @param userSession
 * @returns {Promise.<Object>}
 */
export const saveUserSession = async (userSession: object) => {
    return await storage.save({key: USER_SESSION, data: userSession});
};

/**
 * 移除用户会话
 * @returns {Promise.<*>}
 */
export const removeUserSession = async () => {
    return await storage.remove({key: USER_SESSION});
};

/**
 * 保存用户选择男女的状态
 */
export const saveMaleOrFemaleStatus = async (sexData: Object) => {
    return await  storage.save({key: SEX, data: sexData});
}

