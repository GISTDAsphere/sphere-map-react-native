import { Const } from './lib/Const';
import MapView from './lib/Map';

type StaticType = {
  $static: string;
  name: string;
};

type ObjectType = {
  $object: string;
  $id: number;
  args: any[];
};

type FunctionType = {
  $function: string;
};

const Sphere = {
  set server(value: string) {
    Const.server = value;
  },
  set bundleId(value: string) {
    Const.bundleId = value;
  },
  set apiKey(value: string) {
    Const.apiKey = value;
  },
  static: (type: string, name: string): StaticType => ({
    $static: type,
    name: name,
  }),
  object: (type: string, ...args: any[]): ObjectType => ({
    $object: type,
    $id: ++Const.objectcount,
    args: args,
  }),
  function: (detail: string): FunctionType => ({
    $function: detail,
  }),
  isSameObject: (a: { $id: number }, b: { $id: number }): boolean =>
    a.$id === b.$id,
  MapView: MapView,
};

Const.init();

export default Sphere;