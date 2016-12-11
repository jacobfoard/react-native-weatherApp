import React, { Component } from 'react'
import { AppRegistry, StyleSheet, Text, View, Animated, TextInput, ActivityIndicator, TouchableHighlight, Image } from 'react-native' // import { getWeather } from './app/utils/api'
import { API_KEY } from './env'
import { getIcon } from './app/utils/icons'

const url = `http://api.openweathermap.org/data/2.5/weather?APPID=${API_KEY}&units=imperial`

export default class weatherApp extends Component {
  constructor(props) {
    super(props)
    
    // this binds
    this.askForWeather.bind(this);
    // setup inital state
    
    this.state = {
      val: new Animated.Value(0),
      currentColor: "rgba(255,255,255,0.5)",
      nextColor: this._randomColor(),
      askedForWeather: false,
      gotWeather: null,
      requests: 1
    }

  }

  watchID: ?number = null;

  async askForWeather() {
    let numReq = this.state.requests + 1
    this.setState({gotWeather: false, requests: numReq})
    let lat =  this.state.position.coords.latitude,
        lon =  this.state.position.coords.longitude,
        dataURL = url + `&lat=${lat}&lon=${lon}`
    console.log(dataURL)
    try {
      let resp = await fetch(dataURL)
      let weather = await resp.json()
      this.setState({weather, gotWeather: true})
    } catch (err) {
      console.log(err)
      this.setState({gotWeather: false})
      if (this.state.reqests < 10) {
        this.askForWeather()
      }
    }
        
  }
  
  componentDidMount() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.setState({position});
      },
      (error) => alert(JSON.stringify(error)),
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
    );
    this.watchID = navigator.geolocation.watchPosition((position) => {
      this.setState({position});
    });
  }

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchID);
  }
  
  componentDidUpdate(prevProps, prevState){
    if(this.state.position != undefined) {
      if(this.state.askedForWeather == false) {
        this.setState({'askedForWeather': true})
        this.askForWeather()
      } 
    }
  }
  
  
  render() {
     let backgroundColor = this.state.val.interpolate({
        inputRange: [0, 1],
        outputRange: [
          this.state.currentColor,
          this.state.nextColor
        ],
      });
    Animated.spring(this.state.val, {
      tension: 1,
      friction: 20,
      toValue: 1
    }).start()
    let display = <View style={styles.animatedContainer}>
                    <ActivityIndicator style={styles.animatedContainer} animating={this.state.gotWeather} size={'large'}/> 
                  </View>
    console.log(this.state.requests)
    if(this.state.gotWeather === true) {
      let { weather } = this.state;
      let city = weather.name,
          country = weather.sys.country,
          curWeather = weather.weather[0],
          temp = weather.main.temp
      display = <View style={[styles.animatedContainer]}>
            <Text style={styles.icon}>
              {getIcon(curWeather.icon)}
            </Text>
            <Text style={styles.temperature}>
              {Math.round(temp) + "°F"}
            </Text>
            <Text style={styles.location}>
              {city}, {country}
            </Text>
            <Text style={styles.weatherType}>
              {curWeather.main}
            </Text>
          </View>
    } else if (this.state.reqests > 10) {
      display = <Text style={styles.temperature}>Failed To Get Weather</Text>
    }
    
    return (
      <Animated.View style={{
        backgroundColor: backgroundColor,
        flex: 1,
        alignItems: "stretch",
        justifyContent: "center"}}>
      {display}
        {/*<TouchableHighlight onPress={this.askForWeather}>
        <Image
          style={styles.input}
          source={{uri: 'https://cdn4.iconfinder.com/data/icons/ionicons/512/icon-refresh-128.png'}}
        />
      </TouchableHighlight> */}
    </Animated.View>)
      
  }
  
  _randomColor() {
    var colors = [0, 1, 2].map(() => Math.ceil(Math.random() * 255));

    return "rgba(" + colors.join(",") + ",0.6)"
  }
}

var styles = StyleSheet.create({
  animatedContainer: {
    alignItems: "center",
    justifyContent: "center"
  },
  temperature: {
    fontSize: 62,
    fontWeight: "100",
    margin: 0
  },
  location: {
    fontSize: 14,
    fontWeight: "100",
    marginBottom: 20,
  },
  weatherType: {
    fontSize: 34,
    fontWeight: "500"
  },
  input: {
    borderWidth: 1,
    borderColor: "#666",
    height: 40,
    marginVertical: 20,
    marginHorizontal: 20,
    paddingHorizontal: 10,
    borderRadius: 5
  },
  icon: {
    fontFamily: 'WeatherIcons-Regular',
    fontSize: 130,
    padding: 0
  }
})


AppRegistry.registerComponent('weatherApp', () => weatherApp)