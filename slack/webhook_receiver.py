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
            self.wfile.write(json.dumps([message for message in slack_messages]).encode('utf-8'))
            print(slack_messages)
        else:
            self.send_response(HTTPStatus.NOT_FOUND)
            print("GET 404")

    def do_POST(self):
        if self.path == '/api/slack/new' or self.path == '/api/slack/new/':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            input_json = json.loads(post_data.decode('utf-8'))

            if input_json['token'] != os.getenv('slackApiToken'):
                self.send_response(HTTPStatus.FORBIDDEN)
                print("Forbidden")
                return

            self.add_message_to_skjermen(input_json['text'])
            self.send_response(HTTPStatus.OK)
            self.wfile.write(json.dumps({"text": "Thank you!"}))
            print(slack_messages)
        else:
            self.send_response(HTTPStatus.NOT_FOUND)
            print("POST 404")


print("Hello?")
server_address = ('', 9000)
server = HTTPServer(server_address, SlackHttpResponder)

thread = threading.Thread(target = server.serve_forever)
thread.daemon = False
thread.start()

atexit.register(server.socket.close)
