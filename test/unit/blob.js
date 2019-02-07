/* @flow */

import * as assert from "assert";
import { describe, it } from "mocha";
import * as encode from "@capnp-js/write-data";
import { inject as injectI64 } from "@capnp-js/int64";

import * as decode from "../../src/index";

describe("bit", function () {
  const b = new Uint8Array(1);
  b[0] = 0x01 | 0x02 | 0x80;

  it("masks all but the parametrized bit", function () {
    assert.equal(decode.bit(b, 0, 0), 0x01);
    assert.equal(decode.bit(b, 0, 1), 0x02);
    assert.equal(decode.bit(b, 0, 2), 0x00);
    assert.equal(decode.bit(b, 0, 3), 0x00);
    assert.equal(decode.bit(b, 0, 4), 0x00);
    assert.equal(decode.bit(b, 0, 5), 0x00);
    assert.equal(decode.bit(b, 0, 6), 0x00);
    assert.equal(decode.bit(b, 0, 7), 0x80);
    assert.equal(!!decode.bit(b, 0, 0), true);
    assert.equal(!!decode.bit(b, 0, 1), true);
    assert.equal(!!decode.bit(b, 0, 2), false);
    assert.equal(!!decode.bit(b, 0, 3), false);
    assert.equal(!!decode.bit(b, 0, 4), false);
    assert.equal(!!decode.bit(b, 0, 5), false);
    assert.equal(!!decode.bit(b, 0, 6), false);
    assert.equal(!!decode.bit(b, 0, 7), true);
  });
});

describe("int8", function () {
  const b = new Uint8Array(4);

  it("decodes 0xff as -1", function () {
    b[0] = 0xff; // ~0xff + 1 = 0 + 0 + 1 = 1
    assert.equal(decode.int8(b, 0), -1);
  });

  it("decodes 0xa4 as -92", function () {
    b[1] = 0xa4; // ~0xa4 + 1 = 16+64 + 1+2+8 + 1 = 92
    assert.equal(decode.int8(b, 1), -92);
  });

  it("decodes 0x5f as 95", function () {
    b[2] = 0x5f; // 16+64 + 1+2+4+8 = 95
    assert.equal(decode.int8(b, 2), 95);
  });

  it("decodes 0x80 as -128", function () {
    b[3] = 0x80; // ~0x80 + 1 = 16+32+64 + 1+2+4+8 + 1 = 128
    assert.equal(decode.int8(b, 3), -128);
  });
});

describe("int16", function () {
  const b = new Uint8Array(8);

  it("decodes 0x873f as -30913", function () {
    b[0] = 0x3f; // ~0x3f = 64+128 + 0 = 192
    b[1] = 0x87; // ~0x87 = 256 * (16+32+64 + 8) = 30720
    // 192 + 30720 + 1 = 30913
    assert.equal(decode.int16(b, 0), -30913);
  });

  it("decodes 0xf328 as -3288", function () {
    b[2] = 0x28; // ~0x28 = 16+64+128 + 7 = 215
    b[3] = 0xf3; // ~0xf3 = 256 * (0 + 12) = 3072
    // 215 + 3072 + 1 = 3288
    assert.equal(decode.int16(b, 2), -3288);
  });

  it("decodes 0x7e37 as 32311", function () {
    b[4] = 0x37; // 16+32 + 7 = 55
    b[5] = 0x7e; // 256 * (16+32+64 + 14) = 32256
    // 55 + 32256 = 32311
    assert.equal(decode.int16(b, 4), 32311);
  });

  it("decodes 0x1e88 as 7816", function () {
    b[6] = 0x88; // 128 + 8 = 136
    b[7] = 0x1e; // 256 * (16 + 14) = 7680
    // 136 + 7680 = 7816
    assert.equal(decode.int16(b, 6), 7816);
  });
});

