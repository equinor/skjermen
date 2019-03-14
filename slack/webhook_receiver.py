import atexit
import cgi
import collections
import json
import os
import threading

from http import HTTPStatus
from http.server import HTTPServer, BaseHTTPRequestHandler

slack_messages = collections.deque([], 50)


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
            form = cgi.FieldStorage(fp=self.rfile, headers=self.headers, environ={'REQUEST_METHOD':'POST', 'CONTENT_TYPE':self.headers['Content-Type']})
            if form['token'].value == os.environ['slackApiToken'] and form['user_name'] != 'skjermen-outgoing-webhook' and form['user_name'] != 'slackbot':
                self.add_message_to_skjermen(form['text'].value)
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
            else:
                self.send_response(HTTPStatus.FORBIDDEN)
        else:
            self.send_response(HTTPStatus.NOT_FOUND)
            print("POST 404")


server_address = ('', 9000)
server = HTTPServer(server_address, SlackHttpResponder)

thread = threading.Thread(target = server.serve_forever)
thread.daemon = False
thread.start()

atexit.register(server.socket.close)
