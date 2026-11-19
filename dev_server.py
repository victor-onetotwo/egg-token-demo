"""เซิร์ฟเวอร์เล็ก ๆ สำหรับเปิดเกมตอนพัฒนา

ใช้: python dev_server.py [พอร์ต]   แล้วเปิด http://localhost:8777
ส่ง Cache-Control: no-store ทุกไฟล์ เพื่อให้แก้โค้ดแล้วรีเฟรชเห็นผลทันที
"""
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, max-age=0")
        self.send_header("Pragma", "no-cache")
        super().end_headers()

    def log_message(self, fmt, *args):
        pass


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8777
    handler = partial(NoCacheHandler, directory=".")
    with ThreadingHTTPServer(("127.0.0.1", port), handler) as httpd:
        print("Egg Token demo: http://localhost:%d" % port)
        httpd.serve_forever()


if __name__ == "__main__":
    main()
