
import React,{ Component } from 'react';
import {
    View,
    Text,
    ActivityIndicator,
    StyleSheet,
    ViewPropTypes,
} from 'react-native';
import PropTypes from 'prop-types';

class FooterLoadActivityIndicator extends Component<{}>{
    static propTypes = {
        animating: PropTypes.bool,
        size: PropTypes.string,
        color: PropTypes.string,
        style: (ViewPropTypes || View.propTypes).style,
        loadText: PropTypes.string,
        type: PropTypes.string,
    };
    static defaultProps = {
        animating: true,
        size: 'small',
        color: 'rgb(0,117,248)',
        style: {height:40,justifyContent:'center',alignItems:'center'},
        loadText: '玩命加载中...',
        type: 'horizontal', // Vertical
    };
    render(){
        return (
            <View style={this.props.type === 'horizontal' ? styles.contentA : styles.contentB}>
                <ActivityIndicator
                    animating={this.props.animating}
                    style={this.props.style}
                    size={this.props.size}
                    color={this.props.color}
                />
                <View style={this.props.type === 'horizontal' ? styles.viewTextA : styles.viewTextB}>
                    <Text style={[styles.textStyle,{color: this.props.color}]}>{this.props.loadText}</Text>
                </View>
            </View>
        )
    }
}

export default FooterLoadActivityIndicator;

const styles = StyleSheet.create({
    contentA: {
        flexDirection:'row',
        justifyContent:'center',
        height: 50,
        alignItems:'center'
    },
    contentB: {
        paddingTop: 6,
    },
    viewTextA:{
        height: 40,
        justifyContent:'center',
        alignItems:'center',
        marginLeft: 8
    },
    viewTextB: {
        justifyContent:'center',
        alignItems:'center'
    },
    textStyle: {
        fontSize: 14,
    }
});

























