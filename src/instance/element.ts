class Element {

}

    // def __init__(self, httpclient, id):
    //     """
    //     base_url eg: http://localhost:8100/session/$SESSION_ID
    //     """
    //     self.http = httpclient
    //     self._id = id

    // def __repr__(self):
    //     return '<wda.Element(id="{}")>'.format(self.id)

    // def _req(self, method, url, data=None):
    //     return self.http.fetch(method, '/element/'+self.id+url, data)

    // def _wda_req(self, method, url, data=None):
    //     return self.http.fetch(method, '/wda/element/'+self.id+url, data)

    // def _prop(self, key):
    //     return self._req('get', '/'+key.lstrip('/')).value

    // def _wda_prop(self, key):
    //     ret = self._request('GET', 'wda/element/%s/%s' %(self._id, key)).value
    //     return ret

    // @property
    // def id(self):
    //     return self._id

    // @property
    // def label(self):
    //     return self._prop('attribute/label')

    // @property
    // def className(self):
    //     return self._prop('attribute/type')

    // @property
    // def text(self):
    //     return self._prop('text')

    // @property
    // def name(self):
    //     return self._prop('name')

    // @property
    // def displayed(self):
    //     return self._prop("displayed")

    // @property
    // def enabled(self):
    //     return self._prop('enabled')

    // @property
    // def accessible(self):
    //     return self._wda_prop("accessible")

    // @property
    // def accessibility_container(self):
    //     return self._wda_prop('accessibilityContainer')

    // @property
    // def value(self):
    //     return self._prop('attribute/value')

    // @property
    // def enabled(self):
    //     return self._prop('enabled')

    // @property
    // def visible(self):
    //     return self._prop('attribute/visible')

    // @property
    // def bounds(self):
    //     value = self._prop('rect')
    //     x, y = value['x'], value['y']
    //     w, h = value['width'], value['height']
    //     return Rect(x, y, w, h)

    // # operations
    // def tap(self):
    //     return self._req('post', '/click')

    // def click(self):
    //     """ Alias of tap """
    //     return self.tap()

    // def tap_hold(self, duration=1.0):
    //     """
    //     Tap and hold for a moment
    //     Args:
    //         duration (float): seconds of hold time
    //     [[FBRoute POST:@"/wda/element/:uuid/touchAndHold"] respondWithTarget:self action:@selector(handleTouchAndHold:)],
    //     """
    //     return self._wda_req('post', '/touchAndHold', {'duration': duration})

    // def scroll(self, direction='visible', distance=1.0):
    //     """
    //     Args:
    //         direction (str): one of "visible", "up", "down", "left", "right"
    //         distance (float): swipe distance, only works when direction is not "visible"
               
    //     Raises:
    //         ValueError
    //     distance=1.0 means, element (width or height) multiply 1.0
    //     """
    //     if direction == 'visible':
    //         self._wda_req('post', '/scroll', {'toVisible': True})
    //     elif direction in ['up', 'down', 'left', 'right']:
    //         self._wda_req('post', '/scroll', {'direction': direction, 'distance': distance})
    //     else:
    //         raise ValueError("Invalid direction")
    //     return self
    
    // def pinch(self, scale, velocity):
    //     """
    //     Args:
    //         scale (float): scale must > 0
    //         velocity (float): velocity must be less than zero when scale is less than 1
        
    //     Example:
    //         pinchIn  -> scale:0.5, velocity: -1
    //         pinchOut -> scale:2.0, velocity: 1
    //     """
    //     data = {'scale': scale, 'velocity': velocity}
    //     return self._wda_req('post', '/pinch', data)

    // def set_text(self, value):
    //     return self._req('post', '/value', {'value': value})

    // def clear_text(self):
    //     return self._req('post', '/clear')

    // # def child(self, **kwargs):
    // #     return Selector(self.__base_url, self._id, **kwargs)
        
    // # todo lot of other operations
    // # tap_hold