
import socket
import threading
from error_methods import generate, verify, hamming_decode_no_correction

METHODS = {
    '1': 'PARITY',
    '2': '2DPARITY',
    '3': 'CRC',
    '4': 'CHECKSUM',
    '5': 'HAMMING'
}


HOST = '127.0.0.1'
PORT = 5000

s = socket.socket()
s.connect((HOST, PORT))

buffer = ''

def receive_messages():
    global buffer
    while True:
        try:
            chunk = s.recv(4096).decode()
            if not chunk:
                break
            buffer += chunk
            while '\n' in buffer:
                packet, buffer = buffer.split('\n', 1)
                if not packet:
                    continue
                data, method, control = packet.split('|', 2)


                if method == 'HAMMING':
                    raw_text = hamming_decode_no_correction(control)
                    print('\nReceived Data (before correction):', raw_text)
                    print('Method:', method)
                    fixed, error = verify(data, method, control)
                    if error:
                        print('Error detected and corrected')
                        print('Corrected Data:', fixed)
                    else:
                        print('No error detected')
                else:
                    print('\nReceived Data:', data)
                    print('Method:', method)
                    status, _ = verify(data, method, control)
                    print('Status:', 'DATA CORRECT' if status else 'DATA CORRUPTED')

                print('\nEnter message to send (or type EXIT to quit): ', end='', flush=True)
        except:
            break



threading.Thread(target=receive_messages, daemon=True).start()


while True:
    msg = input('\nEnter message to send (or type EXIT to quit): ')
    if msg.upper() == 'EXIT':
        break

    print('\nSelect method:')
    print('1. PARITY')
    print('2. 2DPARITY')
    print('3. CRC')
    print('4. CHECKSUM')
    print('5. HAMMING (can correct errors)')

    choice = input('> ').strip()

    if choice not in METHODS:
        print('Invalid choice, try again.')
        continue

    method = METHODS[choice]
    control = generate(msg, method)
    packet = f"{msg}|{method}|{control}\n"
    s.send(packet.encode())


s.close()
