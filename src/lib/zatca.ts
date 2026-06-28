/**
 * ZATCA Phase 1 E-Invoicing QR Code Generator (Saudi Arabia)
 * Encodes invoice details in Tag-Length-Value (TLV) format and returns a Base64 string.
 */
export function generateZatcaQr(
  sellerName: string,
  vatNumber: string,
  timestamp: string,
  totalAmount: number | string,
  vatAmount: number | string
): string {
  const encoder = new TextEncoder();

  const getTlvChunk = (tag: number, val: string): Uint8Array => {
    const valBytes = encoder.encode(val);
    const tagByte = tag;
    const lenByte = valBytes.length;

    const chunk = new Uint8Array(2 + lenByte);
    chunk[0] = tagByte;
    chunk[1] = lenByte;
    chunk.set(valBytes, 2);
    return chunk;
  };

  // Convert inputs to expected formats
  const formattedTotal = Number(totalAmount).toFixed(2);
  const formattedVat = Number(vatAmount).toFixed(2);

  // Tags description:
  // 1: Seller Name
  // 2: Seller VAT Number (15 digits)
  // 3: Invoice Timestamp (ISO 8601 e.g. YYYY-MM-DDTHH:mm:ssZ)
  // 4: Invoice Total (with VAT)
  // 5: VAT Total
  const c1 = getTlvChunk(1, sellerName);
  const c2 = getTlvChunk(2, vatNumber);
  const c3 = getTlvChunk(3, timestamp);
  const c4 = getTlvChunk(4, formattedTotal);
  const c5 = getTlvChunk(5, formattedVat);

  // Merge chunks
  const totalLength = c1.length + c2.length + c3.length + c4.length + c5.length;
  const merged = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of [c1, c2, c3, c4, c5]) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }

  // Convert Uint8Array to Base64 (browser & Node friendly)
  let binary = '';
  const len = merged.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(merged[i]);
  }

  // Safe btoa fallback for environments
  if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
    return window.btoa(binary);
  }
  return Buffer.from(merged).toString('base64');
}
