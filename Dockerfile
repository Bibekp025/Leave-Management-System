FROM python:3.11-slim

# Set working directory inside the container
WORKDIR /app/backend

# Copy all files into the container
COPY . /app/

# Install Python dependencies
RUN pip install --upgrade pip && pip install -r /app/requirements.txt

# Run Django development server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
