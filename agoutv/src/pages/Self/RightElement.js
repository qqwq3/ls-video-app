
'use strict';

import React,{ PureComponent } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Image,
    TouchableOpacity,
    Alert
} from 'react-native';
import PropTypes from 'prop-types';

class RightElement extends PureComponent<{}>{
    static propTypes = {
        isEdit: PropTypes.bool.isRequired,
        editFunc: PropTypes.func,
        cancelFunc: PropTypes.func,
        editText: PropTypes.string.isRequired,
        cancelText: PropTypes.string.isRequired
    };
    static defaultProps = {
        isEdit: false,
        editText: '编辑',
        cancelText: '取消',
        cancelFunc: () => {},
        editFunc: () => {}
    };
    constructor(props){
        super(props);
        this.state = {
            _isEdit:true
        };
    }
    _editFunc(){
        this.setState({_isEdit: false});
        return this.props.editFunc();
    }
    _cancelFunc(){
        this.setState({_isEdit: true});
        return this.props.cancelFunc();
    }
    render(){
        const {editText, cancelText, isEdit} = this.props;
        //const {_isEdit} = this.state;

        return (
            <TouchableOpacity
                style={styles.rightElemnet}
                accessible={true}
                onPress={() => isEdit ? this._editFunc() : this._cancelFunc()}
                activeOpacity={0.50}
            >
                <Text style={[styles.rightElementText,isEdit ? {color:'rgb(0,118,248)'} : {color:'rgb(0,118,248)'}]}>
                    {isEdit ? editText : cancelText}
                </Text>
            </TouchableOpacity>
        )
    }
}

export default RightElement;

const styles = StyleSheet.create({
    rightElementText:{
        color: 'rgb(0,118,248)',
        fontSize: 14
    },
    rightElemnet:{
        flex:1,
        overflow:'hidden',
        flexDirection:'row',
        justifyContent:'flex-end',
        alignItems:'center',
        paddingRight:15
    },
});












































