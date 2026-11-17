pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
        timestamps()
    }

    stages {
        stage('Checkout') {
            steps { checkout scm }
        }
        stage('Build backend') {
            steps { sh 'mvn -B -f backend/pom.xml -DskipTests package' }
        }
        stage('Tests backend') {
            steps { sh 'mvn -B -f backend/pom.xml test' }
            post {
                always { junit 'backend/target/surefire-reports/TEST-*.xml' }
            }
        }
        stage('Build frontend') {
            steps {
                dir('frontend') {
                    sh 'npm ci'
                    sh 'npm run typecheck'
                    sh 'npm run build'
                }
            }
        }
        stage('Tests frontend') {
            steps {
                dir('frontend') { sh 'npm test -- --watch=false' }
            }
        }
        stage('Vérification des images Docker') {
            steps {
                sh '''
                    # Compose exige une valeur pour interpoler la configuration.
                    # Ces commandes ne démarrent aucune base de données.
                    export POSTGRES_PASSWORD="$BUILD_TAG"
                    docker compose config --quiet
                    docker compose -p parfum-ci-${BUILD_NUMBER} build
                '''
            }
        }
    }
}
