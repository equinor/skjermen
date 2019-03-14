import atexit
import collections
import json
import os
import threading
from urllib.parse import urlparse, parse_qs

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
        print(self.path)
        if self.path.startswith('/api/slack/new?'):
            query_components = parse_qs(urlparse(self.path).query)
            token = query_components['token'][0]
            print(token)

            if token != os.getenv('slackApiToken'):
                self.send_response(HTTPStatus.FORBIDDEN)
                print("Forbidden")
                return

            self.add_message_to_skjermen(query_components['text'][0])
            self.send_response(HTTPStatus.OK)
            self.wfile.write(json.dumps({"text": "Thank you!"}).encode('utf-8'))
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
