
//微信分享工具类
'use strict';

import * as weChat from 'react-native-wechat';
import Toast from 'react-native-root-toast';
import { loadUserSession } from '../common/Storage';

const  wxId = 'wxd79fff9d3b933e8b';

//-------------------------- new  public --------------------------------//

export const commonShare = async (
    type: string,
    channelID:string,
    shareUrl:string,
    agentTag:string,
    title?: string = '小说天堂-全网免费看',
    contentText?: string = '免费看全网书籍，还能赚大钱。强烈推荐！',
    link: string,
) => {
    const shareBody = contentText;
    const shareTitle = title;
    const shareImageUrl: string = 'http://novel-res.oss-cn-hangzhou.aliyuncs.com/icon/180.png';
    // const shareLink: string = shareUrl +`/agoutv/download.html?channelId=${channelID}`;

    const user = await loadUserSession();
    const userId = (user && user.id) || '';
    //http://192.168.188.157:82/share/index.html
    const shareLink: string = link ? link :`${shareUrl}/share/index.html?channelId=${channelID}&agentTag=${agentTag}&user_id=${userId}`;

    shareContent(type,shareTitle,shareBody,shareImageUrl,shareLink);
};


/**
 * 分享链接给朋友 or 朋友圈
 * @param type 分享类型： 'friends' or 'friendsCircle'
 * @param title  题目
 * @param description 描述
 * @param thumbImage  图片地址
 * @param webpageUrl  链接路径
 * @param shareType   分享类型：默认为 news
 */

export const shareContent = (
    type: string,
    title: string,
    description: string,
    thumbImage: string,
    webpageUrl: string,
    shareType: string = 'news'
) => {
    const obj: Object = {
        title: title,
        description: description,
        thumbImage: thumbImage,
        type: shareType,
        webpageUrl: webpageUrl
    };

    weChat.registerApp(wxId);
    weChat.isWXAppInstalled()
    .then((isInstalled) => {
        if (isInstalled) {
            // 分享给朋友
            if(type === 'friends'){
                weChat.shareToSession(obj).catch((error) => {  });
            }
            // 分享到朋友圈
            if(type === 'friendsCircle'){
                weChat.shareToTimeline(obj).catch((error) => {  });
            }
        }
        else {
            Toast.show('没有安装微信软件，请您安装微信之后再试',{duration: 2000, position: -55});
        }
    });
};

// 监听分享
export const shareAddListener = (success: Function => void) => {
    weChat.addListener(
        'SendMessageToWX.Resp',
        (response) => {
            if (parseInt(response.errCode) === 0) {
                success && success();
            }
            else { Toast.show('分享失败，请稍后再次分享哦',{duration: 2000, position: -55}) }
        }
    );
};

// 删除监听 - 分享
export const shareRemoveListener = () => {
    weChat.removeAllListeners();
};

