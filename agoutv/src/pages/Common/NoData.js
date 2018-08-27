
'use strict';

import React,{ Component } from 'react';
import {
    StyleSheet,
    Image,
    View,
    Text,
    ViewPropTypes,
    TouchableOpacity
} from 'react-native';
import PropTypes from 'prop-types';

/*<NoData
    source={require('../imgs/history.png')}
    isText={true}
    text={'暂无缓存内容'}
/>*/

class NoData extends Component<{}>{
    static propTypes = {
        source: PropTypes.number.isRequired,
        imageStyle: (ViewPropTypes || View.propTypes).style,
        resizeMode: PropTypes.string.isRequired,
        isText: PropTypes.bool.isRequired,
        text: PropTypes.string.isRequired,
        isBtn: PropTypes.bool,
        btnText: PropTypes.string,
        btnClickFunc: PropTypes.func
    };
    static defaultProps = {
        resizeMode: 'contain',
        isText: false,
        text:'',
        imageStyle: {height:120},
        isBtn: false,
        btnClickFunc: () => {},
        btnText: '立即登录'
    };
    render(){
        const {
            source,imageStyle,
            resizeMode,text,isText,
            btnClickFunc,isBtn,btnText
        } = this.props;

        return (
            <View style={styles.container}>
                <Image source={source} style={imageStyle} resizeMode={resizeMode}/>
                {isText ? <Text style={styles.textStyle}>{text}</Text> : null}
                {
                    isBtn &&
                    (<TouchableOpacity activeOpacity={0.75} onPress={() => btnClickFunc()} style={styles.btn}>
                        <Text style={styles.btnText}>{btnText}</Text>
                    </TouchableOpacity>)
                }
            </View>
        )
    }
}

export default NoData;

const styles = StyleSheet.create({
    btn:{
        height:36,
        width:100,
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:'rgb(0,117,248)',
        borderRadius:20,
        overflow:'hidden',
        marginTop: 20
    },
    btnText:{
        fontSize:15,
        color:'#ffffff'
    },
    container:{
        backgroundColor:'#ffffff',
        justifyContent:'center',
        alignItems:'center',
        flex:1,
        overflow:'hidden'
    },
    textStyle:{
        color:'#cccccc',
        fontSize:18,
        fontWeight:'bold',
        marginTop:25
    }
});































