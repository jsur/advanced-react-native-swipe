import React, { Component } from 'react';
import {
  View,
  Animated,
  PanResponder,
  Dimensions,
  LayoutAnimation,
  UIManager
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250

class Deck extends Component {
  static defaultProps = {
    onSwipeRight: () => {},
    onSwipeLeft: () => {}
  }

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
      onPanResponderRelease: (event, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          this.forceSwipe('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          this.forceSwipe('left');
        } else {
          this.resetPosition();
        }
      }
    });

    this.position = position
    this.state = { panResponder, index: 0 }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data) {
      this.setState({ index: 0 });
    }
  }

  componentWillUpdate() {
    // only for android
    UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
    LayoutAnimation.spring();
  }

  forceSwipe(direction) {
    if (!direction) return
    const x = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH
    Animated.timing(this.position, {
      toValue: { x, y: 0 },
      duration: SWIPE_OUT_DURATION
    }).start(() => this.onSwipeComplete(direction));
  }

  onSwipeComplete(direction) {
    const { onSwipeLeft, onSwipeRight, data } = this.props;
    const item = data[this.state.index];

    direction === 'right' ? onSwipeRight(item) : onSwipeLeft(item);
    this.position.setValue({ x: 0, y: 0 });
    this.setState({ index: this.state.index + 1 });
  }

  resetPosition() {
    Animated.spring(this.position, {
      toValue: { x: 0, y: 0}
    }).start();
  }

  getCardStyle() {
    const rotate = this.position.x.interpolate({
      // if a user drags their finger -500 units of translation to the left, output is -120deg
      inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
      outputRange: ['-120deg', '0deg', '120deg']
    });

    return {
      ...this.position.getLayout(),
      transform: [{ rotate }]
    };
  }
  
  renderCards() {
    if (this.state.index >= this.props.data.length) {
      return this.props.renderNoMoreCards();
    }

    return this.props.data.map((item, i) => {
      if (i < this.state.index) return null;

      if (i === this.state.index) {
        return (
          <Animated.View
            key={item.id}
            style={[this.getCardStyle(), styles.cardStyle]}
            // panHandlers are callbacks that are passed on to the View element
            {...this.state.panResponder.panHandlers}
          >
            {this.props.renderCard(item)}
          </Animated.View>
        )
      }
      return (
        <Animated.View
          key={item.id}
          style={[styles.cardStyle, { top: 5 * (i - this.state.index) }]}
        >
          {this.props.renderCard(item)}
        </Animated.View>
      )
    }).reverse();
  }

  render() {
    return (
      <View>
        {this.renderCards()}
      </View>
    );
  }
}

const styles = {
  cardStyle: {
    position: 'absolute',
    width: SCREEN_WIDTH
  }
}

export default Deck;
