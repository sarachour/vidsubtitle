#!/usr/bin/python

from range_http_request_handler import *
import SocketServer
import BaseHTTPServer

PORT = 8080

httpd = BaseHTTPServer.HTTPServer(("localhost", PORT), RangeHTTPRequestHandler)

print "serving at port", PORT
httpd.serve_forever()
