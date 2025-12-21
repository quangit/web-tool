export interface ToolItem {
  url: string;
  name: string;
}

export interface ToolBlock {
  title: string;
  items: ToolItem[];
}

export interface ToolSection {
  title: string;
  blocks: ToolBlock[];
}

export const toolSections: ToolSection[] = [
  {
    title: "Hash",
    blocks: [
      { title: "CRC", items: [{ url: "hash/crc", name: "CRC" }] },
      {
        title: "MD",
        items: [
          { url: "hash/md2", name: "MD2" },
          { url: "hash/md2_file_hash", name: "MD2 File" },
          { url: "hash/md4", name: "MD4" },
          { url: "hash/md4_file_hash", name: "MD4 File" },
          { url: "hash/md5", name: "MD5" },
          { url: "hash/md5_checksum", name: "MD5 File" },
        ],
      },
      {
        title: "SHA1",
        items: [
          { url: "hash/sha1", name: "SHA1" },
          { url: "hash/sha1_checksum", name: "SHA1 File" },
        ],
      },
      {
        title: "SHA2",
        items: [
          { url: "hash/sha224", name: "SHA224" },
          { url: "hash/sha224_checksum", name: "SHA224 File" },
          { url: "hash/sha256", name: "SHA256" },
          { url: "hash/sha256_checksum", name: "SHA256 File" },
          { url: "hash/double_sha256", name: "Double SHA256" },
        ],
      },
      {
        title: "SHA2-512",
        items: [
          { url: "hash/sha384", name: "SHA384" },
          { url: "hash/sha384_file_hash", name: "SHA384 File" },
          { url: "hash/sha512", name: "SHA512" },
          { url: "hash/sha512_file_hash", name: "SHA512 File" },
          { url: "hash/sha512_224", name: "SHA512/224" },
          { url: "hash/sha512_224_file_hash", name: "SHA512/224 File" },
          { url: "hash/sha512_256", name: "SHA512/256" },
          { url: "hash/sha512_256_file_hash", name: "SHA512/256 File" },
        ],
      },
      {
        title: "SHA3",
        items: [
          { url: "hash/sha3_224", name: "SHA3-224" },
          { url: "hash/sha3_224_checksum", name: "SHA3-224 File" },
          { url: "hash/sha3_256", name: "SHA3-256" },
          { url: "hash/sha3_256_checksum", name: "SHA3-256 File" },
          { url: "hash/sha3_384", name: "SHA3-384" },
          { url: "hash/sha3_384_checksum", name: "SHA3-384 File" },
          { url: "hash/sha3_512", name: "SHA3-512" },
          { url: "hash/sha3_512_checksum", name: "SHA3-512 File" },
        ],
      },
      {
        title: "Keccak",
        items: [
          { url: "hash/keccak_224", name: "Keccak-224" },
          { url: "hash/keccak_224_checksum", name: "Keccak-224 File" },
          { url: "hash/keccak_256", name: "Keccak-256" },
          { url: "hash/keccak_256_checksum", name: "Keccak-256 File" },
          { url: "hash/keccak_384", name: "Keccak-384" },
          { url: "hash/keccak_384_checksum", name: "Keccak-384 File" },
          { url: "hash/keccak_512", name: "Keccak-512" },
          { url: "hash/keccak_512_checksum", name: "Keccak-512 File" },
        ],
      },
      {
        title: "SHAKE",
        items: [
          { url: "hash/shake128", name: "SHAKE128" },
          { url: "hash/shake_128_checksum", name: "SHAKE128 File" },
          { url: "hash/shake256", name: "SHAKE256" },
          { url: "hash/shake_256_checksum", name: "SHAKE256 File" },
        ],
      },
      {
        title: "cSHAKE",
        items: [
          { url: "hash/cshake128", name: "cSHAKE128" },
          { url: "hash/cshake128_file_hash", name: "cSHAKE128 File" },
          { url: "hash/cshake256", name: "cSHAKE256" },
          { url: "hash/cshake256_file_hash", name: "cSHAKE256 File" },
        ],
      },
      {
        title: "KMAC",
        items: [
          { url: "hash/kmac128", name: "KMAC128" },
          { url: "hash/kmac128_file_hash", name: "KMAC128 File" },
          { url: "hash/kmac256", name: "KMAC256" },
          { url: "hash/kmac256_file_hash", name: "KMAC256 File" },
        ],
      },
      {
        title: "RIPEMD",
        items: [
          { url: "hash/ripemd-128", name: "RIPEMD-128" },
          { url: "hash/ripemd_128_checksum", name: "RIPEMD-128 File" },
          { url: "hash/ripemd-160", name: "RIPEMD-160" },
          { url: "hash/ripemd_160_checksum", name: "RIPEMD-160 File" },
          { url: "hash/ripemd-256", name: "RIPEMD-256" },
          { url: "hash/ripemd_256_checksum", name: "RIPEMD-256 File" },
          { url: "hash/ripemd-320", name: "RIPEMD-320" },
          { url: "hash/ripemd_320_checksum", name: "RIPEMD-320 File" },
        ],
      },
      {
        title: "BLAKE",
        items: [
          { url: "hash/blake2b", name: "BLAKE2b" },
          { url: "hash/blake2b_file_hash", name: "BLAKE2b File" },
          { url: "hash/blake2s", name: "BLAKE2s" },
          { url: "hash/blake2s_file_hash", name: "BLAKE2s File" },
          { url: "hash/blake3", name: "BLAKE3" },
          { url: "hash/blake3_file_hash", name: "BLAKE3 File" },
        ],
      },
    ],
  },
  {
    title: "Cryptography",
    blocks: [
      {
        title: "AES",
        items: [
          { url: "cryptography/aes/encrypt", name: "Encryption" },
          { url: "cryptography/aes/decrypt", name: "Decryption" },
        ],
      },
      {
        title: "DES",
        items: [
          { url: "cryptography/des/encrypt", name: "Encryption" },
          { url: "cryptography/des/decrypt", name: "Decryption" },
        ],
      },
      {
        title: "Triple DES",
        items: [
          { url: "cryptography/triple-des/encrypt", name: "Encryption" },
          { url: "cryptography/triple-des/decrypt", name: "Decryption" },
        ],
      },
      {
        title: "RC4",
        items: [
          { url: "cryptography/rc4/encrypt", name: "Encryption" },
          { url: "cryptography/rc4/decrypt", name: "Decryption" },
        ],
      },
      {
        title: "ECDSA",
        items: [
          { url: "cryptography/ecdsa/key-generator", name: "Key Generator" },
          { url: "cryptography/ecdsa/sign", name: "Sign Message" },
          { url: "cryptography/ecdsa/verify", name: "Verify Signature" },
        ],
      },
      {
        title: "RSA",
        items: [
          { url: "cryptography/rsa/key-generator", name: "Key Generator" },
          { url: "cryptography/rsa/sign", name: "Sign Message" },
          { url: "cryptography/rsa/verify", name: "Verify Signature" },
          { url: "cryptography/rsa/encrypt", name: "Encryption" },
          { url: "cryptography/rsa/decrypt", name: "Decryption" },
        ],
      },
    ],
  },
  {
    title: "Encoding",
    blocks: [
      {
        title: "Hex (Base16)",
        items: [
          { url: "encoding/hex_encode", name: "Encode" },
          { url: "encoding/hex_decode", name: "Decode" },
          { url: "encoding/hex_encode_file", name: "File to Hex" },
          { url: "encoding/hex_decode_file", name: "Hex to File" },
        ],
      },
      {
        title: "Base32",
        items: [
          { url: "encoding/base32_encode", name: "Encode" },
          { url: "encoding/base32_decode", name: "Decode" },
          { url: "encoding/base32_encode_file", name: "File to Base32" },
          { url: "encoding/base32_decode_file", name: "Base32 to File" },
        ],
      },
      {
        title: "Base58",
        items: [
          { url: "encoding/base58/encode", name: "Encode" },
          { url: "encoding/base58/decode", name: "Decode" },
          { url: "encoding/base58/encode/file", name: "File to Base58" },
          { url: "encoding/base58/decode/file", name: "Base58 to File" },
        ],
      },
      {
        title: "Base64",
        items: [
          { url: "encoding/base64_encode", name: "Encode" },
          { url: "encoding/base64_decode", name: "Decode" },
          { url: "encoding/base64_encode_file", name: "File to Base64" },
          { url: "encoding/base64_decode_file", name: "Base64 to File" },
        ],
      },
      {
        title: "HTML",
        items: [
          { url: "encoding/html_encode", name: "Encode" },
          { url: "encoding/html_decode", name: "Decode" },
        ],
      },
      {
        title: "URL",
        items: [
          { url: "encoding/url_encode", name: "Encode" },
          { url: "encoding/url_decode", name: "Decode" },
        ],
      },
    ],
  },
  {
    title: "Format",
    blocks: [
      {
        title: "JSON",
        items: [
          { url: "json/validator", name: "Validator" },
          { url: "json/minifier", name: "Minifier" },
          { url: "json/formatter", name: "Formatter" },
          { url: "json/viewer", name: "Viewer" },
        ],
      },
      {
        title: "XML",
        items: [
          { url: "xml/validator/", name: "Validator" },
          { url: "xml/minifier/", name: "Minifier" },
          { url: "xml/formatter/", name: "Formatter" },
        ],
      },
      {
        title: "SQL",
        items: [{ url: "sql/formatter/", name: "Formatter" }],
      },
    ],
  },
  {
    title: "Convert",
    blocks: [
      {
        title: "Case",
        items: [
          { url: "case/lower/", name: "lower case" },
          { url: "case/upper/", name: "UPPER CASE" },
          { url: "case/lower-camel/", name: "lowerCamelCase" },
          { url: "case/upper-camel/", name: "UpperCamelCase" },
          { url: "case/snake/", name: "snake_case" },
          { url: "case/kebab/", name: "kebab-case" },
          { url: "case/constant/", name: "CONSTANT_CASE" },
        ],
      },
    ],
  },
  {
    title: "Others",
    blocks: [
      {
        title: "Others",
        items: [
          { url: "qr-code/generator/", name: "QR Code Generator" },
          { url: "syntax-highlight/", name: "Syntax Highlight" },
        ],
      },
    ],
  },
];
