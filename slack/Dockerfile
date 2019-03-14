FROM python:latest

WORKDIR /app
COPY webhook_receiver.py webhook_receiver.py

EXPOSE 9000
CMD ["python", "webhook_receiver.py"]
