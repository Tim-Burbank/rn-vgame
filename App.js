import React, { Component } from 'react';
import { Text, View } from 'react-native';
import { agoraService } from "./agora"
import { AgoraView } from 'react-native-agora'

export default class HelloWorldApp extends Component {
  componentDidMount() {
    agoraService.joinChannel()
  }
  render() {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Hello, world!</Text>
        <AgoraView style={{width: 200, height: 200}} showLocalVideo={true} mode={1} zOrderMediaOverlay={true}/>
      </View>
    );
  }
}
