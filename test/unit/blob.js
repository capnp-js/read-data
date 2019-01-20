/* @flow */

import test from "ava";

import * as encode from "@capnp-js/write-data";
import { inject as injectI64 } from "@capnp-js/int64";

import * as decode from "../../src/index";

test("`bit`", t => {
  t.plan(6);

  const b = new Uint8Array(1);
  b[0] = 0x01 | 0x02 | 0x80;

  t.is(decode.bit(b, 0, 0), 0x01);
  t.is(decode.bit(b, 0, 1), 0x02);
  t.is(decode.bit(b, 0, 7), 0x80);
  t.is(!!decode.bit(b, 0, 0), true);
  t.is(!!decode.bit(b, 0, 1), true);
  t.is(!!decode.bit(b, 0, 7), true);
});

test("`int8`", t => {
  t.plan(4);

  const b = new Uint8Array(4);

  b[0] = 0xff; // ~0xff + 1 = 0 + 0 + 1 = 1
  t.is(decode.int8(b, 0), -1);

  b[1] = 0xa4; // ~0xa4 + 1 = 16+64 + 1+2+8 + 1 = 92
  t.is(decode.int8(b, 1), -92);

  b[2] = 0x5f; // 16+64 + 1+2+4+8 = 95
  t.is(decode.int8(b, 2), 95);

  b[3] = 0x80; // ~0x80 + 1 = 16+32+64 + 1+2+4+8 + 1 = 128
  t.is(decode.int8(b, 3), -128);
});

test("`int16`", t => {
  t.plan(4);

  const b = new Uint8Array(8);

  b[0] = 0x3f; // ~0x3f = 64+128 + 0 = 192
  b[1] = 0x87; // ~0x87 = 256 * (16+32+64 + 8) = 30720
  // 192 + 30720 + 1 = 30913
  t.is(decode.int16(b, 0), -30913);

  b[2] = 0x28; // ~0x28 = 16+64+128 + 7 = 215
  b[3] = 0xf3; // ~0xf3 = 256 * (0 + 12) = 3072
  // 215 + 3072 + 1 = 3288
  t.is(decode.int16(b, 2), -3288);

  b[4] = 0x37; // 16+32 + 7 = 55
  b[5] = 0x7e; // 256 * (16+32+64 + 14) = 32256
  // 55 + 32256 = 32311
  t.is(decode.int16(b, 4), 32311);

  b[6] = 0x88; // 128 + 8 = 136
  b[7] = 0x1e; // 256 * (16 + 14) = 7680
  // 136 + 7680 = 7816
  t.is(decode.int16(b, 6), 7816);
});

test("`int32`", t => {
  t.plan(4);

  const b = new Uint8Array(16);

  b[0] = 0x18; // ~0x18 = 32+64+128 + 1+2+4 = 231
  b[1] = 0x4c; // ~0x4c = 256 * (16+32+128 + 1+2) = 45824
  b[2] = 0x1f; // ~0x1f = 256*256 * (32+64+128 + 0) = 14680064
  b[3] = 0xd3; // ~0xd3 = 256*256*256 * (32 + 12) = 738197504
  // 231 + 45824 + 14680064 + 738197504 + 1 = 752923624
  t.is(decode.int32(b, 0), -752923624);

  b[4] = 0xfc; // ~0xfc = 0 + 1+2 = 3
  b[5] = 0x17; // ~0x17 = 256 * (32+64+128 + 8) = 59392
  b[6] = 0xe3; // ~0xe3 = 256*256 * (16 + 4+8) = 1835008
  b[7] = 0xb1; // ~0xb1 = 256*256*256 * (64 + 2+4+8) = 1308622848
  // 3 + 59392 + 1835008 + 1308622848 + 1 = -1310517252
  t.is(decode.int32(b, 4), -1310517252);

  b[8] = 0x18; // 16 + 8 = 24
  b[9] = 0xcd; // 256 * (64+128 + 1+4+8) = 52480
  b[10] = 0x1f; // 256*256 * (16 + 1+2+4+8) = 2031616
  b[11] = 0x52; // 256*256*256 * (16+64 + 2) = 1375731712
  // 24 + 52480 + 2031616 + 1375731712 = 1377815832
  t.is(decode.int32(b, 8), 1377815832);

  b[12] = 0x5a; // 16+64 + 2+8 = 90
  b[13] = 0x2f; // 256 * (32 + 1+2+4+8) = 12032
  b[14] = 0xe3; // 256*256 * (32+64+128 + 1+2) = 14876672
  b[15] = 0x1b; // 256*256*256 * (16 + 1+2+8) = 452984832
  // 90 + 12032 + 14876672 + 452984832 = 467873626
  t.is(decode.int32(b, 12), 467873626);
});

