import React, { Component } from 'react';
import {Text, View, TouchableOpacity, DeviceEventEmitter, ScrollView} from 'react-native'
import { agoraService } from "./agora"
import { AgoraView } from 'react-native-agora'
import RNPermissions, {PERMISSIONS, check} from 'react-native-permissions'

export default class HelloWorldApp extends Component {
  li
  state={
    uid:0,
    uuid: 0
  }
  async componentWillMount() {
    await RNPermissions.request(PERMISSIONS.IOS.CAMERA)
    await RNPermissions.request(PERMISSIONS.IOS.MICROPHONE)
    check(PERMISSIONS.IOS.MICROPHONE).then(res=> {
      console.log('RNPermissions-m',res)
    })
    check(PERMISSIONS.IOS.CAMERA).then(res=> {
      console.log('RNPermissions-c',res)
    })
    this.li = DeviceEventEmitter.addListener('uid', (uid)=>{
      console.log('ppppp', uid)
      this.setState({uid: uid.uid})
    })
    this.li2 = DeviceEventEmitter.addListener('uuid', (uid)=>{
      console.log('ppppp', uid)
      this.setState({uuid: uid.uid})
    })
    agoraService.init()
  }
  componentWillUnmount(){
    this.li.remove()
    agoraService.leaveChannel().then(() => {
      RtcEngine.destroy()
    })
  }
  render() {
    return (
      <ScrollView >
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 200 }}>
          <Text>Hello, world!</Text>
          <View style={{justifyContent: 'flex-start', flexDirection:'row', marginVertical: 20}}>
            <TouchableOpacity style={{width:70, height: 30, marginRight: 20, backgroundColor: 'orange',justifyContent: "center", alignItems: "center"}} onPress={()=> agoraService.joinChannel()}><Text>加入频道</Text></TouchableOpacity>
            <TouchableOpacity style={{width:70, height: 30, backgroundColor: 'yellow', justifyContent: "center", alignItems: "center"}} onPress={()=> agoraService.leaveChannel()}><Text>离开频道</Text></TouchableOpacity>
          </View>
          <View style={{justifyContent: 'space-between', flexDirection: 'row' ,flexWrap: 'wrap'}}>
            <AgoraView style={{width: 100, height: 100}} showLocalVideo={true} mode={1} zOrderMediaOverlay={true}/>
            <AgoraView style={{width: 100, height: 100}}  mode={1} zOrderMediaOverlay={true} remoteUid={this.state.uid}/>
            <AgoraView style={{width: 100, height: 100}}  mode={1} zOrderMediaOverlay={true} remoteUid={this.state.uuid}/>
          </View>
      </View>
      </ScrollView>
    );
  }
}
