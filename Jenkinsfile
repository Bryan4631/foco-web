// CI/CD del frontend de Foco (React + Vite) para jenkins.frubilarz.cl.
//
// El servidor Jenkins tiene un solo executor y Docker disponible. Lint y build (npm ci +
// oxlint + vite build) corren dentro del Dockerfile (multi-stage), asi que no hace falta
// Node en Jenkins.
//
// Flujo:
//   Checkout -> Lint -> Build image (compila la SPA; falla si el build de Vite falla)
//   (solo rama `production`) -> Deploy -> Health Check
//
// Produccion: el contenedor se publica en 127.0.0.1:4109 y el reverse proxy del servidor
// (Nginx + Certbot) expone https://focoweb.frubilarz.cl hacia ese puerto.
// La API vive en https://apifoco.frubilarz.cl (VITE_API_URL se incrusta al compilar).
pipeline {
    agent any

    options {
        disableConcurrentBuilds()
        timeout(time: 20, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '20'))
    }

    environment {
        APP_NAME    = 'foco-web'
        DEPLOY_PORT = '4109'
        PUBLIC_URL  = 'https://focoweb.frubilarz.cl'
        API_URL     = 'https://apifoco.frubilarz.cl/api/v1'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    def safeBranch = env.BRANCH_NAME.replaceAll(/[^A-Za-z0-9_.-]/, '-').toLowerCase()
                    env.SAFE_BRANCH = safeBranch
                    env.IMAGE_TAG   = "${APP_NAME}:${safeBranch}-${env.BUILD_NUMBER}"
                }
            }
        }

        stage('Lint') {
            steps {
                // Etapa `lint` del Dockerfile (oxlint). Los avisos no fallan; los errores si.
                sh 'docker build --target lint -t "$APP_NAME-lint:$SAFE_BRANCH" .'
            }
        }

        stage('Build image') {
            steps {
                sh '''
                    docker build \
                      --build-arg VITE_API_URL="$API_URL" \
                      -t "$IMAGE_TAG" -t "$APP_NAME:$SAFE_BRANCH" \
                      .
                '''
            }
        }

        stage('Deploy') {
            when { branch 'production' }
            steps {
                sh '''
                    docker rm -f "$APP_NAME" || true
                    docker run -d \
                      --name "$APP_NAME" \
                      --restart unless-stopped \
                      -p 127.0.0.1:$DEPLOY_PORT:80 \
                      "$IMAGE_TAG"
                '''
            }
        }

        stage('Health Check') {
            when { branch 'production' }
            steps {
                // nginx:alpine trae wget (busybox) pero no curl; se ejecuta dentro del contenedor
                // porque el 127.0.0.1 de Jenkins no es el del host.
                sh '''
                    for i in $(seq 1 20); do
                      if docker exec "$APP_NAME" wget -qO- http://127.0.0.1/health; then break; fi
                      if [ "$(docker inspect -f '{{.State.Running}}' "$APP_NAME" 2>/dev/null)" != "true" ]; then
                        echo "El contenedor $APP_NAME no esta corriendo"; docker logs --tail 50 "$APP_NAME"; exit 1
                      fi
                      if [ "$i" = 20 ]; then echo "Timeout: $APP_NAME no respondio en 60 s"; docker logs --tail 50 "$APP_NAME"; exit 1; fi
                      sleep 3
                    done
                    # La raiz debe devolver el index.html de la SPA.
                    docker exec "$APP_NAME" wget -qO- http://127.0.0.1/ | grep -q '<div id="root">'
                    curl -fsS -o /dev/null "$PUBLIC_URL/" && echo "$PUBLIC_URL OK" \
                      || echo "AVISO: $PUBLIC_URL no responde; revisar Nginx/Certbot en el servidor"
                '''
            }
        }
    }
}
