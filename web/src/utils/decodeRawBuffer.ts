import {_CodecsRegistry} from "edgedb";
import {QueryArgs} from "edgedb/dist/ifaces";
import {NamedTupleCodec} from "edgedb/dist/codecs/namedtuple";
import {TupleCodec} from "edgedb/dist/codecs/tuple";
import {decode as _decode, EdgeDBSet} from "@edgedb/common/decodeRawBuffer";

export type {EdgeDBSet};

function newCodecsRegistry() {
  const registry = new _CodecsRegistry();
  registry.setStringCodecs({
    decimal: true,
    int64: true,
    datetime: true,
    local_datetime: true,
  });
  return registry;
}

export const codecsRegistry = newCodecsRegistry();

export function decode(
  outCodecBuf: Uint8Array,
  resultBuf: Uint8Array,
  newCodec: boolean = false
): EdgeDBSet | null {
  return _decode(
    newCodec ? newCodecsRegistry() : codecsRegistry,
    typedArrayToBuffer(outCodecBuf),
    typedArrayToBuffer(resultBuf),
    [0, 13]
  );
}

export type QueryParams = QueryArgs;

export function encodeArgs(inCodecBuf: Uint8Array, queryParams: QueryParams) {
  const inCodec = codecsRegistry.buildCodec(
    typedArrayToBuffer(inCodecBuf),
    [0, 13]
  );

  if (!(inCodec instanceof NamedTupleCodec || inCodec instanceof TupleCodec)) {
    throw new Error("Invalid input codec");
  }

  return inCodec.encodeArgs(queryParams);
}

function typedArrayToBuffer(arr: Uint8Array): Buffer {
  let buf = Buffer.from(arr.buffer);
  if (arr.byteLength !== arr.buffer.byteLength) {
    buf = buf.slice(arr.byteOffset, arr.byteOffset + arr.byteLength);
  }
  return buf;
}
