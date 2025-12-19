
import random
import zlib

def parity_bits(data):
    bits = ''.join(format(ord(c), '08b') for c in data)
    return str(bits.count('1') % 2)

# ---------------- 2D PARITY ----------------
def parity_2d(data):
    matrix = [format(ord(c), '08b') for c in data]
    row_parity = [str(row.count('1') % 2) for row in matrix]
    col_parity = []
    for i in range(8):
        col = ''.join(row[i] for row in matrix)
        col_parity.append(str(col.count('1') % 2))
    return ''.join(row_parity) + '|' + ''.join(col_parity)

# ---------------- CRC16 ----------------
def crc16(data):
    return format(zlib.crc32(data.encode()) & 0xFFFF, '04X')

# ---------------- CHECKSUM ----------------
def checksum(data):
    s = sum(ord(c) for c in data)
    return format((~s) & 0xFFFF, '04X')

# ---------------- HAMMING ----------------
def hamming_encode(data):
    bits = ''.join(format(ord(c), '08b') for c in data)
    encoded = ''
    for i in range(0, len(bits), 4):
        d = bits[i:i+4].ljust(4, '0')
        d1, d2, d3, d4 = map(int, d)
        p1 = d1 ^ d2 ^ d4
        p2 = d1 ^ d3 ^ d4
        p3 = d2 ^ d3 ^ d4
        encoded += f"{p1}{p2}{d1}{p3}{d2}{d3}{d4}"
    return encoded

def hamming_decode_no_correction(bits):
    decoded = ''
    for i in range(0, len(bits), 7):
        b = list(map(int, bits[i:i+7]))
        # extract data bits only (no fixing)
        decoded += ''.join(map(str, [b[2], b[4], b[5], b[6]]))

    text = ''
    for i in range(0, len(decoded), 8):
        text += chr(int(decoded[i:i+8], 2))
    return text


def hamming_decode(bits):
    corrected = ''
    error_found = False
    for i in range(0, len(bits), 7):
        b = list(map(int, bits[i:i+7]))
        p1, p2, d1, p3, d2, d3, d4 = b
        c1 = p1 ^ d1 ^ d2 ^ d4
        c2 = p2 ^ d1 ^ d3 ^ d4
        c3 = p3 ^ d2 ^ d3 ^ d4
        error_pos = c1*1 + c2*2 + c3*4
        if error_pos:
            error_found = True
            b[error_pos-1] ^= 1
        corrected += ''.join(map(str, [b[2], b[4], b[5], b[6]]))
    text = ''
    for i in range(0, len(corrected), 8):
        text += chr(int(corrected[i:i+8], 2))
    return text, error_found

# ---------------- GENERATOR ----------------
def generate(data, method):
    if method == 'PARITY': return parity_bits(data)
    if method == '2DPARITY': return parity_2d(data)
    if method == 'CRC': return crc16(data)
    if method == 'CHECKSUM': return checksum(data)
    if method == 'HAMMING': return hamming_encode(data)

# ---------------- VERIFY ----------------
def verify(data, method, incoming):
    if method == 'HAMMING':
        fixed, error = hamming_decode(incoming)
        return fixed, error
    else:
        computed = generate(data, method)
        return computed == incoming, None
