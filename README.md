# data-communication-project
# Message Transmission with Error Detection and Correction

This project demonstrates a **message transmission system** using **TCP sockets**, supporting **error detection and correction** methods. It includes:

- **Two clients**: Python and JavaScript
- **Error detection/correction methods**: Parity, Checksum, 2DPARITY, CRC-16, Hamming (12,8)
- **Ability to detect and correct errors in messages**
- **Real-time sending and receiving of messages** between clients

---

## Features

- **Message transmission between two clients via a server**
- **Error detection**:
  - Parity
  - Checksum
  - CRC-16
  - 2DPARITY
- **Error correction**:
  - Hamming code (12,8)
- **Cross-language support**:
  - Python client
  - JavaScript (Node.js) client
- **Simulated message corruption** on the server to test error detection/correction
- **Dynamic prompt**: The input prompt is always visible after sending or receiving messages

---

## Architecture

```
   +-----------------+          +-----------------+          +-----------------+
   | Python Client   | <------> |      Server     | <------> | Python      |
   |                 |          | (Corrupt/Relay) |          | Client      |
   +-----------------+          +-----------------+          +-----------------+
           |                              |                              |
           |           TCP Socket         |          TCP Socket          |
           |                              |                              |
           |   Parity / Checksum / CRC    |   Hamming error correction    |
           +------------------------------+------------------------------+
```

---

## Installation

### Server (Python)
```bash
python server.py
```

### Python Client
```bash
python client.py
```

### JavaScript Client (Node.js)
```bash
node client.js
```

---

## Usage

1. Run the **server** first.
2. Start **two clients** (Python and JS, or two Python clients).
3. Each client can send messages with a selected **error method**.
4. The server may **corrupt messages** to simulate transmission errors.
5. The receiving client will:
   - Display received message
   - Detect errors
   - Correct errors if Hamming method is used

---

## Example Output

**Python Client:**
```
Enter message to send (or type EXIT to quit): Hi
Select method:
1. PARITY
2. CRC
3. CHECKSUM
4. 2DPARITY
5. HAMMING (can correct errors)
> 5

Received Data (before correction): H
Method: HAMMING
Error detected and corrected
Corrected Data: Hi
Enter message to send (or type EXIT to quit):
```

**JavaScript Client:**
```
Method: CHECKSUM
Received Data: Hello
DATA CORRECT
Enter message to send (or type EXIT to quit):
```

---

## Error Methods

### Parity
- Detects single-bit errors.
- Generates a control bit (0 or 1) based on the number of 1s.

### Checksum
- Sum of all ASCII values modulo 16-bit.
- Detects most simple transmission errors.

### 2D Parity  
- Two-dimensional parity (rows + columns).  
- Can detect multiple-bit errors and locate single-bit errors.

### CRC-16
- Cyclic Redundancy Check.
- Detects multiple-bit errors.

### Hamming (12,8)
- Detects and corrects **single-bit errors**.
- Data is encoded into 12-bit codewords.

---

## Notes

- Server can randomly **flip bits** in messages to simulate transmission errors.
- The system supports **cross-language communication** between Python and JS clients.
- The input prompt is **reprinted after sending/receiving messages** for usability.

---

## Folder Structure

```
project/