test("`uint8`", t => {
  t.plan(4);

  const b = new Uint8Array(4);

  b[0] = 0xff;
  t.is(decode.uint8(b, 0), 255);

  b[1] = 0xa4;
  t.is(decode.uint8(b, 1), 164);

  b[2] = 0x5f;
  t.is(decode.uint8(b, 2), 95);

  b[3] = 0x80;
  t.is(decode.uint8(b, 3), 128);
});

test("`uint16`", t => {
  t.plan(4);

  const b = new Uint8Array(8);

  b[0] = 0x3f; // 16+32 + 1+2+4+8 = 63
  b[1] = 0x87; // 256 * (128 + 1+2+4) = 34560
  // 63 + 34560 = 34623
  t.is(decode.uint16(b, 0), 34623);

  b[2] = 0x28; // 32 + 8 = 40
  b[3] = 0xf3; // 256 * (16+32+64+128 + 1+2) = 62208
  // 40 + 62208 - 62248
  t.is(decode.uint16(b, 2), 62248);

  b[4] = 0x37; // 16+32 + 7 = 55
  b[5] = 0x7e; // 256 * (16+32+64 + 14) = 32256
  // 55 + 32256 = 32311
  t.is(decode.uint16(b, 4), 32311);

  b[6] = 0x88; // 128 + 8 = 136
  b[7] = 0x1e; // 256 * (16 + 14) = 7680
  // 136 + 7680 = 7816
  t.is(decode.uint16(b, 6), 7816);
});

test("`float32`", t => {
  t.plan(7);

  function float(sign, mantissa, exp) {
    mantissa |= 0x00800000;
    const value = mantissa * Math.pow(2, exp-127-23);
    return sign ? -value : value;
  }

  const bytes1 = 0x41ceb314;
  const sign1 = (bytes1 & 0x80000000) >>> 31;
  const exp1 = (bytes1 & 0x7f800000) >>> 23;
  const mantissa1 = bytes1 & 0x007fffff;
  t.is(float(sign1, mantissa1, exp1), decode.float32(bytes1));

  const bytes2 = 0xccae05b8;
  const sign2 = (bytes2 & 0x80000000) >>> 31;
  const exp2 = (bytes2 & 0x7f800000) >>> 23;
  const mantissa2 = bytes2 & 0x007fffff;
  t.is(float(sign2, mantissa2, exp2), decode.float32(bytes2));
  
  const epsilon = Math.pow(2, -24);

  const v1 = 7263.18;
  t.true(Math.abs(v1 - decode.float32(encode.float32(v1))) < Math.abs(v1*epsilon));

  const v2 = -0.00013727364363;
  t.true(Math.abs(v2 - decode.float32(encode.float32(v2))) < Math.abs(v2*epsilon));

  const v3 = NaN;
  t.is(decode.float32(encode.float32(v3)), v3);

  const v4 = Infinity;
  t.is(decode.float32(encode.float32(v4)), v4);

  const v5 = -Infinity;
  t.is(decode.float32(encode.float32(v5)), v5);

  /* TODO: Test some denormalized bin32 values. */
});

test("`float64`", t => {
  t.plan(7);

  function float(sign, mantissa, exp) {
    mantissa[0] = mantissa[0] | 0x00100000;
    const value = mantissa[0]*Math.pow(2, exp-1023-52+32) + mantissa[1]*Math.pow(2, exp-1023-52);
    return sign ? -value : value;
  }

  const bytes1 = injectI64(0x3f5e2507, 0x9030fb9f);
  const sign1 = (bytes1[0] & 0x80000000) >>> 31;
  const exp1 = (bytes1[0] & 0x7ff00000) >>> 20;
  const mantissa1 = [bytes1[0] & 0x000fffff, bytes1[1]];
  t.is(float(sign1, mantissa1, exp1), decode.float64(bytes1));

  const bytes2 = injectI64(0xc0f42e77, 0x77b309b9);
  const sign2 = (bytes2[0] & 0x80000000) >>> 31;
  const exp2 = (bytes2[0] & 0x7ff00000) >>> 20;
  const mantissa2 = [bytes2[0] & 0x000fffff, bytes2[1]];
  t.is(float(sign2, mantissa2, exp2), decode.float64(bytes2));

  const epsilon = Math.pow(2, -53);

  const v1 = 917364.22238374939;
  const e1 = encode.float64(v1);
  t.true(Math.abs(v1 - decode.float64(e1)) < Math.abs(v1*epsilon));

  const v2 = -0.0001372736436309115210293;
  const e2 = encode.float64(v2);
  t.true(Math.abs(v2 - decode.float64(e2)) < Math.abs(v2*epsilon));

  const v3 = NaN;
  const e3 = encode.float64(v3);
  t.is(decode.float64(e3), v3);

  const v4 = Infinity;
  const e4 = encode.float64(v4);
  t.is(decode.float64(e4), v4);

  const v5 = -Infinity;
  const e5 = encode.float64(v5);
  t.is(decode.float64(e5), v5);

  /* TODO: Test some denormalized bin64 values. */
});
