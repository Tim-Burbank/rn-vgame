import React, { Component } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { agoraService } from "./agora"
import { AgoraView } from 'react-native-agora'
import RNPermissions, {PERMISSIONS} from 'react-native-permissions'

export default class HelloWorldApp extends Component {
  async componentDidMount() {
    await RNPermissions.request(PERMISSIONS.IOS.CAMERA)
    await RNPermissions.request(PERMISSIONS.IOS.MICROPHONE)
    agoraService.joinChannel()
  }
  render() {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Hello, world!</Text>
        <View style={{justifyContent: 'flex-start', flexDirection:'row', marginVertical: 20}}>
          <TouchableOpacity style={{width:70, height: 30, marginRight: 20, backgroundColor: 'orange',justifyContent: "center", alignItems: "center"}} onPress={()=> agoraService.joinChannel()}><Text>加入频道</Text></TouchableOpacity>
          <TouchableOpacity style={{width:70, height: 30, backgroundColor: 'yellow', justifyContent: "center", alignItems: "center"}} onPress={()=> agoraService.leaveChannel()}><Text>离开频道</Text></TouchableOpacity>
        </View>
        <AgoraView style={{width: 200, height: 200, marginBottom: 20}} showLocalVideo={true} mode={1} zOrderMediaOverlay={true}/>
        <AgoraView style={{width: 200, height: 200}}  mode={1} zOrderMediaOverlay={true} remoteUid={333}/>
      </View>
    );
  }
}
