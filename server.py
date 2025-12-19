
import socket
import random
import threading

HOST = '127.0.0.1'
PORT = 5000

s = socket.socket()
s.bind((HOST, PORT))
s.listen(2)
print('Server running...')

clients = []

def handle_client(conn, other_conn):
    buffer = ''
    while True:
        try:
            chunk = conn.recv(4096).decode()
            if not chunk:
                break

            buffer += chunk

            while '\n' in buffer:
                packet, buffer = buffer.split('\n', 1)
                if not packet:
                    continue

                data, method, control = packet.split('|', 2)

                if method == 'HAMMING':
                    bits = list(control)
                    i = random.randint(0, len(bits) - 1)
                    bits[i] = '1' if bits[i] == '0' else '0'
                    control = ''.join(bits)
                    print(f'Hamming bit flipped at position {i+1}')
                else:
                    if len(data) > 0:
                        i = random.randint(0, len(data) - 1)
                        corrupted_char = chr(random.randint(65, 90))
                        data = data[:i] + corrupted_char + data[i+1:]
                        print(f'Text corrupted at position {i+1}')

                new_packet = f"{data}|{method}|{control}\n"
                other_conn.send(new_packet.encode())

        except Exception as e:
            print('Server error:', e)
            break


conn1, _ = s.accept()
print('Client 1 connected')
conn2, _ = s.accept()
print('Client 2 connected')

threading.Thread(target=handle_client, args=(conn1, conn2), daemon=True).start()
threading.Thread(target=handle_client, args=(conn2, conn1), daemon=True).start()

try:
    while True:
        pass
except KeyboardInterrupt:
    conn1.close()
    conn2.close()
    s.close()
