import React, { Component } from 'react';
import { WebView } from 'react-native-webview';
import { Const } from './Const';
import { Dimensions, StyleSheet, View } from 'react-native';

interface MapViewProps {
  language?: string;
  [key: string]: any;
  layer?: any;
  zoom?: number;
  zoomRange?: any;
  location?: { lon: number; lat: number };
  ui?: any;
  lastView?: boolean;
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
export default class MapView extends Component<MapViewProps> {
  static defaultProps = {
    language: '',
    layer: 'SIMPLE',
    zoom: 10,
    zoomRange: [5, 20],
    location: { lon: 100, lat: 13 },
    ui: {},
    lastView: false,
  };

  #web: WebView | null = null;
  #baseUrl: string = `https://${(Const.bundleId ?? '').toLowerCase()}/`;
  #callback: ((data: any) => void) | undefined;
  render() {
    const windowWidth = Dimensions.get('window').width;
    const windowHeight = Dimensions.get('window').height;

    let events = '';
    for (const prop in this.props) {
      if (prop.startsWith('on')) {
        events += `,"${prop}"`;
        (this as any)[prop] = this.props[prop];
      }
    }

    const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <title></title>
        <style>
          html { height: 100% }
          body { height: 100%; margin: 0; padding: 0; font: 12px/1.2 sans-serif; }
          #map { width: 100%; height: 100%; }
        </style>
        <script src="https://${Const.server}?key=${Const.apiKey}"></script>
        <script>
          let map;
          const objectList = [];
    
          function init() {
            const placeholder = document.getElementById('map');
            if (!window.sphere) {
              placeholder.innerHTML = navigator.onLine
                ? '<h4>UNREGISTERED APP</h4><strong>ID</strong>: ${Const.bundleId}<br><strong>KEY</strong>: ${Const.apiKey?.substring(0, 8)}...'
                : 'Not connected to network';
              return;
            }
            console.log = (message) => ReactNativeWebView.postMessage('{"$log":"' + message.replaceAll('"', '\\"') + '"}')
            onerror = (message, source, lineno, colno) => console.log(message + ' @ ' + source + '#L' + lineno + ':' + colno);
            
            map = new sphere.Map({
              layer: parse(${JSON.stringify(this.props.layer)}),
              zoom: ${this.props.zoom},
              zoomRange: ${JSON.stringify(this.props.zoomRange)},
              location: ${JSON.stringify(this.props.location)},
              ui: parse(${JSON.stringify(this.props.ui)}),
              lastView: ${this.props.lastView},
              language: '${this.props.language}',
              placeholder: placeholder
            });
            map.Ui.Geolocation?.visible(false);
            for (const event of [${events.substring(1)}]) {
              try {
                map.Event.bind(event[2].toLocaleLowerCase() + event.substring(3),
                  data => ReactNativeWebView.postMessage(JSON.stringify({ $event: event, data: serialize(data) })));
              } catch (e) {
                console.log(e);
              }
            }
            map.Util = sphere.Util;
            map.toJSON = map.Overlays.toJSON = map.Ui.toJSON = () => ({});
          }
    
          function parse(data) {
            if (!data) return data;
            if (data.$static) {
              const value = sphere[data.$static]?.[data.name];
              if (value !== undefined) return value;
              
              console.log(data.$static + '.' + data.name + ' is undefined');
            }
            if (data.$object) {
              let object = objectList[data.$id];
              if (!object) {
                const dot = data.$object.indexOf('.');
                const objectType = dot < 0
                  ? sphere[data.$object]
                  : sphere[data.$object.substring(0, dot)]?.[data.$object.substring(dot + 1)];
                if (objectType) {
                  object = new objectType(...data.args.map(parse));
                  object.$id = data.$id;
                  objectList[data.$id] = object;
                } else {
                  console.log(data.$object + ' is undefined');
                }
              }
              return object;
            }
            if (data.$function) return eval(data.$function);
            if (Array.isArray(data)) return data.map(parse);
            if (typeof data === 'object') {
              for (key in data) {
                data[key] = parse(data[key]);
              }
            }
            return data;
          }
    
          function serialize(object) {
            if (!object) return object;
            if (object.$id) return { $object: true, $id: object.$id };
            if (object.active) {
              object.$id = objectList.length;
              objectList.push(object);
              return { $object: 'wait', $id: object.$id };
            }
            if (Array.isArray(object)) return object.map(serialize);
            return object;
          }
    
          function call(method, args) {
            const dot = method.indexOf('.');
            if (dot < 0) {
              commit(map, method, args);
            } else {
              const executor = map[method.substring(0, dot)];
              const dot2 = method.indexOf('.', dot + 1);
              if (dot2 < 0) {
                commit(executor, method.substring(dot + 1), args);
              } else {
                commit(executor?.[method.substring(dot + 1, dot2)], method.substring(dot2 + 1), args);
              }
            }
          }
    
          function objectCall(object, method, args) {
            commit(parse(JSON.parse(object)), method, args);
          }
    
          function commit(executor, method, args) {
            if (executor?.[method]) {
              const result = executor[method](...JSON.parse(args).map(parse));
              if (result instanceof Promise) {
                result.then(callback);
              } else {
                callback(result);
              }
            } else {
              console.log(method + ' not found');
            }
          }
    
          function callback(result) {
            try {
              result = JSON.stringify(serialize(result));
            } catch (e) {
              result = '{}';
            }
            ReactNativeWebView.postMessage(result);
          }
    
          function moveObject(from, to) {
            objectList[from].$id = to;
            objectList[to] = objectList[from];
            delete objectList[from];
          }
        </script>
      </head>
      <body onload="init();">
        <div id="map"></div>
      </body>
    </html>`;

    return (
      <View style={styles.container}>
        <WebView
          ref={(r) => (this.#web = r)}
          originWhitelist={['*']}
          source={{
            html: html,
            baseUrl: this.#baseUrl,
          }}
          style={{
            height: windowHeight,
            width: windowWidth,
          }}
          onMessage={(e) => this.#onMessage(e.nativeEvent.data)}
          onShouldStartLoadWithRequest={(e) => e.url === this.#baseUrl}
        />
      </View>
    );
  }

  call(method: string, ...args: any[]): Promise<any> {
    if (method === 'Event.bind' || method === 'Event.unbind') {
      Const.log(`${method} not supported`);
      return Promise.reject(new Error(`${method} not supported`));
    }

    return new Promise((resolve) => {
      this.#callback = resolve;
      this.#web?.injectJavaScript(`call("${method}", "${this.#escape(args)}")`);
    });
  }

  objectCall(object: string, method: string, ...args: any[]): Promise<any> {
    return new Promise((resolve) => {
      this.#callback = resolve;
      this.#web?.injectJavaScript(
        `objectCall("${this.#escape(object)}", "${method}", "${this.#escape(args)}")`
      );
    });
  }

  run(script: string): void {
    this.#web?.injectJavaScript(script);
  }
  
  #onMessage(data: any): void {
    data = JSON.parse(data);
    if (data.$event) {
      (this as any)[data.$event](data.data);
    } else if (data.$log) {
      Const.log(data.$log);
    } else {
      if (data.$object === 'wait') {
        if (++Const.objectcount === data.$id) {
          data.$object = true;
        } else {
          this.#web?.injectJavaScript(
            `moveObject(${data.$id}, ${Const.objectcount})`
          );
          data.$id = Const.objectcount;
        }
      }
      this.#callback?.(data);
    }
  }

  #escape(data: any): string {
    return JSON.stringify(data).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }
}