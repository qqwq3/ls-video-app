import React, {Component} from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity } from 'react-native'
import Immutable from 'immutable';
import { connect } from 'react-redux';
import { withNavigationFocus } from 'react-navigation-is-focused-hoc';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { width, statusBarSetPublic } from '../../common/tool';
import { RefreshState, catNav } from "../../Constants";
import TabBarIcon from '../../common/TabBarIcon';
import CommonHeader from '../Common/CommonHeader';
import { reLoadWithFilters, loadCategoryList } from '../../actions/explore';

const BOXHEIGHT = 140;

class Explore extends Component {
    static navigationOptions = {
        tabBarIcon: ({focused}) => (
            <TabBarIcon
                focused={focused}
                defaultIcon={require('../imgs/tab_category_unsel.png')}
                activeIcon={require('../imgs/tab_category_sel.png')}
            />
        ),
        tabBarLabel: '分类',
        header: null
    };
    constructor(props) {
        super(props);
        this.state = {};
    }
    componentWillReceiveProps(nextProps) {
        // 进入本组件的一些处理
        if (!this.props.isFocused && nextProps.isFocused) {
            // 状态栏设置为白底黑字
            this._startBarReduction();
        }
        // 离开本组件的一些处理
        if (this.props.isFocused && !nextProps.isFocused) {

        }
    }
    // 状态栏设置为白底黑字
    _startBarReduction() {
        statusBarSetPublic('rgb(255,255,255)','dark-content',true);
    }
    render(){
        return (
            <View style={styles.content}>
                <CommonHeader {...this.props}/>
                <FlatList
                    data={catNav}
                    renderItem={this._renderItem.bind(this)}
                    numColumns={1}
                    horizontal={false}
                    keyExtractor={(item,index) => index}
                    getItemLayout={(item, index) => ({length: BOXHEIGHT , offset: BOXHEIGHT * index, index})}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                />
            </View>
        );
    }
    // demo渲染
    _renderItem({item,index}){
        return (
            <TouchableOpacity activeOpacity={0.75} onPress={this._InnerIndex.bind(this,item)} key={index} style={styles.box}>
                <View style={styles.boxInner}>
                    <Text style={[styles.boxInnerText,{color:item.textColor}]}>{ item.bigTitle }</Text>
                </View>
                <Image source={item.bgImg} style={styles.ImageLoad}/>
            </TouchableOpacity>
        );
    }
    _InnerIndex(item){
        const { navigate } = this.props.navigation;
        const { reLoadWithFilters, categoryObj } = this.props;
        let id = item.id;
        let name = item.name;
        let navigateFlow = navigate('InnerIndex',{name,id});
        let defaultNavId = categoryObj && categoryObj.genre && categoryObj.genre[id][1].id;
        navigateFlow && reLoadWithFilters && reLoadWithFilters(RefreshState.HeaderRefreshing, {type: id, genre: defaultNavId});
    }
}

const mapStateToProps = (state, ownProps) => {
    let data = state.getIn(['explore', 'root']);
    let TaskData = state.getIn(['task']);

    if(Immutable.Map.isMap(TaskData)){ TaskData = TaskData.toJS() }
    if (Immutable.Map.isMap(data)) { data = data.toJS() }

    return {...ownProps, ...data, ...TaskData };
};

export default withNavigationFocus (connect(mapStateToProps, {loadCategoryList, reLoadWithFilters})(Explore));

// 界面样式
const styles = StyleSheet.create({
    ImageLoad:{
        position: 'absolute',
        left:0,
        top:0,
        bottom:0,
        right:0,
        width: '100%',
        height: verticalScale(140),
    },
    boxInner:{
        position: 'relative',
        zIndex: 100,
        paddingLeft: moderateScale(15)
    },
    boxInnerText:{
        fontSize: 20,
        fontWeight: 'bold'
    },
    box:{
        height: verticalScale(140),
        position: 'relative',
        overflow: 'hidden',
        justifyContent:'center',
        marginBottom: 10
    },
    content:{
        flex: 1,
        backgroundColor: '#FFFFFF'
    },
    qjBox:{
        backgroundColor:'#FFF',
        flexDirection:'row',
        flexWrap:'wrap'
    },
    qjBut:{
        width: width/3,
        justifyContent:'center',
        alignItems:'center',
        paddingTop: moderateScale(40)
    },
    qjButText:{
        fontSize:14,
        color:'rgb(64,64,64)',
        fontWeight:'bold',
        marginTop: moderateScale(4)
    },
    qjImage:{
        width:scale(35),
        height:verticalScale(35)
    }
});