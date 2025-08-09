set BACKEND_API_HOST=http://localhost:8082

java -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=0.0.0.0:5005 -jar build\libs\bff-app.jar

set BACKEND_API_HOST=
