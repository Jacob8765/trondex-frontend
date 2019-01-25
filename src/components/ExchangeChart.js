/* eslint-disable react/jsx-no-target-blank */
import React, { Component } from 'react';
import { ResponsiveLine } from '@nivo/line'

class ExchangeChart extends Component {  
  shouldComponentUpdate(nextProps, nextState) {
    return this.props.data[0].data[this.props.data[0].data.length - 1].y !== nextProps.data[0].data[nextProps.data[0].data.length - 1].y;
  }

  render() {
    return (
      <React.Fragment>
        <ResponsiveLine
          data={this.props.data}
          margin={{
            "top": 25,
            "right": 25,
            "bottom": 25,
            "left": 25
          }}
          axisTop={null}
          axisBottom={null}
          axisRight={null}
          enableGridX={false}
          enableGridY={false}
          enableDots={false}
          animate={true}
          motionStiffness={90}
          motionDamping={15}
          colors="dark2"
          theme={{
            axis: {
              ticks: {
                line: {
                  stroke: "white"
                },
                text: {
                  fill: "white"
                }
              }
            },
          }} />
      </React.Fragment>
    );
  }
}

export default ExchangeChart;