describe("int32", function () {
  const b = new Uint8Array(16);

  it("decodes 0xd31f4c18 as -752923624", function () {
    b[0] = 0x18; // ~0x18 = 32+64+128 + 1+2+4 = 231
    b[1] = 0x4c; // ~0x4c = 256 * (16+32+128 + 1+2) = 45824
    b[2] = 0x1f; // ~0x1f = 256*256 * (32+64+128 + 0) = 14680064
    b[3] = 0xd3; // ~0xd3 = 256*256*256 * (32 + 12) = 738197504
    // 231 + 45824 + 14680064 + 738197504 + 1 = 752923624
    assert.equal(decode.int32(b, 0), -752923624);
  });

  it("decodes 0xb1e317fc as -1310517252", function () {
    b[4] = 0xfc; // ~0xfc = 0 + 1+2 = 3
    b[5] = 0x17; // ~0x17 = 256 * (32+64+128 + 8) = 59392
    b[6] = 0xe3; // ~0xe3 = 256*256 * (16 + 4+8) = 1835008
    b[7] = 0xb1; // ~0xb1 = 256*256*256 * (64 + 2+4+8) = 1308622848
    // 3 + 59392 + 1835008 + 1308622848 + 1 = -1310517252
    assert.equal(decode.int32(b, 4), -1310517252);
  });

  it("decodes 0x521fcd18 as 1377815832", function () {
    b[8] = 0x18; // 16 + 8 = 24
    b[9] = 0xcd; // 256 * (64+128 + 1+4+8) = 52480
    b[10] = 0x1f; // 256*256 * (16 + 1+2+4+8) = 2031616
    b[11] = 0x52; // 256*256*256 * (16+64 + 2) = 1375731712
    // 24 + 52480 + 2031616 + 1375731712 = 1377815832
    assert.equal(decode.int32(b, 8), 1377815832);
  });

  it("decodes 0x1be32f5a as 467873626", function () {
    b[12] = 0x5a; // 16+64 + 2+8 = 90
    b[13] = 0x2f; // 256 * (32 + 1+2+4+8) = 12032
    b[14] = 0xe3; // 256*256 * (32+64+128 + 1+2) = 14876672
    b[15] = 0x1b; // 256*256*256 * (16 + 1+2+8) = 452984832
    // 90 + 12032 + 14876672 + 452984832 = 467873626
    assert.equal(decode.int32(b, 12), 467873626);
  });
});

describe("uint8", function () {
  const b = new Uint8Array(4);

  it("decodes 0xff as 255", function () {
    b[0] = 0xff;
    assert.equal(decode.uint8(b, 0), 255);
  });

  it("decodes 0xa4 as 164", function () {
    b[1] = 0xa4;
    assert.equal(decode.uint8(b, 1), 164);
  });

  it("decodes 0x5f as 95", function () {
    b[2] = 0x5f;
    assert.equal(decode.uint8(b, 2), 95);
  });

  it("decodes 0x80 as 128", function () {
    b[3] = 0x80;
    assert.equal(decode.uint8(b, 3), 128);
  });
});

describe("uint16", function () {
  const b = new Uint8Array(8);

  it("decodes 0x873f as 34623", function () {
    b[0] = 0x3f; // 16+32 + 1+2+4+8 = 63
    b[1] = 0x87; // 256 * (128 + 1+2+4) = 34560
    // 63 + 34560 = 34623
    assert.equal(decode.uint16(b, 0), 34623);
  });

  it("decodes 0xf328 as 62248", function () {
    b[2] = 0x28; // 32 + 8 = 40
    b[3] = 0xf3; // 256 * (16+32+64+128 + 1+2) = 62208
    // 40 + 62208 - 62248
    assert.equal(decode.uint16(b, 2), 62248);
  });

  it("decodes 0x7e37 as 32311", function () {
    b[4] = 0x37; // 16+32 + 7 = 55
    b[5] = 0x7e; // 256 * (16+32+64 + 14) = 32256
    // 55 + 32256 = 32311
    assert.equal(decode.uint16(b, 4), 32311);
  });

  it("decodes 0x1e88 as 7816", function () {
    b[6] = 0x88; // 128 + 8 = 136
    b[7] = 0x1e; // 256 * (16 + 14) = 7680
    // 136 + 7680 = 7816
    assert.equal(decode.uint16(b, 6), 7816);
  });
});

