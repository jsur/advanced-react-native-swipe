import React, { Component } from 'react';
import { View, Animated, PanResponder } from 'react-native';

class Deck extends Component {
  constructor(props) {
    super(props);

    const position = new Animated.ValueXY();
    const panResponder = PanResponder.create({
      // called every time a user presses down on the screen
      // when set to true, this instance of PanResponder will handle the gesture
      onStartShouldSetPanResponder: () => true,
      // called any time the user starts dragging their finger on the screen
      onPanResponderMove: (event, gesture) => {
        // the gesture object is created once into memory and rewritten
        // with new values each time onPanResponderMove is called to save memory
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      // called when drag gesture is released
      onPanResponderRelease: () => {}
    });

    this.position = position
    this.state = { panResponder }
  }
  
  renderCards() {
    return this.props.data.map(item => {
      return this.props.renderCard(item)
    })
  }

  render() {
    return (
      // panHandlers are callbacks that are passed on to the View element
      <Animated.View
        style={this.position.getLayout()}
        {...this.state.panResponder.panHandlers}
      >
        {this.renderCards()}
      </Animated.View>
    );
  }
}

export default Deck;
