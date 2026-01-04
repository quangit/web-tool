export interface ToolItem {
  url: string;
  name: string;
  icon: string;
  description?: string;
  openNewWindow?: boolean;
}

export interface ToolBlock {
  title: string;
  items: ToolItem[];
}

export interface ToolSection {
  title: string;
  blocks: ToolBlock[];
  type: 'system' | 'user';
}

// User-defined card and item interfaces (stored in localStorage)
export interface UserToolItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  url: string;
  openNewWindow: boolean;
}

export interface UserCard {
  id: string;
  title: string;
  items: UserToolItem[];
}

export const toolSections: ToolSection[] = [
  {
    title: 'Tools',
    type: 'system',
    blocks: [
      {
        title: 'Popular tool',
        items: [
          { url: 'qr-code/generator', name: 'QR Code Generator', icon: 'qr-code' },
          { url: 'syntax-highlight', name: 'Syntax Highlight', icon: 'code-2' },
          { url: 's-notes', name: 'S Notes', icon: 'notebook-pen' },
          { url: 'compare', name: 'Compare Files & Folders', icon: 'git-compare' },
          { url: 'calculator', name: 'Calculator', icon: 'calculator' },
        ],
      },
      {
        title: 'Images',
        items: [
          { url: 'image/resize', name: 'Resize Image', icon: 'scale' },
          { url: 'image/optimize', name: 'Optimize Image', icon: 'zap' },
          { url: 'image/crop-rotate', name: 'Crop & Rotate Image', icon: 'crop' },
        ],
      },
    ],
  },
  {
    title: 'Hash',
    type: 'system',
    blocks: [
      { title: 'CRC', items: [{ url: 'hash/crc', name: 'CRC', icon: 'hash' }] },
      {
        title: 'MD',
        items: [
          { url: 'hash/md2', name: 'MD2', icon: 'hash' },
          { url: 'hash/md2_file_hash', name: 'MD2 File', icon: 'file-digit' },
          { url: 'hash/md4', name: 'MD4', icon: 'hash' },
          { url: 'hash/md4_file_hash', name: 'MD4 File', icon: 'file-digit' },
          { url: 'hash/md5', name: 'MD5', icon: 'hash' },
          { url: 'hash/md5_checksum', name: 'MD5 File', icon: 'file-digit' },
        ],
      },
      {
        title: 'SHA1',
        items: [
          { url: 'hash/sha1', name: 'SHA1', icon: 'fingerprint' },
          { url: 'hash/sha1_checksum', name: 'SHA1 File', icon: 'file-badge' },
        ],
      },
      {
        title: 'SHA2',
        items: [
          { url: 'hash/sha224', name: 'SHA224', icon: 'shield' },
          { url: 'hash/sha224_checksum', name: 'SHA224 File', icon: 'file-check' },
          { url: 'hash/sha256', name: 'SHA256', icon: 'shield-check' },
          { url: 'hash/sha256_checksum', name: 'SHA256 File', icon: 'file-check' },
          { url: 'hash/double_sha256', name: 'Double SHA256', icon: 'shield-alert' },
        ],
      },
      {
        title: 'SHA2-512',
        items: [
          { url: 'hash/sha384', name: 'SHA384', icon: 'shield' },
          { url: 'hash/sha384_file_hash', name: 'SHA384 File', icon: 'file-check' },
          { url: 'hash/sha512', name: 'SHA512', icon: 'shield-check' },
          { url: 'hash/sha512_file_hash', name: 'SHA512 File', icon: 'file-check' },
          { url: 'hash/sha512_224', name: 'SHA512/224', icon: 'shield' },
          { url: 'hash/sha512_224_file_hash', name: 'SHA512/224 File', icon: 'file-check' },
          { url: 'hash/sha512_256', name: 'SHA512/256', icon: 'shield-check' },
          { url: 'hash/sha512_256_file_hash', name: 'SHA512/256 File', icon: 'file-check' },
        ],
      },
      {
        title: 'SHA3',
        items: [
          { url: 'hash/sha3_224', name: 'SHA3-224', icon: 'cpu' },
          { url: 'hash/sha3_224_checksum', name: 'SHA3-224 File', icon: 'file-cog' },
          { url: 'hash/sha3_256', name: 'SHA3-256', icon: 'cpu' },
          { url: 'hash/sha3_256_checksum', name: 'SHA3-256 File', icon: 'file-cog' },
          { url: 'hash/sha3_384', name: 'SHA3-384', icon: 'cpu' },
          { url: 'hash/sha3_384_checksum', name: 'SHA3-384 File', icon: 'file-cog' },
          { url: 'hash/sha3_512', name: 'SHA3-512', icon: 'cpu' },
          { url: 'hash/sha3_512_checksum', name: 'SHA3-512 File', icon: 'file-cog' },
        ],
      },
      {
        title: 'Keccak',
        items: [
          { url: 'hash/keccak_224', name: 'Keccak-224', icon: 'box' },
          { url: 'hash/keccak_224_checksum', name: 'Keccak-224 File', icon: 'file-box' },
          { url: 'hash/keccak_256', name: 'Keccak-256', icon: 'box' },
          { url: 'hash/keccak_256_checksum', name: 'Keccak-256 File', icon: 'file-box' },
          { url: 'hash/keccak_384', name: 'Keccak-384', icon: 'box' },
          { url: 'hash/keccak_384_checksum', name: 'Keccak-384 File', icon: 'file-box' },
          { url: 'hash/keccak_512', name: 'Keccak-512', icon: 'box' },
          { url: 'hash/keccak_512_checksum', name: 'Keccak-512 File', icon: 'file-box' },
        ],
      },
      {
        title: 'SHAKE',
        items: [
          { url: 'hash/shake128', name: 'SHAKE128', icon: 'waves' },
          { url: 'hash/shake_128_checksum', name: 'SHAKE128 File', icon: 'file-audio' },
          { url: 'hash/shake256', name: 'SHAKE256', icon: 'waves' },
          { url: 'hash/shake_256_checksum', name: 'SHAKE256 File', icon: 'file-audio' },
        ],
      },
      {
        title: 'cSHAKE',
        items: [
          { url: 'hash/cshake128', name: 'cSHAKE128', icon: 'activity' },
          { url: 'hash/cshake128_file_hash', name: 'cSHAKE128 File', icon: 'file-bar-chart' },
          { url: 'hash/cshake256', name: 'cSHAKE256', icon: 'activity' },
          { url: 'hash/cshake256_file_hash', name: 'cSHAKE256 File', icon: 'file-bar-chart' },
        ],
      },
      {
        title: 'KMAC',
        items: [
          { url: 'hash/kmac128', name: 'KMAC128', icon: 'key' },
          { url: 'hash/kmac128_file_hash', name: 'KMAC128 File', icon: 'file-key' },
          { url: 'hash/kmac256', name: 'KMAC256', icon: 'key' },
          { url: 'hash/kmac256_file_hash', name: 'KMAC256 File', icon: 'file-key' },
        ],
      },
      {
        title: 'RIPEMD',
        items: [
          { url: 'hash/ripemd-128', name: 'RIPEMD-128', icon: 'lock' },
          { url: 'hash/ripemd_128_checksum', name: 'RIPEMD-128 File', icon: 'file-lock' },
          { url: 'hash/ripemd-160', name: 'RIPEMD-160', icon: 'lock' },
          { url: 'hash/ripemd_160_checksum', name: 'RIPEMD-160 File', icon: 'file-lock' },
          { url: 'hash/ripemd-256', name: 'RIPEMD-256', icon: 'lock' },
          { url: 'hash/ripemd_256_checksum', name: 'RIPEMD-256 File', icon: 'file-lock' },
          { url: 'hash/ripemd-320', name: 'RIPEMD-320', icon: 'lock' },
          { url: 'hash/ripemd_320_checksum', name: 'RIPEMD-320 File', icon: 'file-lock' },
        ],
      },
      {
        title: 'BLAKE',
        items: [
          { url: 'hash/blake2b', name: 'BLAKE2b', icon: 'zap' },
          { url: 'hash/blake2b_file_hash', name: 'BLAKE2b File', icon: 'file-output' },
          { url: 'hash/blake2s', name: 'BLAKE2s', icon: 'zap' },
          { url: 'hash/blake2s_file_hash', name: 'BLAKE2s File', icon: 'file-output' },
          { url: 'hash/blake3', name: 'BLAKE3', icon: 'zap' },
          { url: 'hash/blake3_file_hash', name: 'BLAKE3 File', icon: 'file-output' },
        ],
      },
    ],
  },
  {
    title: 'Cryptography',
    type: 'system',
    blocks: [
      {
        title: 'AES',
        items: [
          { url: 'cryptography/aes/encrypt', name: 'Encryption', icon: 'lock' },
          { url: 'cryptography/aes/decrypt', name: 'Decryption', icon: 'unlock' },
        ],
      },
      {
        title: 'DES',
        items: [
          { url: 'cryptography/des/encrypt', name: 'Encryption', icon: 'lock' },
          { url: 'cryptography/des/decrypt', name: 'Decryption', icon: 'unlock' },
        ],
      },
      {
        title: 'Triple DES',
        items: [
          { url: 'cryptography/triple-des/encrypt', name: 'Encryption', icon: 'lock' },
          { url: 'cryptography/triple-des/decrypt', name: 'Decryption', icon: 'unlock' },
        ],
      },
      {
        title: 'RC4',
        items: [
          { url: 'cryptography/rc4/encrypt', name: 'Encryption', icon: 'lock' },
          { url: 'cryptography/rc4/decrypt', name: 'Decryption', icon: 'unlock' },
        ],
      },
      {
        title: 'ECDSA',
        items: [
          { url: 'cryptography/ecdsa/key-generator', name: 'Key Generator', icon: 'key' },
          { url: 'cryptography/ecdsa/sign', name: 'Sign Message', icon: 'pen-tool' },
          { url: 'cryptography/ecdsa/verify', name: 'Verify Signature', icon: 'check-circle' },
        ],
      },
      {
        title: 'RSA',
        items: [
          { url: 'cryptography/rsa/key-generator', name: 'Key Generator', icon: 'key' },
          { url: 'cryptography/rsa/sign', name: 'Sign Message', icon: 'pen-tool' },
          { url: 'cryptography/rsa/verify', name: 'Verify Signature', icon: 'check-circle' },
          { url: 'cryptography/rsa/encrypt', name: 'Encryption', icon: 'lock' },
          { url: 'cryptography/rsa/decrypt', name: 'Decryption', icon: 'unlock' },
        ],
      },
      {
        title: 'JWT',
        items: [
          { url: 'cryptography/jwt/decoder', name: 'JWT Decoder', icon: 'scan-search' },
          { url: 'cryptography/jwt/encoder', name: 'JWT Encoder', icon: 'file-key' },
          { url: 'cryptography/jwt/libraries', name: 'JWT Libraries', icon: 'book-open' },
        ],
      },
    ],
  },
  {
    title: 'Encoding',
    type: 'system',
    blocks: [
      {
        title: 'Hex (Base16)',
        items: [
          { url: 'encoding/hex_encode', name: 'Encode', icon: 'binary' },
          { url: 'encoding/hex_decode', name: 'Decode', icon: 'code' },
          { url: 'encoding/hex_encode_file', name: 'File to Hex', icon: 'file-code' },
          { url: 'encoding/hex_decode_file', name: 'Hex to File', icon: 'file-output' },
        ],
      },
      {
        title: 'Base32',
        items: [
          { url: 'encoding/base32_encode', name: 'Encode', icon: 'binary' },
          { url: 'encoding/base32_decode', name: 'Decode', icon: 'code' },
          { url: 'encoding/base32_encode_file', name: 'File to Base32', icon: 'file-code' },
          { url: 'encoding/base32_decode_file', name: 'Base32 to File', icon: 'file-output' },
        ],
      },
      {
        title: 'Base58',
        items: [
          { url: 'encoding/base58/encode', name: 'Encode', icon: 'binary' },
          { url: 'encoding/base58/decode', name: 'Decode', icon: 'code' },
          { url: 'encoding/base58/encode/file', name: 'File to Base58', icon: 'file-code' },
          { url: 'encoding/base58/decode/file', name: 'Base58 to File', icon: 'file-output' },
        ],
      },
      {
        title: 'Base64',
        items: [
          { url: 'encoding/base64_encode', name: 'Encode', icon: 'binary' },
          { url: 'encoding/base64_decode', name: 'Decode', icon: 'code' },
          { url: 'encoding/base64_encode_file', name: 'File to Base64', icon: 'file-code' },
          { url: 'encoding/base64_decode_file', name: 'Base64 to File', icon: 'file-output' },
        ],
      },
      {
        title: 'HTML',
        items: [
          { url: 'encoding/html_encode', name: 'Encode', icon: 'code' },
          { url: 'encoding/html_decode', name: 'Decode', icon: 'code' },
        ],
      },
      {
        title: 'URL',
        items: [
          { url: 'encoding/url_encode', name: 'Encode', icon: 'link' },
          { url: 'encoding/url_decode', name: 'Decode', icon: 'link-2' },
        ],
      },
    ],
  },
  {
    title: 'Format',
    type: 'system',
    blocks: [
      {
        title: 'JSON',
        items: [
          { url: 'json/validator', name: 'Validator', icon: 'check' },
          { url: 'json/minifier', name: 'Minifier', icon: 'minimize-2' },
          { url: 'json/formatter', name: 'Formatter', icon: 'align-left' },
          { url: 'json/viewer', name: 'Viewer', icon: 'eye' },
        ],
      },
      {
        title: 'XML',
        items: [
          { url: 'xml/validator', name: 'Validator', icon: 'check' },
          { url: 'xml/minifier', name: 'Minifier', icon: 'minimize-2' },
          { url: 'xml/formatter', name: 'Formatter', icon: 'align-left' },
        ],
      },
      {
        title: 'SQL',
        items: [{ url: 'sql/formatter', name: 'Formatter', icon: 'database' }],
      },
    ],
  },
  {
    title: 'Convert',
    type: 'system',
    blocks: [
      {
        title: 'Case',
        items: [
          { url: 'convert/case/lower', name: 'lower case', icon: 'type' },
          { url: 'convert/case/upper', name: 'UPPER CASE', icon: 'type' },
          { url: 'convert/case/lower-camel', name: 'lowerCamelCase', icon: 'type' },
          { url: 'convert/case/upper-camel', name: 'UpperCamelCase', icon: 'type' },
          { url: 'convert/case/snake', name: 'snake_case', icon: 'type' },
          { url: 'convert/case/kebab', name: 'kebab-case', icon: 'type' },
          { url: 'convert/case/constant', name: 'CONSTANT_CASE', icon: 'type' },
        ],
      },
      {
        title: 'Unit',
        items: [
          { url: 'convert/unit/weight', name: 'Weight converter', icon: 'scale' },
          { url: 'convert/unit/length', name: 'Length converter', icon: 'ruler' },
          { url: 'convert/unit/temperature', name: 'Temperature converter', icon: 'thermometer' },
        ],
      },
      {
        title: 'Currency',
        items: [{ url: 'convert/currency', name: 'Currency Converter', icon: 'banknote' }],
      },
    ],
  },
  {
    title: 'Info',
    type: 'system',
    blocks: [
      {
        title: 'About',
        items: [{ url: 'about', name: 'About', icon: 'info' }],
      },
    ],
  },
];
