import React from 'react';
import { ArGeoArView } from './ArGeoArView';

/** カメラ＋GPS のシンプルAR（全端末共通） */
export function ArLiveView(props) {
  return <ArGeoArView {...props} />;
}