describe("float32", function () {
  function float(sign, mantissa, exp) {
    mantissa |= 0x00800000;
    const value = mantissa * Math.pow(2, exp-127-23);
    return sign ? -value : value;
  }

  it("decodes 0x41ceb314 correctly", function () {
    const bytes = 0x41ceb314;
    const sign = (bytes & 0x80000000) >>> 31;
    const exp = (bytes & 0x7f800000) >>> 23;
    const mantissa = bytes & 0x007fffff;
    assert.equal(float(sign, mantissa, exp), decode.float32(bytes));
  });

  it("decodes 0xccae05b8 correctly", function () {
    const bytes = 0xccae05b8;
    const sign = (bytes & 0x80000000) >>> 31;
    const exp = (bytes & 0x7f800000) >>> 23;
    const mantissa = bytes & 0x007fffff;
    assert.equal(float(sign, mantissa, exp), decode.float32(bytes));
  });

  const epsilon = Math.pow(2, -24);

  it("decodes 7263.18's encoding within 32 bit float epsilon", function () {
    const v = 7263.18;
    assert.ok(Math.abs(v - decode.float32(encode.float32(v))) < Math.abs(v*epsilon));
  });

  it("decodes -0.00013727364363's encoding within 32 bit float epsilon", function () {
    const v = -0.00013727364363;
    assert.ok(Math.abs(v - decode.float32(encode.float32(v))) < Math.abs(v*epsilon));
  });

  it("decodes NaN", function () {
    assert.ok(Number.isNaN(decode.float32(encode.float32(NaN))));
  });

  it("decodes Infinity", function () {
    assert.equal(decode.float32(encode.float32(Infinity)), Infinity);
  });

  it("decodes -Infinity", function () {
    assert.equal(decode.float32(encode.float32(-Infinity)), -Infinity);
  });

  //TODO: Test some denormalized bin32 values.
});

describe("float64", function () {
  function float(sign, mantissa, exp) {
    mantissa[0] = mantissa[0] | 0x00100000;
    const value = mantissa[0]*Math.pow(2, exp-1023-52+32) + mantissa[1]*Math.pow(2, exp-1023-52);
    return sign ? -value : value;
  }

  it("decodes 0x3f5e25079030fb9f correctly", function () {
    const bytes = injectI64(0x3f5e2507, 0x9030fb9f);
    const sign = (bytes[0] & 0x80000000) >>> 31;
    const exp = (bytes[0] & 0x7ff00000) >>> 20;
    const mantissa = [bytes[0] & 0x000fffff, bytes[1]];
    assert.equal(float(sign, mantissa, exp), decode.float64(bytes));
  });

  it("decodes 0xc0f42e7777b309b9 correctly", function () {
    const bytes = injectI64(0xc0f42e77, 0x77b309b9);
    const sign = (bytes[0] & 0x80000000) >>> 31;
    const exp = (bytes[0] & 0x7ff00000) >>> 20;
    const mantissa = [bytes[0] & 0x000fffff, bytes[1]];
    assert.equal(float(sign, mantissa, exp), decode.float64(bytes));
  });

  const epsilon = Math.pow(2, -53);

  it("decodes 917364.22238374939's encoding within 64 bit float epsilon", function () {
    const v = 917364.22238374939;
    const e = encode.float64(v);
    assert.ok(Math.abs(v - decode.float64(e)) < Math.abs(v*epsilon));
  });

  it("decodes -0.0001372736436309115210293's encoding within 64 bit float epsilon", function () {
    const v = -0.0001372736436309115210293;
    const e = encode.float64(v);
    assert.ok(Math.abs(v - decode.float64(e)) < Math.abs(v*epsilon));
  });

  it("decodes NaN", function () {
    const e = encode.float64(NaN);
    assert.ok(Number.isNaN(decode.float64(e)));
  });

  it("decodes Infinity", function () {
    const e = encode.float64(Infinity);
    assert.equal(decode.float64(e), Infinity);
  });

  it("decodes -Infinity", function () {
    const e = encode.float64(-Infinity);
    assert.equal(decode.float64(e), -Infinity);
  });

  //TODO: Test some denormalized bin64 values.
});
