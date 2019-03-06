/* @flow */

import type { BytesR } from "@capnp-js/bytes";
import type { Int64 } from "@capnp-js/int64";

import { get } from "@capnp-js/bytes";

/* Unsigned integer types. */
type uint = number;
type u3 = 0x00 | 0x01 | 0x02 | 0x03 | 0x04 | 0x05 | 0x06 | 0x07;
type u32 = number;

/* Signed integer types. */
type i32 = number;

/* Floating point types. */
type f32 = number;
type f64 = number;

export function bit(bytes: BytesR, position: uint, bitPosition: u3): i32 {
  return get(position, bytes) & (0x01 << bitPosition);
}

export function int8(bytes: BytesR, position: uint): i32 {
  /* For negative integers, fill in the leading 1's. */
  return (get(position, bytes) << 24) >> 24;
}

export function int16(bytes: BytesR, position: uint): i32 {
  let value = get(position, bytes);

  /* For negative integers, fill in the leading 1's. */
  value |= (get(++position, bytes) << 24) >> 16;

  return value;
}

export function int32(bytes: BytesR, position: uint): i32 {
  let value = get(position, bytes);
  value |= get(++position, bytes) << 8;
  value |= get(++position, bytes) << 16;
  value |= get(++position, bytes) << 24;

  return value;
}

export function uint8(bytes: BytesR, position: uint): u32 {
  return get(position, bytes) >>> 0;
}

export function uint16(bytes: BytesR, position: uint): u32 {
  let value = get(position, bytes);
  value |= get(++position, bytes) << 8;

  return value >>> 0;
}

export function uint32(bytes: BytesR, position: uint): u32 {
  return int32(bytes, position) >>> 0;
}

const buffer = new ArrayBuffer(8);
const i32View = new Int32Array(buffer);
const u8View = new Int8Array(buffer);
i32View[0] = 1;
const leMachine = u8View[0] === 1;

const f32View = new Float32Array(buffer);
const f64View = new Float64Array(buffer);

function leMachineFloat32(leBytes: i32): f32 {
  i32View[0] = leBytes;

  return f32View[0];
}

function beMachineFloat32(leBytes: i32): f32 {
  u8View[0] = leBytes >>> 24;
  u8View[1] = leBytes >>> 16;
  u8View[2] = leBytes >>> 8;
  u8View[3] = leBytes;

  return f32View[0];
}

export const float32: (leBytes: i32) => f32 = leMachine ? leMachineFloat32 : beMachineFloat32;

function leMachineFloat64(leBytes: Int64): f64 {
  i32View[0] = leBytes[1];
  i32View[1] = leBytes[0];

  return f64View[0];
}

function beMachineFloat64(leBytes: Int64): f64 {
  u8View[0] = leBytes[0] >>> 24;
  u8View[1] = leBytes[0] >>> 16;
  u8View[2] = leBytes[0] >>> 8;
  u8View[3] = leBytes[0];

  u8View[4] = leBytes[1] >>> 24;
  u8View[5] = leBytes[1] >>> 16;
  u8View[6] = leBytes[1] >>> 8;
  u8View[7] = leBytes[1];

  return f64View[0];
}

export const float64: (leBytes: Int64) => f64 = leMachine ? leMachineFloat64 : beMachineFloat64;
