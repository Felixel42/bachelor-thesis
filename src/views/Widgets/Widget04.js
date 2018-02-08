import React, {Component} from "react";
import PropTypes from 'prop-types';
import {Card, CardBlock, Progress} from "reactstrap";
import classNames from 'classnames';
import {mapToCssModules} from 'reactstrap/lib/utils';

const propTypes = {
  header: PropTypes.string,
  icon: PropTypes.string,
  color: PropTypes.string,
  value: PropTypes.string,
  children: PropTypes.node,
  className: PropTypes.string,
  cssModule: PropTypes.object,
  invert: PropTypes.bool
};

const defaultProps = {
  header: '87.500',
  icon: "icon-people",
  color: 'info',
  value: "25",
  children: "Visitors",
  invert: false
};

class Widget04 extends Component {
  render() {
    const {className, cssModule, header, icon, color, value, children, invert, ...attributes} = this.props;

    // demo purposes only
    const card = {style: "", bgColor: "", icon: icon};

    if (invert) {
      card.style = "text-white";
      card.bgColor = 'bg-' + color;
    }

    const classes = mapToCssModules(classNames(className, card.style, card.bgColor), cssModule);

    return (
      <Card className={ classes } {...attributes}>
        <CardBlock className="card-body">
          <div className="h1 text-muted text-right mb-2">
            <i className={ card.icon }></i>
          </div>
          <div className="h4 mb-0">{ header }</div>
          <small className="text-muted text-uppercase font-weight-bold">{ children }</small>
        </CardBlock>
      </Card>
    )
  }
}

Widget04.propTypes = propTypes;
Widget04.defaultProps = defaultProps;

export default Widget04;