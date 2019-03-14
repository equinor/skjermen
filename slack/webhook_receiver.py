import atexit
import collections
import json
import os
import threading

from http import HTTPStatus
from http.server import HTTPServer, BaseHTTPRequestHandler

slack_messages = collections.deque(["o hai"], 10)


class SlackHttpResponder(BaseHTTPRequestHandler):

    def add_message_to_skjermen(self, message):
        global slack_messages
        slack_messages.appendleft(message)
        print(message)

    def do_GET(self):
        global slack_messages
        if self.path == '/api/slack/list':
            self.send_response(HTTPStatus.OK)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps([message for message in slack_messages]).encode('utf-8'))
            print(slack_messages)
        else:
            self.send_response(HTTPStatus.NOT_FOUND)
            print("GET 404")

    def do_POST(self):
        print(self.path)
        if self.path == '/api/slack/new':
            content_len = int(self.headers.get('Content-Length'))
            post_body = self.rfile.read(content_len).decode('utf-8')

            has_token = False
            for line in post_body.split('\n'):
                arr = line.split("=")
                key = arr[0]
                value = "".join(arr[1:])
                if key == 'token' and value == os.environ['slackApiToken']:
                    has_token = True
                if key == 'text' and has_token:
                    self.add_message_to_skjermen(value)

            if has_token:
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.send_response(HTTPStatus.OK)
                self.wfile.write(json.dumps({"text": "Thank you!"}).encode('utf-8'))
            else:
                self.send_response(HTTPStatus.FORBIDDEN)
        else:
            self.send_response(HTTPStatus.NOT_FOUND)
            print("POST 404")


print(os.environ)
server_address = ('', 9000)
server = HTTPServer(server_address, SlackHttpResponder)

thread = threading.Thread(target = server.serve_forever)
thread.daemon = False
thread.start()

atexit.register(server.socket.close)
