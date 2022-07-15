export const numToU8BigEndian = (num: number) => {
  const dataView = new DataView(Uint8Array.from([0]).buffer);

  dataView.setUint8(0, num);

  return new Uint8Array(dataView.buffer);
};

export const numToU16BigEndian = (num: number) => {
  const dataView = new DataView(Uint16Array.from([0]).buffer);

  dataView.setUint16(0, num, false);

  return new Uint8Array(dataView.buffer);
};

export const numToU32BigEndian = (num: number) => {
  const dataView = new DataView(Uint32Array.from([0]).buffer);

  dataView.setUint32(0, num, false);

  return new Uint8Array(dataView.buffer);
};

export const numToU64BigEndian = (num: bigint) => {
  const dataView = new DataView(BigUint64Array.from([0n]).buffer);

  dataView.setBigUint64(0, num, false);

  return new Uint8Array(dataView.buffer);
};

export const numToI32BigEndian = (num: number) => {
  const dataView = new DataView(Int32Array.from([0]).buffer);

  dataView.setInt32(0, num, false);

  return new Uint8Array(dataView.buffer);
};

export const numToI64BigEndian = (num: bigint) => {
  const dataView = new DataView(BigInt64Array.from([0n]).buffer);

  dataView.setBigInt64(0, num, false);

  return new Uint8Array(dataView.buffer);
};

export const numToF32BigEndian = (num: number) => {
  const dataView = new DataView(Float32Array.from([0]).buffer);

  dataView.setFloat32(0, num, false);

  return new Uint8Array(dataView.buffer);
};

export const numToF64BigEndian = (num: number) => {
  const dataView = new DataView(Float64Array.from([0]).buffer);

  dataView.setFloat64(0, num, false);

  return new Uint8Array(dataView.buffer);
};
