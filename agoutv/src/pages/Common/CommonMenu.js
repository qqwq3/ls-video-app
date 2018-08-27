
/*公共的菜单*/

import React,{ PureComponent } from  'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';

class CommonMenu extends PureComponent{
    static propTypes = {
        activeTab: PropTypes.number,
        menuNumber: PropTypes.number,
        tabs: PropTypes.array
    };
    static defaultProps = {
        activeTab: 0,
        menuNumber: 2,
        tabs: [],
        manualControl: false
    };
    constructor(props){
        super(props);
        this.state = {
            currentIndex: 0,
        };
    }
    render(){
        const { tabs, menuNumber, activeTab, manualControl } = this.props;
        const bottomLine = this._line();

        return (
            <View style={styles.tabs}>
                <View style={[styles.taskListBottomLine,{backgroundColor:'rgb(0,117,248)'},bottomLine]}/>
                {tabs.map((text,index) => {
                    let color = '';
                    if(manualControl){
                        color = this.state.currentIndex === index ? "#0072f8" : "#afafc0";
                    }
                    else {
                        color = activeTab === index ? "#0072f8" : "#afafc0";
                    }

                    const rightTwo = index ===  0 ? (<View style={styles.verticalLine}/>) : null;
                    const rightThree = index <= 1 ? (<View style={styles.verticalLine}/>) : null;
                    const rightLine = menuNumber === 2 ? rightTwo : rightThree;

                    return (
                        <TouchableOpacity
                            activeOpacity={1}
                            key={index}
                            onPress={() => this._tabSwitch(index)}
                            style={styles.tab}
                        >
                            <View style={[styles.tab]}>
                                <Text style={[{color: color},styles.tabText,styles.fontFamily]}>{ text }</Text>
                            </View>
                            { rightLine }
                        </TouchableOpacity>
                    )
                })}
            </View>
        );
    }
    _line(): Object{
        const { menuNumber, activeTab, manualControl } = this.props;
        const { currentIndex } = this.state;
        const bottomTwo: Object = (manualControl ? currentIndex : activeTab) === 0 ? { left:'25%', marginLeft:-30 } : { right:'25%',marginRight:-30 };
        let bottomThree: Object = {};

        if((manualControl ? currentIndex : activeTab) === 0){
            bottomThree = { left:'16.6666%', marginLeft:-30 };
        }
        else if((manualControl ? currentIndex : activeTab) === 1){
            bottomThree = { left:'49.9999%', marginLeft:-30 };
        }
        else if((manualControl ? currentIndex : activeTab) === 2){
            bottomThree = { right:'16.6666%', marginRight:-30 };
        }

        return menuNumber === 2 ? bottomTwo : bottomThree;
    }
    _setMenuStatus(currentIndex){
        const { manualControl } = this.props;

        if(manualControl){
            this.setState({currentIndex: currentIndex});
        }
    }
    _tabSwitch(index){
        const { goToPage, manualControl } = this.props;

        if(manualControl){
            this.setState({currentIndex: index});
        }

        goToPage && goToPage(index);
    }
}

export default CommonMenu;

const styles = StyleSheet.create({
    verticalLine:{
        height:18,
        width:0.5,
        backgroundColor:'#d0d0d0',
        position:'absolute',
        top:13,
        right:0,
        zIndex:1
    },
    tabs: {
        flexDirection: 'row',
        height: 44,
        position:'relative',
    },
    tab: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 44,
        position:'relative',
    },
    tabText: {
        fontSize: 16,
    },
    fontFamily: {
        fontFamily: 'PingFangSC-Medium',
    },
    taskListBottomLine:{
        height:2.5,
        width:60,
        position:'absolute',
        bottom:5,
        zIndex:10,
    },
});
































