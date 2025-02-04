'use strict';

exports.__esModule = true;

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _style = require('./style');

var _style2 = _interopRequireDefault(_style);

var ReactTooltip = (function (_Component) {
  _inherits(ReactTooltip, _Component);

  /**
   * Class method
   * @see ReactTooltip.hide() && ReactTooltup.rebuild()
   */

  ReactTooltip.hide = function hide() {
    /**
     * Check for ie
     * @see http://stackoverflow.com/questions/26596123/internet-explorer-9-10-11-event-constructor-doesnt-work
     */
    if (typeof window.Event === 'function') {
      window.dispatchEvent(new window.Event('__react_tooltip_hide_event'));
    } else {
      var _event = document.createEvent('Event');
      _event.initEvent('__react_tooltip_hide_event', false, true);
      window.dispatchEvent(_event);
    }
  };

  ReactTooltip.rebuild = function rebuild() {
    if (typeof window.Event === 'function') {
      window.dispatchEvent(new window.Event('__react_tooltip_rebuild_event'));
    } else {
      var _event2 = document.createEvent('Event');
      _event2.initEvent('__react_tooltip_rebuild_event', false, true);
      window.dispatchEvent(_event2);
    }
  };

  ReactTooltip.prototype.globalHide = function globalHide() {
    if (this.mount) {
      this.hideTooltip();
    }
  };

  ReactTooltip.prototype.globalRebuild = function globalRebuild() {
    if (this.mount) {
      this.unbindListener();
      this.bindListener();
    }
  };

  _createClass(ReactTooltip, null, [{
    key: 'displayName',
    value: 'ReactTooltip',
    enumerable: true
  }, {
    key: 'eventHideMark',
    value: 'hide' + Date.now(),
    enumerable: true
  }, {
    key: 'eventRebuildMark',
    value: 'rebuild' + Date.now(),
    enumerable: true
  }]);

  function ReactTooltip(props) {
    _classCallCheck(this, ReactTooltip);

    _Component.call(this, props);
    this._bind('showTooltip', 'updateTooltip', 'hideTooltip', 'checkStatus', 'onWindowResize', 'bindClickListener');
    this.mount = true;
    this.state = {
      show: false,
      border: false,
      multilineCount: 0,
      placeholder: '',
      x: 'NONE',
      y: 'NONE',
      place: '',
      type: '',
      effect: '',
      multiline: false,
      offset: {},
      extraClass: '',
      html: false,
      delayHide: 0,
      delayShow: 0,
      event: props.event || null
    };
    this.delayShowLoop = null;
  }

  /* Bind this with method */

  ReactTooltip.prototype._bind = function _bind() {
    var _this = this;

    for (var _len = arguments.length, handlers = Array(_len), _key = 0; _key < _len; _key++) {
      handlers[_key] = arguments[_key];
    }

    handlers.forEach(function (handler) {
      return _this[handler] = _this[handler].bind(_this);
    });
  };

  ReactTooltip.prototype.componentDidMount = function componentDidMount() {
    this.bindListener();
    this.setStyleHeader();
    /* Add window event listener for hide and rebuild */
    window.removeEventListener('__react_tooltip_hide_event', this.globalHide);
    window.addEventListener('__react_tooltip_hide_event', this.globalHide.bind(this), false);

    window.removeEventListener('__react_tooltip_rebuild_event', this.globalRebuild);
    window.addEventListener('__react_tooltip_rebuild_event', this.globalRebuild.bind(this), false);
    /* Add listener on window resize  */
    window.removeEventListener('resize', this.onWindowResize);
    window.addEventListener('resize', this.onWindowResize.bind(this), false);
  };

  ReactTooltip.prototype.componentWillUpdate = function componentWillUpdate() {
    this.unbindListener();
  };

  ReactTooltip.prototype.componentDidUpdate = function componentDidUpdate() {
    this.updatePosition();
    this.bindListener();
  };

  ReactTooltip.prototype.componentWillUnmount = function componentWillUnmount() {
    this.unbindListener();
    this.removeScrollListener();
    this.mount = false;
    window.removeEventListener('__react_tooltip_hide_event', this.globalHide);
    window.removeEventListener('__react_tooltip_rebuild_event', this.globalRebuild);
    window.removeEventListener('resize', this.onWindowResize);
  };

  /* TODO: optimize, bind has been trigger too maany times */

  ReactTooltip.prototype.bindListener = function bindListener() {
    var targetArray = this.getTargetArray();

    var dataEvent = undefined;
    for (var i = 0; i < targetArray.length; i++) {
      if (targetArray[i].getAttribute('currentItem') === null) {
        targetArray[i].setAttribute('currentItem', 'false');
      }
      dataEvent = this.state.event || targetArray[i].getAttribute('data-event');
      if (dataEvent) {
        targetArray[i].removeEventListener(dataEvent, this.checkStatus);
        targetArray[i].addEventListener(dataEvent, this.checkStatus, false);
      } else {
        targetArray[i].removeEventListener('mouseenter', this.showTooltip);
        targetArray[i].addEventListener('mouseenter', this.showTooltip, false);

        if (this.state.effect === 'float') {
          targetArray[i].removeEventListener('mousemove', this.updateTooltip);
          targetArray[i].addEventListener('mousemove', this.updateTooltip, false);
        }

        targetArray[i].removeEventListener('mouseleave', this.hideTooltip);
        targetArray[i].addEventListener('mouseleave', this.hideTooltip, false);
      }
    }
  };

  ReactTooltip.prototype.unbindListener = function unbindListener() {
    var targetArray = document.querySelectorAll('[data-tip]');
    var dataEvent = undefined;

    for (var i = 0; i < targetArray.length; i++) {
      dataEvent = this.state.event || targetArray[i].getAttribute('data-event');
      if (dataEvent) {
        targetArray[i].removeEventListener(dataEvent, this.checkStatus);
      } else {
        targetArray[i].removeEventListener('mouseenter', this.showTooltip);
        targetArray[i].removeEventListener('mousemove', this.updateTooltip);
        targetArray[i].removeEventListener('mouseleave', this.hideTooltip);
      }
    }
  };

  /**
   * Get all tooltip targets
   */

  ReactTooltip.prototype.getTargetArray = function getTargetArray() {
    var id = this.props.id;

    var targetArray = undefined;

    if (id === undefined) {
      targetArray = document.querySelectorAll('[data-tip]:not([data-for])');
    } else {
      targetArray = document.querySelectorAll('[data-tip][data-for="' + id + '"]');
    }

    return targetArray;
  };

  /**
   * listener on window resize
   */

  ReactTooltip.prototype.onWindowResize = function onWindowResize() {
    if (!this.mount) return;
    var targetArray = this.getTargetArray();

    for (var i = 0; i < targetArray.length; i++) {
      if (targetArray[i].getAttribute('currentItem') === 'true') {
        // todo: timer for performance

        var _getPosition = this.getPosition(targetArray[i]);

        var x = _getPosition.x;
        var y = _getPosition.y;

        _reactDom.findDOMNode(this).style.left = x + 'px';
        _reactDom.findDOMNode(this).style.top = y + 'px';
        /* this.setState({
         x,
         y
         }) */
      }
    }
  };

  /**
   * Used in customer event
   */

  ReactTooltip.prototype.checkStatus = function checkStatus(e) {
    e.stopPropagation();
    if (this.state.show && e.currentTarget.getAttribute('currentItem') === 'true') {
      this.hideTooltip(e);
    } else {
      e.currentTarget.setAttribute('currentItem', 'true');
      /* when click other place, the tooltip should be removed */
      window.removeEventListener('click', this.bindClickListener);
      window.addEventListener('click', this.bindClickListener, false);

      this.showTooltip(e);
      this.setUntargetItems(e.currentTarget);
    }
  };

  ReactTooltip.prototype.setUntargetItems = function setUntargetItems(currentTarget) {
    var targetArray = this.getTargetArray();
    for (var i = 0; i < targetArray.length; i++) {
      if (currentTarget !== targetArray[i]) {
        targetArray[i].setAttribute('currentItem', 'false');
      } else {
        targetArray[i].setAttribute('currentItem', 'true');
      }
    }
  };

  ReactTooltip.prototype.bindClickListener = function bindClickListener() {
    this.globalHide();
    window.removeEventListener('click', this.bindClickListener);
  };

  /**
   * When mouse enter, show update
   */

  ReactTooltip.prototype.showTooltip = function showTooltip(e) {
    var originTooltip = e.currentTarget.getAttribute('data-tip');
    /* Detect multiline */
    var regexp = /<br\s*\/?>/;
    var multiline = e.currentTarget.getAttribute('data-multiline') ? e.currentTarget.getAttribute('data-multiline') : this.props.multiline ? this.props.multiline : false;
    var tooltipText = undefined;
    var multilineCount = 0;
    if (!multiline || multiline === 'false' || !regexp.test(originTooltip)) {
      tooltipText = originTooltip;
    } else {
      tooltipText = originTooltip.split(regexp).map(function (d, i) {
        multilineCount += 1;
        return _react2['default'].createElement(
          'span',
          { key: i, className: 'multi-line' },
          d
        );
      });
    }
    /* Define extra class */
    var extraClass = e.currentTarget.getAttribute('data-class') ? e.currentTarget.getAttribute('data-class') : '';
    extraClass = this.props['class'] ? this.props['class'] + ' ' + extraClass : extraClass;
    this.setState({
      placeholder: tooltipText,
      multilineCount: multilineCount,
      place: e.currentTarget.getAttribute('data-place') ? e.currentTarget.getAttribute('data-place') : this.props.place ? this.props.place : 'top',
      type: e.currentTarget.getAttribute('data-type') ? e.currentTarget.getAttribute('data-type') : this.props.type ? this.props.type : 'dark',
      effect: e.currentTarget.getAttribute('data-effect') ? e.currentTarget.getAttribute('data-effect') : this.props.effect ? this.props.effect : 'float',
      offset: e.currentTarget.getAttribute('data-offset') ? e.currentTarget.getAttribute('data-offset') : this.props.offset ? this.props.offset : {},
      html: e.currentTarget.getAttribute('data-html') ? e.currentTarget.getAttribute('data-html') : this.props.html ? this.props.html : false,
      delayShow: e.currentTarget.getAttribute('data-delay-show') ? e.currentTarget.getAttribute('data-delay-show') : this.props.delayShow ? this.props.delayShow : 0,
      delayHide: e.currentTarget.getAttribute('data-delay-hide') ? e.currentTarget.getAttribute('data-delay-hide') : this.props.delayHide ? this.props.delayHide : 0,
      border: e.currentTarget.getAttribute('data-border') ? e.currentTarget.getAttribute('data-border') === 'true' : this.props.border ? this.props.border : false,
      extraClass: extraClass,
      multiline: multiline
    });

    this.addScrollListener();
    this.updateTooltip(e);
  };

  /**
   * When mouse hover, updatetooltip
   */

  ReactTooltip.prototype.updateTooltip = function updateTooltip(e) {
    var _this2 = this;

    var _state = this.state;
    var delayShow = _state.delayShow;
    var show = _state.show;

    clearTimeout(this.delayShowLoop);

    var delayTime = show ? 0 : parseInt(delayShow, 10);
    var eventTarget = e.currentTarget;
    this.delayShowLoop = setTimeout(function () {
      if (_this2.trim(_this2.state.placeholder).length > 0) {
        if (_this2.state.effect === 'float') {
          _this2.setState({
            show: true,
            x: e.clientX,
            y: e.clientY
          });
        } else if (_this2.state.effect === 'solid') {
          var _getPosition2 = _this2.getPosition(eventTarget);

          var x = _getPosition2.x;
          var y = _getPosition2.y;

          _this2.setState({
            show: true,
            x: x,
            y: y
          });
        }
      }
    }, delayTime);
  };

  /**
   * When mouse leave, hide tooltip
   */

  ReactTooltip.prototype.hideTooltip = function hideTooltip() {
    var _this3 = this;

    var delayHide = this.state.delayHide;

    clearTimeout(this.delayShowLoop);
    setTimeout(function () {
      _this3.setState({
        show: false
      });
      _this3.removeScrollListener();
    }, parseInt(delayHide, 10));
  };

  /**
   * Add scroll eventlistener when tooltip show
   * or tooltip will always existed
   */

  ReactTooltip.prototype.addScrollListener = function addScrollListener() {
    window.addEventListener('scroll', this.hideTooltip);
  };

  ReactTooltip.prototype.removeScrollListener = function removeScrollListener() {
    window.removeEventListener('scroll', this.hideTooltip);
  };

  /**
   * Get tooltip poisition by current target
   */

  ReactTooltip.prototype.getPosition = function getPosition(currentTarget) {
    var place = this.state.place;

    var node = _reactDom.findDOMNode(this);
    var boundingClientRect = currentTarget.getBoundingClientRect();
    var targetTop = boundingClientRect.top;
    var targetLeft = boundingClientRect.left;
    var tipWidth = node.clientWidth;
    var tipHeight = node.clientHeight;
    var targetWidth = currentTarget.clientWidth;
    var targetHeight = currentTarget.clientHeight;
    var x = undefined;
    var y = undefined;
    if (place === 'top') {
      x = targetLeft - tipWidth / 2 + targetWidth / 2;
      y = targetTop - tipHeight - 8;
    } else if (place === 'bottom') {
      x = targetLeft - tipWidth / 2 + targetWidth / 2;
      y = targetTop + targetHeight + 8;
    } else if (place === 'left') {
      x = targetLeft - tipWidth - 6;
      y = targetTop + targetHeight / 2 - tipHeight / 2;
    } else if (place === 'right') {
      x = targetLeft + targetWidth + 6;
      y = targetTop + targetHeight / 2 - tipHeight / 2;
    }

    return { x: x, y: y };
  };

  /**
   * Execute in componentDidUpdate, can't put this into render() to support server rendering
   */

  ReactTooltip.prototype.updatePosition = function updatePosition() {
    var node = _reactDom.findDOMNode(this);

    var tipWidth = node.clientWidth;
    var tipHeight = node.clientHeight;
    var _state2 = this.state;
    var effect = _state2.effect;
    var place = _state2.place;
    var offset = _state2.offset;

    var offsetFromEffect = {};

    /**
     * List all situations for different placement,
     * then tooltip can judge switch to which side if window space is not enough
     * @note only support for float at the moment
     */
    var placements = ['top', 'bottom', 'left', 'right'];
    placements.forEach(function (key) {
      offsetFromEffect[key] = { x: 0, y: 0 };
    });

    if (effect === 'float') {
      offsetFromEffect.top = {
        x: -(tipWidth / 2),
        y: -tipHeight
      };
      offsetFromEffect.bottom = {
        x: -(tipWidth / 2),
        y: 15
      };
      offsetFromEffect.left = {
        x: -(tipWidth + 15),
        y: -(tipHeight / 2)
      };
      offsetFromEffect.right = {
        x: 10,
        y: -(tipHeight / 2)
      };
    }

    var xPosition = 0;
    var yPosition = 0;

    /* If user set offset attribute, we have to consider it into out position calculating */
    if (Object.prototype.toString.apply(offset) === '[object String]') {
      offset = JSON.parse(offset.toString().replace(/\'/g, '\"'));
    }
    for (var key in offset) {
      if (key === 'top') {
        yPosition -= parseInt(offset[key], 10);
      } else if (key === 'bottom') {
        yPosition += parseInt(offset[key], 10);
      } else if (key === 'left') {
        xPosition -= parseInt(offset[key], 10);
      } else if (key === 'right') {
        xPosition += parseInt(offset[key], 10);
      }
    }

    /* If our tooltip goes outside the window we want to try and change its place to be inside the window */
    var x = this.state.x;
    var y = this.state.y;
    var windoWidth = window.innerWidth;
    var windowHeight = window.innerHeight;

    var getStyleLeft = function getStyleLeft(place) {
      var offsetEffectX = effect === 'solid' ? 0 : place ? offsetFromEffect[place].x : 0;
      return x + offsetEffectX + xPosition;
    };
    var getStyleTop = function getStyleTop(place) {
      var offsetEffectY = effect === 'solid' ? 0 : place ? offsetFromEffect[place].y : 0;
      return y + offsetEffectY + yPosition;
    };

    var outsideLeft = function outsideLeft(place) {
      var styleLeft = getStyleLeft(place);
      return styleLeft < 0 && x + offsetFromEffect['right'].x + xPosition <= windoWidth;
    };
    var outsideRight = function outsideRight(place) {
      var styleLeft = getStyleLeft(place);
      return styleLeft + tipWidth > windoWidth && x + offsetFromEffect['left'].x + xPosition >= 0;
    };
    var outsideTop = function outsideTop(place) {
      var styleTop = getStyleTop(place);
      return styleTop < 0 && y + offsetFromEffect['bottom'].y + yPosition + tipHeight < windowHeight;
    };
    var outsideBottom = function outsideBottom(place) {
      var styleTop = getStyleTop(place);
      return styleTop + tipHeight >= windowHeight && y + offsetFromEffect['top'].y + yPosition >= 0;
    };

    /* We want to make sure the place we switch to will not go outside either */
    var outside = function outside(place) {
      return outsideTop(place) || outsideRight(place) || outsideBottom(place) || outsideLeft(place);
    };

    /* We check each side and switch if the new place will be in bounds */
    if (outsideLeft(place)) {
      if (!outside('right')) {
        this.setState({
          place: 'right'
        });
        return;
      }
    } else if (outsideRight(place)) {
      if (!outside('left')) {
        this.setState({
          place: 'left'
        });
        return;
      }
    } else if (outsideTop(place)) {
      if (!outside('bottom')) {
        this.setState({
          place: 'bottom'
        });
        return;
      }
    } else if (outsideBottom(place)) {
      if (!outside('top')) {
        this.setState({
          place: 'top'
        });
        return;
      }
    }

    node.style.left = getStyleLeft(place) + 'px';
    node.style.top = getStyleTop(place) + 'px';
  };

  /**
   * Set style tag in header
   * Insert style by this way
   */

  ReactTooltip.prototype.setStyleHeader = function setStyleHeader() {
    if (!document.getElementsByTagName('head')[0].querySelector('style[id="react-tooltip"]')) {
      var tag = document.createElement('style');
      tag.id = 'react-tooltip';
      tag.innerHTML = _style2['default'];
      document.getElementsByTagName('head')[0].appendChild(tag);
    }
  };

  ReactTooltip.prototype.render = function render() {
    var _state3 = this.state;
    var placeholder = _state3.placeholder;
    var extraClass = _state3.extraClass;
    var html = _state3.html;

    var tooltipClass = _classnames2['default']('__react_component_tooltip', { 'show': this.state.show }, { 'border': this.state.border }, { 'place-top': this.state.place === 'top' }, { 'place-bottom': this.state.place === 'bottom' }, { 'place-left': this.state.place === 'left' }, { 'place-right': this.state.place === 'right' }, { 'type-dark': this.state.type === 'dark' }, { 'type-success': this.state.type === 'success' }, { 'type-warning': this.state.type === 'warning' }, { 'type-error': this.state.type === 'error' }, { 'type-info': this.state.type === 'info' }, { 'type-light': this.state.type === 'light' });

    if (html) {
      return _react2['default'].createElement('div', { className: tooltipClass + ' ' + extraClass, 'data-id': 'tooltip', dangerouslySetInnerHTML: { __html: placeholder } });
    } else {
      var content = this.props.children ? this.props.children : placeholder;
      return _react2['default'].createElement(
        'div',
        { className: tooltipClass + ' ' + extraClass, 'data-id': 'tooltip' },
        content
      );
    }
  };

  ReactTooltip.prototype.trim = function trim(string) {
    if (Object.prototype.toString.call(string) !== '[object String]') {
      return string;
    }
    var newString = string.split('');
    var firstCount = 0;
    var lastCount = 0;
    for (var i = 0; i < string.length; i++) {
      if (string[i] !== ' ') {
        break;
      }
      firstCount++;
    }
    for (var i = string.length - 1; i >= 0; i--) {
      if (string[i] !== ' ') {
        break;
      }
      lastCount++;
    }
    newString.splice(0, firstCount);
    newString.splice(-lastCount, lastCount);
    return newString.join('');
  };

  return ReactTooltip;
})(_react.Component);

exports['default'] = ReactTooltip;

ReactTooltip.propTypes = {
  children: _react.PropTypes.any,
  place: _react.PropTypes.string,
  type: _react.PropTypes.string,
  effect: _react.PropTypes.string,
  offset: _react.PropTypes.object,
  multiline: _react.PropTypes.bool,
  border: _react.PropTypes.bool,
  'class': _react.PropTypes.string,
  id: _react.PropTypes.string,
  html: _react.PropTypes.bool,
  delayHide: _react.PropTypes.number,
  delayShow: _react.PropTypes.number,
  event: _react.PropTypes.any,
  watchWindow: _react.PropTypes.bool
};
module.exports = exports['default'];
