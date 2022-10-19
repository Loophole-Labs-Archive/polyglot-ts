/*
	Copyright 2022 Loophole Labs

	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at

		   http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
*/

/* eslint-disable no-bitwise */

const CONTINUATION = 0x80;
const MAXLEN16 = 3;
const MAXLEN32 = 5;
const MAXLEN64 = 10;

export const numToUint8BigEndian = (num: number) => {
  const dataView = new DataView(Uint8Array.from([0]).buffer);

  dataView.setUint8(0, num);

  return new Uint8Array(dataView.buffer);
};

export const numToUint16BigEndian = (num: number) => {
  let val = num;
  const bytes = [];
  while (val >= CONTINUATION) {
    bytes.push(val | 0x80);
    val >>>= 7;
  }
  bytes.push(val);
  return new Uint8Array(bytes);
};

export const numToUint32BigEndian = (num: number) => {
  let val = num;
  const bytes = [];
  while (val >= CONTINUATION) {
    bytes.push(val | 0x80);
    val >>>= 7;
  }
  bytes.push(val);
  return new Uint8Array(bytes);
};

export const numToUint64BigEndian = (num: bigint) => {
  let val = BigInt(num);
  const bytes = [];
  while (val >= BigInt(CONTINUATION)) {
    bytes.push(Number(val & BigInt(0x7f)) | CONTINUATION);
    val >>= 7n;
  }
  bytes.push(Number(val));
  return new Uint8Array(bytes);
};

export const numToInt32BigEndian = (num: number) => {
  // two's complement
  let val = num >= 0 ? num * 2 : num * -2 - 1;
  const bytes = [];
  while (val >= CONTINUATION) {
    bytes.push(val | 0x80);
    val >>>= 7;
  }
  bytes.push(val);
  return new Uint8Array(bytes);
};

export const numToInt64BigEndian = (num: bigint) => {
  let val = BigInt(num);
  val = val >= 0 ? val * 2n : val * -2n - 1n;
  const bytes = [];
  while (val >= BigInt(CONTINUATION)) {
    bytes.push(Number(val & BigInt(0x7f)) | CONTINUATION);
    val >>= 7n;
  }
  bytes.push(Number(val));
  return new Uint8Array(bytes);
};

export const numToFloat32BigEndian = (num: number) => {
  const dataView = new DataView(Float32Array.from([0]).buffer);

  dataView.setFloat32(0, num, false);

  return new Uint8Array(dataView.buffer);
};

export const numToFloat64BigEndian = (num: number) => {
  const dataView = new DataView(Float64Array.from([0]).buffer);

  dataView.setFloat64(0, num, false);

  return new Uint8Array(dataView.buffer);
};

export const uint8BigEndianToNum = (buf: Uint8Array) => {
  const dataView = new DataView(buf.buffer);

  return dataView.getUint8(0);
};

export const uint16BigEndianToNum = (buf: Uint8Array) => {
  let num = 0;
  let shift = 0;
  for (let i = 1; i < MAXLEN16 + 1; i += 1) {
    const b = buf[i];
    if (b < CONTINUATION) {
      return {
        value: (num | (b << shift)) >>> 0,
        buf: buf.slice(i + 1),
      };
    }
    num |= b & ((CONTINUATION - 1) << shift);
    shift += 7;
  }
  return {
    value: num,
    buf,
  };
};

export const uint32BigEndianToNum = (buf: Uint8Array) => {
  let num = 0n;
  let shift = 0n;
  for (let i = 1; i < MAXLEN32 + 1; i += 1) {
    const b = buf[i];
    if (b < BigInt(CONTINUATION)) {
      num += BigInt(b) << shift;
      return {
        value: Number(num),
        buf: buf.slice(i + 1),
      };
    }
    num += BigInt(b & (CONTINUATION - 1)) << shift;
    shift += 7n;
  }
  return {
    value: Number(num),
    buf,
  };
};

export const uint64BigEndianToNum = (buf: Uint8Array) => {
  let num = 0n;
  let shift = 0n;
  for (let i = 1; i < MAXLEN64 + 1; i += 1) {
    const b = buf[i];
    if (b < BigInt(CONTINUATION)) {
      num += BigInt(b) << shift;
      return {
        value: num,
        buf: buf.slice(i + 1),
      };
    }
    num += BigInt(b & (CONTINUATION - 1)) << shift;
    shift += 7n;
  }
  return {
    value: num,
    buf,
  };
};

export const int32BigEndianToNum = (buf: Uint8Array) => {
  let num = 0n;
  let shift = 0n;
  for (let i = 1; i < MAXLEN32 + 1; i += 1) {
    const b = buf[i];
    if (b < BigInt(CONTINUATION)) {
      num += BigInt(b) << shift;
      // two's complement
      num = num % 2n === 0n ? num / 2n : -(num + 1n) / 2n;
      return {
        value: Number(num),
        buf: buf.slice(i + 1),
      };
    }
    num += BigInt(b & (CONTINUATION - 1)) << shift;
    shift += 7n;
  }
  return {
    value: Number(num),
    buf,
  };
};

export const int64BigEndianToNum = (buf: Uint8Array) => {
  let num = 0n;
  let shift = 0n;
  for (let i = 1; i < MAXLEN64 + 1; i += 1) {
    const b = buf[i];
    if (b < BigInt(CONTINUATION)) {
      num += BigInt(b) << shift;
      // two's complement
      num = num % 2n === 0n ? num / 2n : -(num + 1n) / 2n;
      return {
        value: num,
        buf: buf.slice(i + 1),
      };
    }
    num += BigInt(b & (CONTINUATION - 1)) << shift;
    shift += 7n;
  }
  return {
    value: num,
    buf,
  };
};

export const float32BigEndianToNum = (buf: Uint8Array) => {
  const dataView = new DataView(buf.buffer);

  return dataView.getFloat32(0, false);
};

export const float64BigEndianToNum = (buf: Uint8Array) => {
  const dataView = new DataView(buf.buffer);

  return dataView.getFloat64(0, false);
};
