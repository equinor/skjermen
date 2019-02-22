FROM nginx:latest

# Copy the nginx configuration file.
COPY nginx.conf /etc/nginx/nginx.conf

# Test the configuration file
RUN nginx -t

# Copy the web site contents
COPY contents /app/contents
